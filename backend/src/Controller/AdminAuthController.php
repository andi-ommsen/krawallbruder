<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminAuthController extends AbstractController
{
    public function __construct(
        #[Autowire(env: 'ADMIN_USERNAME')]
        private string $adminUsername,
        #[Autowire(env: 'ADMIN_PASSWORD')]
        private string $adminPassword,
        #[Autowire(env: 'ADMIN_TOKEN')]
        private string $adminToken
    ) {}

    #[Route('/api/admin/login', name: 'admin_login', methods: ['POST', 'OPTIONS'])]
    public function login(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        }

        $data = json_decode($request->getContent(), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if ($username !== $this->adminUsername || $password !== $this->adminPassword) {
            return new JsonResponse(['error' => 'Ungültige Zugangsdaten.'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse(['token' => $this->adminToken]);
    }
}
