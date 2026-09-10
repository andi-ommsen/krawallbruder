<?php

declare(strict_types=1);

namespace App\Service;

interface TurnstileVerifier
{
    public function verify(string $token, ?string $remoteIp): bool;
}
