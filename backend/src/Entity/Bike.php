<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\BikeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: BikeRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['bike:read']],
    order: ['sortOrder' => 'ASC'],
)]
#[ApiFilter(SearchFilter::class, properties: ['slug' => 'exact'])]
class Bike
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['bike:read', 'blog_post:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['bike:read', 'blog_post:read', 'video:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['bike:read', 'blog_post:read', 'video:read'])]
    private ?string $slug = null;

    #[ORM\Column]
    #[Groups(['bike:read'])]
    private ?int $year = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['bike:read'])]
    private ?string $description = null;

    #[ORM\Column(length: 512, nullable: true)]
    #[Groups(['bike:read', 'blog_post:read'])]
    private ?string $featuredImage = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['bike:read'])]
    private ?array $technicalData = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['bike:read'])]
    private ?array $gallery = null;

    #[ORM\Column(options: ['default' => 0])]
    #[Groups(['bike:read'])]
    private int $sortOrder = 0;

    #[ORM\OneToMany(targetEntity: BlogPost::class, mappedBy: 'bike')]
    private Collection $blogPosts;

    #[ORM\OneToMany(targetEntity: YouTubeVideo::class, mappedBy: 'bike')]
    private Collection $youTubeVideos;

    public function __construct()
    {
        $this->blogPosts = new ArrayCollection();
        $this->youTubeVideos = new ArrayCollection();
    }

    public function getId(): ?Uuid { return $this->id; }
    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }
    public function getSlug(): ?string { return $this->slug; }
    public function setSlug(string $slug): static { $this->slug = $slug; return $this; }
    public function getYear(): ?int { return $this->year; }
    public function setYear(int $year): static { $this->year = $year; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(string $description): static { $this->description = $description; return $this; }
    public function getFeaturedImage(): ?string { return $this->featuredImage; }
    public function setFeaturedImage(?string $featuredImage): static { $this->featuredImage = $featuredImage; return $this; }
    public function getTechnicalData(): ?array { return $this->technicalData; }
    public function setTechnicalData(?array $technicalData): static { $this->technicalData = $technicalData; return $this; }
    public function getGallery(): ?array { return $this->gallery; }
    public function setGallery(?array $gallery): static { $this->gallery = $gallery; return $this; }
    public function getSortOrder(): int { return $this->sortOrder; }
    public function setSortOrder(int $sortOrder): static { $this->sortOrder = $sortOrder; return $this; }

    public function getBlogPosts(): Collection { return $this->blogPosts; }
    public function getYouTubeVideos(): Collection { return $this->youTubeVideos; }
}
