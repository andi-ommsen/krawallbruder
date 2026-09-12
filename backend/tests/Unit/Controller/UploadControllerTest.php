<?php

declare(strict_types=1);

namespace App\Tests\Unit\Controller;

use App\Controller\UploadController;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\String\Slugger\AsciiSlugger;

final class UploadControllerTest extends TestCase
{
    private const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

    private UploadController $controller;

    protected function setUp(): void
    {
        $this->controller = new UploadController('/uploads', 'https://example.test');
    }

    public function testImageAtEightMiBIsAccepted(): void
    {
        $response = $this->upload(self::MAX_UPLOAD_SIZE);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertMatchesRegularExpression(
            '#^https://example\.test/uploads/upload-[a-f0-9]{16}\.png$#',
            json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR)['url'],
        );
    }

    public function testImageLargerThanEightMiBIsRejected(): void
    {
        $response = $this->upload(self::MAX_UPLOAD_SIZE + 1);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());
        self::assertSame(
            'Datei zu groß (max. 8 MB).',
            json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR)['error'],
        );
    }

    private function upload(int $size): Response
    {
        $request = new Request(files: ['file' => $this->uploadedImage($size)]);

        return $this->controller->upload($request, new AsciiSlugger());
    }

    private function uploadedImage(int $size): UploadedFile
    {
        return new class(__FILE__, $size) extends UploadedFile {
            public function __construct(string $path, private int $size)
            {
                parent::__construct($path, 'upload.png', 'image/png', test: true);
            }

            public function getSize(): int
            {
                return $this->size;
            }

            public function getMimeType(): ?string
            {
                return 'image/png';
            }

            public function getPathname(): string
            {
                return 'data://application/octet-stream;base64,iVBORw0KGgo=';
            }

            public function move(string $directory, ?string $name = null): File
            {
                return new File(__FILE__);
            }
        };
    }
}
