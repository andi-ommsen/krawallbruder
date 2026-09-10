<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Tests\Functional\Support\ApiTestCase;
use App\Tests\Functional\Support\FixtureFactory;
use Symfony\Component\HttpFoundation\Response;

final class PublicResourceTest extends ApiTestCase
{
    public function testPublicCollectionsExposeTheApiPlatformFourContractWithoutAuthentication(): void
    {
        $bike = FixtureFactory::createBike($this->entityManager, 'public-resource-bike');
        FixtureFactory::createBlogPost($this->entityManager, 'public-resource-post', $bike);
        FixtureFactory::createYouTubeVideo($this->entityManager, $bike);
        FixtureFactory::createAboutPage($this->entityManager);

        foreach (['/api/bikes', '/api/blog_posts', '/api/you_tube_videos', '/api/about_pages'] as $uri) {
            $response = $this->jsonRequest('GET', $uri, null, ['HTTP_ACCEPT' => 'application/ld+json']);

            self::assertSame(Response::HTTP_OK, $response->getStatusCode(), $uri);
            $collection = $this->json($response);
            self::assertArrayHasKey('member', $collection, $uri);
            self::assertArrayHasKey('totalItems', $collection, $uri);
            self::assertArrayNotHasKey('hydra:member', $collection, $uri);
        }
    }

    public function testSlugBikeSlugAndPaginationFiltersReturnOnlyMatchingItems(): void
    {
        $matchingBike = FixtureFactory::createBike($this->entityManager, 'matching-bike');
        $otherBike = FixtureFactory::createBike($this->entityManager, 'other-bike');
        FixtureFactory::createBlogPost($this->entityManager, 'matching-post-one', $matchingBike);
        FixtureFactory::createBlogPost($this->entityManager, 'matching-post-two', $matchingBike);
        FixtureFactory::createBlogPost($this->entityManager, 'other-post', $otherBike);

        $bikeResponse = $this->jsonRequest('GET', '/api/bikes?slug=matching-bike', null, ['HTTP_ACCEPT' => 'application/ld+json']);
        self::assertSame(Response::HTTP_OK, $bikeResponse->getStatusCode());
        self::assertSame(1, $this->json($bikeResponse)['totalItems']);
        self::assertSame('matching-bike', $this->json($bikeResponse)['member'][0]['slug']);

        $blogResponse = $this->jsonRequest('GET', '/api/blog_posts?bike.slug=matching-bike', null, ['HTTP_ACCEPT' => 'application/ld+json']);
        self::assertSame(Response::HTTP_OK, $blogResponse->getStatusCode());
        self::assertSame(2, $this->json($blogResponse)['totalItems']);
        foreach ($this->json($blogResponse)['member'] as $post) {
            self::assertStringStartsWith('matching-post-', $post['slug']);
        }

        $paginationResponse = $this->jsonRequest('GET', '/api/blog_posts?itemsPerPage=1&page=2', null, ['HTTP_ACCEPT' => 'application/ld+json']);
        self::assertSame(Response::HTTP_OK, $paginationResponse->getStatusCode());
        self::assertSame(3, $this->json($paginationResponse)['totalItems']);
        self::assertCount(1, $this->json($paginationResponse)['member']);
    }
}
