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

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($file->getMimeType(), $allowedMimes, true)) {
            return new JsonResponse(['error' => 'Nur Bilder erlaubt (JPG, PNG, WebP, GIF).'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($file->getSize() > 10 * 1024 * 1024) {
            return new JsonResponse(['error' => 'Datei zu groß (max. 10 MB).'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalName)->lower();
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }

        $file->move($this->uploadDir, $newFilename);

        $url = rtrim($this->baseUrl, '/') . '/uploads/' . $newFilename;

        return new JsonResponse(['url' => $url]);
    }
}
