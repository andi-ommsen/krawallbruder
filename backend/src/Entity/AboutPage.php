<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Put;
use App\Repository\AboutPageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: AboutPageRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['about:read']],
)]
class AboutPage
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['about:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['about:read'])]
    private ?string $content = null;

    #[ORM\Column(length: 512, nullable: true)]
    #[Groups(['about:read'])]
    private ?string $profileImage = null;

    /** JSON: {"touren": 42, "km": 35000, "laender": 8} */
    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['about:read'])]
    private ?array $stats = null;

    public function getId(): ?Uuid { return $this->id; }
    public function getContent(): ?string { return $this->content; }
    public function setContent(string $content): static { $this->content = $content; return $this; }
    public function getProfileImage(): ?string { return $this->profileImage; }
    public function setProfileImage(?string $profileImage): static { $this->profileImage = $profileImage; return $this; }
    public function getStats(): ?array { return $this->stats; }
    public function setStats(?array $stats): static { $this->stats = $stats; return $this; }
}
