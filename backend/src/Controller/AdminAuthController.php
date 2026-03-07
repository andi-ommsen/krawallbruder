<?php

namespace App\Controller;

use Psr\Cache\CacheItemPoolInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminAuthController extends AbstractController
{
    private const MAX_ATTEMPTS = 10;
    private const LOCKOUT_SECONDS = 300; // 5 minutes

    public function __construct(
        #[Autowire(env: 'ADMIN_USERNAME')]
        private string $adminUsername,
        #[Autowire(env: 'ADMIN_PASSWORD')]
        private string $adminPassword,
        #[Autowire(env: 'ADMIN_TOKEN')]
        private string $adminToken,
        private CacheItemPoolInterface $cache,
    ) {}

    #[Route('/api/admin/login', name: 'admin_login', methods: ['POST', 'OPTIONS'])]
    public function login(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        }

        $ip = $request->getClientIp() ?? 'unknown';
        $cacheKey = 'login_fails_' . md5($ip);

        $item = $this->cache->getItem($cacheKey);
        $attempts = $item->isHit() ? (int) $item->get() : 0;

        if ($attempts >= self::MAX_ATTEMPTS) {
            return new JsonResponse(
                ['error' => 'Zu viele Fehlversuche. Bitte 5 Minuten warten.'],
                Response::HTTP_TOO_MANY_REQUESTS
            );
        }

        $data     = json_decode($request->getContent(), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if (!hash_equals($this->adminUsername, $username) || !hash_equals($this->adminPassword, $password)) {
            $item->set($attempts + 1)->expiresAfter(self::LOCKOUT_SECONDS);
            $this->cache->save($item);

            return new JsonResponse(['error' => 'Ungültige Zugangsdaten.'], Response::HTTP_UNAUTHORIZED);
        }

        // Successful login – clear the counter
        $this->cache->deleteItem($cacheKey);

        return new JsonResponse(['token' => $this->adminToken]);
    }
}
