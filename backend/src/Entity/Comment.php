<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\CommentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: CommentRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['comment:read']],
    order: ['createdAt' => 'ASC'],
)]
#[ApiFilter(SearchFilter::class, properties: ['blogPost' => 'exact'])]
class Comment
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['comment:read'])]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(targetEntity: BlogPost::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['comment:read'])]
    private ?BlogPost $blogPost = null;

    #[ORM\Column(length: 100)]
    #[Groups(['comment:read'])]
    private ?string $authorName = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['comment:read'])]
    private ?string $content = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['comment:read'])]
    private ?\DateTimeInterface $createdAt = null;

    public function getId(): ?Uuid { return $this->id; }
    public function getBlogPost(): ?BlogPost { return $this->blogPost; }
    public function setBlogPost(?BlogPost $blogPost): static { $this->blogPost = $blogPost; return $this; }
    public function getAuthorName(): ?string { return $this->authorName; }
    public function setAuthorName(string $authorName): static { $this->authorName = $authorName; return $this; }
    public function getContent(): ?string { return $this->content; }
    public function setContent(string $content): static { $this->content = $content; return $this; }
    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }
    public function setCreatedAt(\DateTimeInterface $createdAt): static { $this->createdAt = $createdAt; return $this; }
}
