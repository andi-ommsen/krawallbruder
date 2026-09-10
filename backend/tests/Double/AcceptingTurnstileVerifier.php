<?php

declare(strict_types=1);

namespace App\Tests\Double;

use App\Service\TurnstileVerifier;

final class AcceptingTurnstileVerifier implements TurnstileVerifier
{
    public function verify(string $token, ?string $remoteIp): bool
    {
        return true;
    }
}
