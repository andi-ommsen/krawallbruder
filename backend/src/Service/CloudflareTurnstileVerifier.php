<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class CloudflareTurnstileVerifier implements TurnstileVerifier
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        #[Autowire(env: 'TURNSTILE_SECRET_KEY')]
        private readonly string $secret,
    ) {
    }

    public function verify(string $token, ?string $remoteIp): bool
    {
        try {
            $response = $this->httpClient->request('POST', self::VERIFY_URL, [
                'body' => [
                    'secret' => $this->secret,
                    'response' => $token,
                    'remoteip' => $remoteIp,
                ],
                'timeout' => 5.0,
            ]);

            return (bool) ($response->toArray(false)['success'] ?? false);
        } catch (DecodingExceptionInterface | TransportExceptionInterface) {
            return false;
        }
    }
}
