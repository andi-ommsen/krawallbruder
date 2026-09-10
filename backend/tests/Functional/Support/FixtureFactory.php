<?php

declare(strict_types=1);

namespace App\Tests\Functional\Support;

use App\Entity\AboutPage;
use App\Entity\Bike;
use App\Entity\BlogPost;
use App\Entity\YouTubeVideo;
use Doctrine\ORM\EntityManagerInterface;

final class FixtureFactory
{
    public static function createBike(EntityManagerInterface $entityManager, string $slug): Bike
    {
        $bike = (new Bike())
            ->setName(ucwords(str_replace('-', ' ', $slug)))
            ->setSlug($slug)
            ->setYear(2024)
            ->setDescription('Test bike '.$slug)
            ->setSortOrder(0);

        $entityManager->persist($bike);
        $entityManager->flush();

        return $bike;
    }

    public static function createBlogPost(
        EntityManagerInterface $entityManager,
        string $slug,
        ?Bike $bike = null,
        bool $published = true,
    ): BlogPost {
        $post = (new BlogPost())
            ->setTitle(ucwords(str_replace('-', ' ', $slug)))
            ->setSlug($slug)
            ->setContent('Test content '.$slug)
            ->setPublishedAt(new \DateTime('2026-01-01T12:00:00+00:00'))
            ->setBike($bike)
            ->setIsPublished($published);

        $entityManager->persist($post);
        $entityManager->flush();

        return $post;
    }

    public static function createYouTubeVideo(EntityManagerInterface $entityManager, Bike $bike): YouTubeVideo
    {
        $video = (new YouTubeVideo())
            ->setTitle('Test video')
            ->setYoutubeUrl('https://www.youtube.com/watch?v=test-video')
            ->setPublishedAt(new \DateTime('2026-01-01T12:00:00+00:00'))
            ->setBike($bike);

        $entityManager->persist($video);
        $entityManager->flush();

        return $video;
    }

    public static function createAboutPage(EntityManagerInterface $entityManager): AboutPage
    {
        $page = (new AboutPage())
            ->setContent('Test about page')
            ->setStats(['touren' => 1]);

        $entityManager->persist($page);
        $entityManager->flush();

        return $page;
    }
}
