<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Tests\Functional\Support\ApiTestCase;
use Symfony\Component\HttpFoundation\Response;

final class AdminWriteAccessTest extends ApiTestCase
{
    public function testBikeWritesRequireTheConfiguredBearerTokenAndArePubliclyVisible(): void
    {
        $createPayload = [
            'name' => 'Admin created bike',
            'slug' => 'admin-created-bike',
            'year' => 2024,
            'description' => 'Created by an authenticated API request.',
            'sortOrder' => 3,
        ];

        $this->assertRejected($this->jsonRequest('POST', '/api/bikes', $createPayload));
        $this->assertRejected($this->jsonRequest('POST', '/api/bikes', $createPayload, [
            'HTTP_AUTHORIZATION' => 'Bearer invalid-token',
        ]));

        $createResponse = $this->jsonRequest('POST', '/api/bikes', $createPayload, $this->bearerToken());
        self::assertSame(Response::HTTP_CREATED, $createResponse->getStatusCode());
        $bikeId = $this->json($createResponse)['id'];

        $publicResponse = $this->jsonRequest('GET', '/api/bikes/'.$bikeId);
        self::assertSame(Response::HTTP_OK, $publicResponse->getStatusCode());
        self::assertSame('admin-created-bike', $this->json($publicResponse)['slug']);

        $replacePayload = array_replace($createPayload, ['name' => 'Replaced bike', 'year' => 2025]);
        $this->assertRejected($this->jsonRequest('PUT', '/api/bikes/'.$bikeId, $replacePayload));
        $this->assertRejected($this->jsonRequest('PUT', '/api/bikes/'.$bikeId, $replacePayload, [
            'HTTP_AUTHORIZATION' => 'Bearer invalid-token',
        ]));
        self::assertSame(Response::HTTP_OK, $this->jsonRequest('PUT', '/api/bikes/'.$bikeId, $replacePayload, $this->bearerToken())->getStatusCode());

        $patchPayload = ['description' => 'Patched by an authenticated API request.'];
        $this->assertRejected($this->jsonRequest('PATCH', '/api/bikes/'.$bikeId, $patchPayload, [], 'application/merge-patch+json'));
        $this->assertRejected($this->jsonRequest('PATCH', '/api/bikes/'.$bikeId, $patchPayload, [
            'HTTP_AUTHORIZATION' => 'Bearer invalid-token',
        ], 'application/merge-patch+json'));
        self::assertSame(Response::HTTP_OK, $this->jsonRequest('PATCH', '/api/bikes/'.$bikeId, $patchPayload, $this->bearerToken(), 'application/merge-patch+json')->getStatusCode());

        $this->assertRejected($this->jsonRequest('DELETE', '/api/bikes/'.$bikeId));
        $this->assertRejected($this->jsonRequest('DELETE', '/api/bikes/'.$bikeId, null, [
            'HTTP_AUTHORIZATION' => 'Bearer invalid-token',
        ]));
        self::assertSame(Response::HTTP_NO_CONTENT, $this->jsonRequest('DELETE', '/api/bikes/'.$bikeId, null, $this->bearerToken())->getStatusCode());
    }
}
