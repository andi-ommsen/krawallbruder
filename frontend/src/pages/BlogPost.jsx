import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { fetchBlogPost, fetchBlogPosts } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import './BlogPost.css'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [prevNext, setPrevNext] = useState({ prev: null, next: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchBlogPost(slug)
      .then((res) => {
        const members = res.data['hydra:member'] || []
        if (members.length === 0) {
          setError('Beitrag nicht gefunden.')
          return
        }
        setPost(members[0])
      })
      .catch(() => setError('Beitrag konnte nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    // Vorherigen und nächsten Beitrag laden
    fetchBlogPosts({ itemsPerPage: 100 })
      .then((res) => {
        const all = res.data['hydra:member'] || []
        const idx = all.findIndex((p) => p.slug === slug)
        setPrevNext({
          prev: idx > 0 ? all[idx - 1] : null,
          next: idx < all.length - 1 ? all[idx + 1] : null,
        })
      })
      .catch(() => {})
  }, [slug])

  if (loading) return <div className="page-loading">Lade Beitrag…</div>
  if (error) return <div className="container"><div className="error-message">{error}</div></div>
  if (!post) return null

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('de-DE', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <article className="blog-post">
      {/* Hero */}
      <div className="blog-post__hero">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="blog-post__hero-img"
          />
        )}
        <div className="blog-post__hero-overlay">
          <div className="container blog-post__hero-content">
            {post.category && <span className="tag">{post.category}</span>}
            <h1 className="blog-post__title">{post.title}</h1>
            <div className="blog-post__meta">
              <time>{date}</time>
              {post.bike && (
                <>
                  <span className="blog-post__meta-sep">·</span>
                  <Link to={`/bikes/${post.bike.slug}`} className="blog-post__bike-link">
                    {post.bike.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inhalt */}
      <div className="container blog-post__layout">
        <div className="blog-post__main">
          {/* Rich-Text-Inhalt */}
          <div
            className="blog-content blog-post__content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          {/* Eingebettetes YouTube-Video */}
          {post.youtubeUrl && (
            <div className="blog-post__video">
              <VideoPlayer url={post.youtubeUrl} title="Video zur Tour" />
            </div>
          )}

          {/* Bildergalerie */}
          {post.images && post.images.length > 0 && (
            <div className="blog-post__gallery">
              <h2>Bildergalerie</h2>
              <div className="blog-post__gallery-grid">
                {post.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Bild ${i + 1} zur Tour`}
                    loading="lazy"
                    className="blog-post__gallery-img"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="blog-post__share">
            <button onClick={handleCopyLink} className="btn btn-outline">
              🔗 Link kopieren
            </button>
          </div>

          {/* Navigation */}
          <nav className="blog-post__navigation">
            {prevNext.prev && (
              <Link to={`/blog/${prevNext.prev.slug}`} className="blog-post__nav-link blog-post__nav-link--prev">
                <span className="blog-post__nav-label">← Vorheriger Beitrag</span>
                <span className="blog-post__nav-title">{prevNext.prev.title}</span>
              </Link>
            )}
            {prevNext.next && (
              <Link to={`/blog/${prevNext.next.slug}`} className="blog-post__nav-link blog-post__nav-link--next">
                <span className="blog-post__nav-label">Nächster Beitrag →</span>
                <span className="blog-post__nav-title">{prevNext.next.title}</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </article>
  )
}
