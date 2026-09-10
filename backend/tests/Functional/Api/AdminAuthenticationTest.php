<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Tests\Functional\Support\ApiTestCase;
use Symfony\Component\HttpFoundation\Response;

final class AdminAuthenticationTest extends ApiTestCase
{
    public function testCorrectCredentialsReturnOnlyTheConfiguredToken(): void
    {
        $response = $this->jsonRequest('POST', '/api/admin/login', [
            'username' => 'test-admin',
            'password' => 'test-admin-password',
        ]);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame(['token' => 'test-admin-token'], $this->json($response));
    }

    public function testInvalidCredentialsAreRejectedWithoutIdentifyingTheInvalidField(): void
    {
        foreach ([
            ['username' => 'not-test-admin', 'password' => 'test-admin-password'],
            ['username' => 'test-admin', 'password' => 'wrong-password'],
        ] as $credentials) {
            $response = $this->jsonRequest('POST', '/api/admin/login', $credentials);

            self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
            self::assertSame(['error' => 'Ungültige Zugangsdaten.'], $this->json($response));
        }
    }

    public function testEleventhFailedLoginIsRateLimited(): void
    {
        $credentials = ['username' => 'test-admin', 'password' => 'wrong-password'];

        for ($attempt = 0; $attempt < 10; ++$attempt) {
            self::assertSame(Response::HTTP_UNAUTHORIZED, $this->jsonRequest('POST', '/api/admin/login', $credentials)->getStatusCode());
        }

        self::assertSame(Response::HTTP_TOO_MANY_REQUESTS, $this->jsonRequest('POST', '/api/admin/login', $credentials)->getStatusCode());
    }

    public function testSuccessfulLoginClearsFailedLoginCounter(): void
    {
        $invalidCredentials = ['username' => 'test-admin', 'password' => 'wrong-password'];

        for ($attempt = 0; $attempt < 3; ++$attempt) {
            self::assertSame(Response::HTTP_UNAUTHORIZED, $this->jsonRequest('POST', '/api/admin/login', $invalidCredentials)->getStatusCode());
        }

        self::assertSame(Response::HTTP_OK, $this->jsonRequest('POST', '/api/admin/login', [
            'username' => 'test-admin',
            'password' => 'test-admin-password',
        ])->getStatusCode());

        for ($attempt = 0; $attempt < 10; ++$attempt) {
            self::assertSame(Response::HTTP_UNAUTHORIZED, $this->jsonRequest('POST', '/api/admin/login', $invalidCredentials)->getStatusCode());
        }

        self::assertSame(Response::HTTP_TOO_MANY_REQUESTS, $this->jsonRequest('POST', '/api/admin/login', $invalidCredentials)->getStatusCode());
    }

    public function testOptionsRequestIsAccepted(): void
    {
        self::assertSame(Response::HTTP_NO_CONTENT, $this->jsonRequest('OPTIONS', '/api/admin/login')->getStatusCode());
    }
}
