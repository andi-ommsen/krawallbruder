<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\YouTubeVideoRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: YouTubeVideoRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
    ],
    normalizationContext: ['groups' => ['video:read']],
    order: ['publishedAt' => 'DESC'],
)]
#[ApiFilter(SearchFilter::class, properties: ['bike.slug' => 'exact'])]
class YouTubeVideo
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['video:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['video:read'])]
    private ?string $title = null;

    #[ORM\Column(length: 512)]
    #[Groups(['video:read'])]
    private ?string $youtubeUrl = null;

    #[ORM\Column(length: 512, nullable: true)]
    #[Groups(['video:read'])]
    private ?string $thumbnail = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['video:read'])]
    private ?\DateTimeInterface $publishedAt = null;

    #[ORM\ManyToOne(targetEntity: Bike::class, inversedBy: 'youTubeVideos')]
    #[Groups(['video:read'])]
    private ?Bike $bike = null;

    public function getId(): ?Uuid { return $this->id; }
    public function getTitle(): ?string { return $this->title; }
    public function setTitle(string $title): static { $this->title = $title; return $this; }
    public function getYoutubeUrl(): ?string { return $this->youtubeUrl; }
    public function setYoutubeUrl(string $youtubeUrl): static { $this->youtubeUrl = $youtubeUrl; return $this; }
    public function getThumbnail(): ?string { return $this->thumbnail; }
    public function setThumbnail(?string $thumbnail): static { $this->thumbnail = $thumbnail; return $this; }
    public function getPublishedAt(): ?\DateTimeInterface { return $this->publishedAt; }
    public function setPublishedAt(\DateTimeInterface $publishedAt): static { $this->publishedAt = $publishedAt; return $this; }
    public function getBike(): ?Bike { return $this->bike; }
    public function setBike(?Bike $bike): static { $this->bike = $bike; return $this; }
}
