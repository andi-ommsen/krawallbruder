<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use App\Entity\Comment;
use App\Tests\Functional\Support\ApiTestCase;
use App\Tests\Functional\Support\FixtureFactory;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Uid\Uuid;

final class CommentCreationTest extends ApiTestCase
{
    public function testRequiredFieldsAndLengthBoundariesAreValidated(): void
    {
        $post = FixtureFactory::createBlogPost($this->entityManager, 'comment-boundaries');
        $validPayload = $this->commentPayload((string) $post->getId());

        $missingName = $validPayload;
        unset($missingName['authorName']);

        foreach ([
            [$missingName, Response::HTTP_UNPROCESSABLE_ENTITY],
            [array_replace($validPayload, ['authorName' => '   ']), Response::HTTP_UNPROCESSABLE_ENTITY],
            [array_replace($validPayload, ['content' => '']), Response::HTTP_UNPROCESSABLE_ENTITY],
            [array_replace($validPayload, ['captchaToken' => '']), Response::HTTP_UNPROCESSABLE_ENTITY],
            [array_replace($validPayload, ['authorName' => str_repeat('a', 101)]), Response::HTTP_UNPROCESSABLE_ENTITY],
            [array_replace($validPayload, ['content' => str_repeat('c', 2001)]), Response::HTTP_UNPROCESSABLE_ENTITY],
            [array_replace($validPayload, ['authorName' => str_repeat('a', 100)]), Response::HTTP_CREATED],
            [array_replace($validPayload, ['content' => str_repeat('c', 2000)]), Response::HTTP_CREATED],
        ] as $index => [$payload, $expectedStatus]) {
            $response = $this->jsonRequest('POST', '/api/comments', $payload, [
                'REMOTE_ADDR' => '198.51.100.'.($index + 1),
            ]);

            self::assertSame($expectedStatus, $response->getStatusCode());
        }
    }

    public function testHtmlIsRemovedBeforeTheCommentIsPersisted(): void
    {
        $post = FixtureFactory::createBlogPost($this->entityManager, 'sanitized-comment');

        $response = $this->jsonRequest('POST', '/api/comments', $this->commentPayload((string) $post->getId(), [
            'authorName' => '<strong>Alice</strong>',
            'content' => '<p>Hello <em>world</em></p>',
        ]));

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame('Alice', $this->json($response)['authorName']);
        self::assertSame('Hello world', $this->json($response)['content']);

        $commentId = $this->json($response)['id'];
        $this->entityManager->clear();
        $comment = $this->entityManager->getRepository(Comment::class)->find($commentId);

        self::assertInstanceOf(Comment::class, $comment);
        self::assertSame('Alice', $comment->getAuthorName());
        self::assertSame('Hello world', $comment->getContent());
    }

    public function testMissingAndUnpublishedPostsAreNotCommentable(): void
    {
        $unpublishedPost = FixtureFactory::createBlogPost($this->entityManager, 'unpublished-comment-post', null, false);

        foreach ([(string) Uuid::v7(), (string) $unpublishedPost->getId()] as $index => $postId) {
            $response = $this->jsonRequest('POST', '/api/comments', $this->commentPayload($postId), [
                'REMOTE_ADDR' => '203.0.113.'.($index + 1),
            ]);

            self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
        }
    }

    public function testValidCaptchaStoresACommentAndReturnsThePersistedData(): void
    {
        $post = FixtureFactory::createBlogPost($this->entityManager, 'valid-comment');

        $response = $this->jsonRequest('POST', '/api/comments', $this->commentPayload((string) $post->getId()));

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        $responseData = $this->json($response);
        self::assertSame('Test author', $responseData['authorName']);
        self::assertSame('Test comment', $responseData['content']);
        self::assertArrayHasKey('createdAt', $responseData);

        $this->entityManager->clear();
        $comment = $this->entityManager->getRepository(Comment::class)->find($responseData['id']);

        self::assertInstanceOf(Comment::class, $comment);
        self::assertSame('Test author', $comment->getAuthorName());
        self::assertSame('Test comment', $comment->getContent());
        self::assertSame($comment->getCreatedAt()->format(\DateTime::ATOM), $responseData['createdAt']);
        self::assertSame((string) $post->getId(), (string) $comment->getBlogPost()->getId());
    }

    public function testSixthCommentFromTheSameIpIsRateLimited(): void
    {
        $post = FixtureFactory::createBlogPost($this->entityManager, 'rate-limited-comments');
        $payload = $this->commentPayload((string) $post->getId());
        $server = ['REMOTE_ADDR' => '198.51.100.250'];

        for ($request = 0; $request < 5; ++$request) {
            self::assertSame(Response::HTTP_CREATED, $this->jsonRequest('POST', '/api/comments', $payload, $server)->getStatusCode());
        }

        self::assertSame(Response::HTTP_TOO_MANY_REQUESTS, $this->jsonRequest('POST', '/api/comments', $payload, $server)->getStatusCode());
    }

    public function testOptionsRequestIsAccepted(): void
    {
        self::assertSame(Response::HTTP_NO_CONTENT, $this->jsonRequest('OPTIONS', '/api/comments')->getStatusCode());
    }

    /**
     * @param array<string, string> $overrides
     * @return array<string, string>
     */
    private function commentPayload(string $blogPostId, array $overrides = []): array
    {
        return array_replace([
            'authorName' => 'Test author',
            'content' => 'Test comment',
            'blogPostId' => $blogPostId,
            'captchaToken' => 'test-captcha-token',
        ], $overrides);
    }
}
