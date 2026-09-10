<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\CloudflareTurnstileVerifier;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

final class CloudflareTurnstileVerifierTest extends TestCase
{
    #[DataProvider('verificationResponses')]
    public function testVerificationResponseIsInterpretedWithoutNetworkAccess(string $body, bool $expected): void
    {
        $verifier = new CloudflareTurnstileVerifier(
            new MockHttpClient(new MockResponse($body)),
            'turnstile-secret',
        );

        self::assertSame($expected, $verifier->verify('captcha-token', '203.0.113.5'));
    }

    public function testInvalidResponseIsRejected(): void
    {
        $verifier = new CloudflareTurnstileVerifier(
            new MockHttpClient(new MockResponse('{not-json')),
            'turnstile-secret',
        );

        self::assertFalse($verifier->verify('captcha-token', null));
    }

    public function testTransportFailureIsRejected(): void
    {
        $verifier = new CloudflareTurnstileVerifier(
            new MockHttpClient(new MockResponse('', ['error' => 'Request timed out'])),
            'turnstile-secret',
        );

        self::assertFalse($verifier->verify('captcha-token', null));
    }

    /** @return iterable<string, array{string, bool}> */
    public static function verificationResponses(): iterable
    {
        yield 'accepted captcha' => ['{"success":true}', true];
        yield 'rejected captcha' => ['{"success":false}', false];
    }
}
