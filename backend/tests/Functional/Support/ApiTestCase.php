<?php

declare(strict_types=1);

namespace App\Tests\Functional\Support;

use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

abstract class ApiTestCase extends WebTestCase
{
    protected KernelBrowser $client;
    protected EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = static::createClient();
        $container = static::getContainer();
        $this->entityManager = $container->get(EntityManagerInterface::class);

        foreach (['cache.app', 'cache.rate_limiter'] as $serviceId) {
            if (!$container->has($serviceId)) {
                continue;
            }

            $cache = $container->get($serviceId);
            if ($cache instanceof CacheItemPoolInterface) {
                $cache->clear();
            }
        }
    }

    protected function tearDown(): void
    {
        $this->entityManager->clear();

        parent::tearDown();
    }

    /**
     * @param array<string, mixed>|null $payload
     * @param array<string, string> $server
     */
    protected function jsonRequest(
        string $method,
        string $uri,
        ?array $payload = null,
        array $server = [],
        string $contentType = 'application/json',
    ): Response {
        $this->client->request(
            $method,
            $uri,
            [],
            [],
            array_replace([
                'CONTENT_TYPE' => $contentType,
                'HTTP_ACCEPT' => 'application/json',
                'REMOTE_ADDR' => '127.0.0.1',
            ], $server),
            $payload === null ? '' : json_encode($payload, JSON_THROW_ON_ERROR),
        );

        return $this->client->getResponse();
    }

    /** @return array<string, mixed> */
    protected function json(Response $response): array
    {
        return json_decode((string) $response->getContent(), true, 512, JSON_THROW_ON_ERROR);
    }

    /** @return array<string, string> */
    protected function bearerToken(): array
    {
        return ['HTTP_AUTHORIZATION' => 'Bearer test-admin-token'];
    }

    protected function assertRejected(Response $response): void
    {
        self::assertContains($response->getStatusCode(), [Response::HTTP_UNAUTHORIZED, Response::HTTP_FORBIDDEN]);
    }
}
