<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use App\Repository\BlogPostRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: BlogPostRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['blog_post:read']],
    order: ['publishedAt' => 'DESC'],
)]
#[ApiFilter(SearchFilter::class, properties: [
    'category' => 'partial',
    'bike.slug' => 'exact',
    'title' => 'partial',
])]
#[ApiFilter(OrderFilter::class, properties: ['publishedAt'])]
class BlogPost
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['blog_post:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['blog_post:read', 'comment:read'])]
    private ?string $title = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['blog_post:read', 'comment:read'])]
    private ?string $slug = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['blog_post:read'])]
    private ?string $excerpt = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['blog_post:read'])]
    private ?string $content = null;

    #[ORM\Column(length: 512, nullable: true)]
    #[Groups(['blog_post:read'])]
    private ?string $featuredImage = null;

    #[ORM\Column(length: 512, nullable: true)]
    #[Groups(['blog_post:read'])]
    private ?string $youtubeUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['blog_post:read'])]
    private ?\DateTimeInterface $publishedAt = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['blog_post:read'])]
    private ?string $category = null;

    #[ORM\ManyToOne(targetEntity: Bike::class, inversedBy: 'blogPosts')]
    #[Groups(['blog_post:read'])]
    private ?Bike $bike = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['blog_post:read'])]
    private ?array $images = null;

    #[ORM\Column(options: ['default' => true])]
    #[Groups(['blog_post:read'])]
    private bool $isPublished = true;

    public function getId(): ?Uuid { return $this->id; }
    public function getTitle(): ?string { return $this->title; }
    public function setTitle(string $title): static { $this->title = $title; return $this; }
    public function getSlug(): ?string { return $this->slug; }
    public function setSlug(string $slug): static { $this->slug = $slug; return $this; }
    public function getExcerpt(): ?string { return $this->excerpt; }
    public function setExcerpt(?string $excerpt): static { $this->excerpt = $excerpt; return $this; }
    public function getContent(): ?string { return $this->content; }
    public function setContent(string $content): static { $this->content = $content; return $this; }
    public function getFeaturedImage(): ?string { return $this->featuredImage; }
    public function setFeaturedImage(?string $featuredImage): static { $this->featuredImage = $featuredImage; return $this; }
    public function getYoutubeUrl(): ?string { return $this->youtubeUrl; }
    public function setYoutubeUrl(?string $youtubeUrl): static { $this->youtubeUrl = $youtubeUrl; return $this; }
    public function getPublishedAt(): ?\DateTimeInterface { return $this->publishedAt; }
    public function setPublishedAt(\DateTimeInterface $publishedAt): static { $this->publishedAt = $publishedAt; return $this; }
    public function getCategory(): ?string { return $this->category; }
    public function setCategory(?string $category): static { $this->category = $category; return $this; }
    public function getBike(): ?Bike { return $this->bike; }
    public function setBike(?Bike $bike): static { $this->bike = $bike; return $this; }
    public function getImages(): ?array { return $this->images; }
    public function setImages(?array $images): static { $this->images = $images; return $this; }
    public function isPublished(): bool { return $this->isPublished; }
    public function setIsPublished(bool $isPublished): static { $this->isPublished = $isPublished; return $this; }
}
