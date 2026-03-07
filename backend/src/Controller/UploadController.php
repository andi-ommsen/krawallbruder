<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

class UploadController extends AbstractController
{
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    private const MAGIC_BYTES = [
        'jpg'  => ["\xFF\xD8\xFF"],
        'jpeg' => ["\xFF\xD8\xFF"],
        'png'  => ["\x89PNG\r\n\x1a\n"],
        'gif'  => ["GIF87a", "GIF89a"],
        'webp' => ['RIFF'], // extra check: bytes 8–11 must be "WEBP"
    ];

    public function __construct(
        #[Autowire('%kernel.project_dir%/public/uploads')]
        private string $uploadDir,
        #[Autowire('%env(APP_BASE_URL)%')]
        private string $baseUrl,
    ) {}

    #[Route('/api/admin/upload', name: 'admin_upload', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function upload(Request $request, SluggerInterface $slugger): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['error' => 'Keine Datei übermittelt.'], Response::HTTP_BAD_REQUEST);
        }

        if ($file->getSize() > 10 * 1024 * 1024) {
            return new JsonResponse(['error' => 'Datei zu groß (max. 10 MB).'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Validate extension against explicit whitelist
        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, self::ALLOWED_EXTENSIONS, true)) {
            return new JsonResponse(['error' => 'Nur Bilder erlaubt (JPG, PNG, WebP, GIF).'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Validate MIME type reported by PHP
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($file->getMimeType(), $allowedMimes, true)) {
            return new JsonResponse(['error' => 'Ungültiger Dateityp.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Validate actual file content via magic bytes
        if (!$this->hasValidMagicBytes($file->getPathname(), $ext)) {
            return new JsonResponse(['error' => 'Dateiinhalt stimmt nicht mit dem Typ überein.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalName)->lower();
        $newFilename  = $safeFilename . '-' . bin2hex(random_bytes(8)) . '.' . $ext;

        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }

        $file->move($this->uploadDir, $newFilename);

        $url = rtrim($this->baseUrl, '/') . '/uploads/' . $newFilename;

        return new JsonResponse(['url' => $url]);
    }

    private function hasValidMagicBytes(string $path, string $ext): bool
    {
        $fh = @fopen($path, 'rb');
        if ($fh === false) {
            return false;
        }
        $magic = fread($fh, 12);
        fclose($fh);

        foreach (self::MAGIC_BYTES[$ext] ?? [] as $signature) {
            if (str_starts_with($magic, $signature)) {
                if ($ext === 'webp') {
                    // RIFF....WEBP — bytes 8–11 must spell "WEBP"
                    return substr($magic, 8, 4) === 'WEBP';
                }
                return true;
            }
        }

        return false;
    }
}
