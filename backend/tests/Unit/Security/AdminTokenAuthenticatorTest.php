<?php

declare(strict_types=1);

namespace App\Tests\Unit\Security;

use App\Security\AdminTokenAuthenticator;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

final class AdminTokenAuthenticatorTest extends TestCase
{
    private AdminTokenAuthenticator $authenticator;

    protected function setUp(): void
    {
        $this->authenticator = new AdminTokenAuthenticator('expected-token');
    }

    public function testMissingOrMalformedAuthorizationHeaderIsNotSupported(): void
    {
        self::assertFalse($this->authenticator->supports(new Request()));
        self::assertFalse($this->authenticator->supports(new Request(server: ['HTTP_AUTHORIZATION' => 'Token expected-token'])));
    }

    public function testIncorrectBearerTokenIsRejected(): void
    {
        $this->expectException(CustomUserMessageAuthenticationException::class);
        $this->expectExceptionMessage('Ungültiges Token.');

        $this->authenticator->authenticate(new Request(server: ['HTTP_AUTHORIZATION' => 'Bearer incorrect-token']));
    }

    public function testCorrectBearerTokenAuthenticatesTheAdminUser(): void
    {
        $passport = $this->authenticator->authenticate(new Request(server: ['HTTP_AUTHORIZATION' => 'Bearer expected-token']));
        $badge = $passport->getBadge(UserBadge::class);

        self::assertInstanceOf(UserBadge::class, $badge);
        self::assertSame('admin', $badge->getUserIdentifier());
    }
}
