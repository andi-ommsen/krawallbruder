<?php

namespace App\Controller;

use App\Entity\BlogPost;
use App\Entity\Comment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

class CommentController extends AbstractController
{
    public function __construct(
        #[Autowire(env: 'TURNSTILE_SECRET_KEY')]
        private string $turnstileSecret,
    ) {}

    #[Route('/api/comments', name: 'comment_create', methods: ['POST', 'OPTIONS'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        RateLimiterFactory $commentLimiter,
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        }

        // Rate limiting: 5 Kommentare pro IP in 10 Minuten
        $limiter = $commentLimiter->create($request->getClientIp() ?? 'unknown');
        if (!$limiter->consume(1)->isAccepted()) {
            return new JsonResponse(
                ['error' => 'Zu viele Kommentare. Bitte warte kurz.'],
                Response::HTTP_TOO_MANY_REQUESTS
            );
        }

        $data = json_decode($request->getContent(), true) ?? [];

        // Pflichtfelder prüfen
        $captchaToken = trim((string) ($data['captchaToken'] ?? ''));
        $authorName   = strip_tags(trim((string) ($data['authorName'] ?? '')));
        $content      = strip_tags(trim((string) ($data['content'] ?? '')));
        $blogPostId   = trim((string) ($data['blogPostId'] ?? ''));

        if ($authorName === '' || $content === '' || $blogPostId === '' || $captchaToken === '') {
            return new JsonResponse(['error' => 'Alle Felder sind erforderlich.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Längenvalidierung
        if (mb_strlen($authorName) > 100) {
            return new JsonResponse(['error' => 'Name ist zu lang (max. 100 Zeichen).'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        if (mb_strlen($content) > 2000) {
            return new JsonResponse(['error' => 'Kommentar ist zu lang (max. 2000 Zeichen).'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Turnstile-Verifizierung
        if (!$this->verifyTurnstile($captchaToken, $request->getClientIp())) {
            return new JsonResponse(['error' => 'Captcha ungültig. Bitte erneut versuchen.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // BlogPost laden
        $blogPost = $em->getRepository(BlogPost::class)->find($blogPostId);
        if (!$blogPost || !$blogPost->isPublished()) {
            return new JsonResponse(['error' => 'Blog-Post nicht gefunden.'], Response::HTTP_NOT_FOUND);
        }

        // Kommentar speichern
        $comment = (new Comment())
            ->setBlogPost($blogPost)
            ->setAuthorName($authorName)
            ->setContent($content)
            ->setCreatedAt(new \DateTime());

        $em->persist($comment);
        $em->flush();

        return new JsonResponse([
            'id'         => (string) $comment->getId(),
            'authorName' => $comment->getAuthorName(),
            'content'    => $comment->getContent(),
            'createdAt'  => $comment->getCreatedAt()->format(\DateTime::ATOM),
        ], Response::HTTP_CREATED);
    }

    private function verifyTurnstile(string $token, ?string $ip): bool
    {
        // Test-Secret-Key: immer gültig (für Entwicklung)
        if ($this->turnstileSecret === '1x0000000000000000000000000000000AA') {
            return true;
        }

        $context = stream_context_create([
            'http' => [
                'method'  => 'POST',
                'header'  => 'Content-Type: application/x-www-form-urlencoded',
                'content' => http_build_query([
                    'secret'   => $this->turnstileSecret,
                    'response' => $token,
                    'remoteip' => $ip,
                ]),
                'timeout' => 5,
            ],
        ]);

        $result = @file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, $context);
        if ($result === false) {
            return false;
        }

        $json = json_decode($result, true);
        return (bool) ($json['success'] ?? false);
    }
}
