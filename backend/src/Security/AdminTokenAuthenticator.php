<?php

namespace App\Security;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\User\InMemoryUser;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class AdminTokenAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        #[Autowire(env: 'ADMIN_TOKEN')]
        private string $adminToken
    ) {}

    public function supports(Request $request): ?bool
    {
        $auth = $request->headers->get('Authorization', '');
        return str_starts_with($auth, 'Bearer ');
    }

    public function authenticate(Request $request): Passport
    {
        $auth = $request->headers->get('Authorization', '');
        $token = substr($auth, 7);

        if ($token !== $this->adminToken) {
            throw new CustomUserMessageAuthenticationException('Ungültiges Token.');
        }

        return new SelfValidatingPassport(
            new UserBadge('admin', fn() => new InMemoryUser('admin', null, ['ROLE_ADMIN']))
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['error' => $exception->getMessage()], Response::HTTP_UNAUTHORIZED);
    }
}
