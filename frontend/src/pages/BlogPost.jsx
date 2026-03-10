import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { fetchBlogPost, fetchBlogPosts, fetchComments, postComment } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import './BlogPost.css'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

function CommentSection({ postId }) {
  const [comments, setComments] = useState([])
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState(null)
  const turnstileRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    fetchComments(postId)
      .then((res) => setComments(res.data['hydra:member'] || []))
      .catch(() => {})
  }, [postId])

  useEffect(() => {
    if (!turnstileRef.current) return
    const render = () => {
      if (window.turnstile && turnstileRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
        })
      }
    }
    if (window.turnstile) {
      render()
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          render()
          clearInterval(interval)
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    const token = window.turnstile?.getResponse(widgetIdRef.current) || ''
    if (!token) {
      setFormError('Bitte das Captcha bestätigen.')
      return
    }

    setSubmitting(true)
    try {
      const res = await postComment({ authorName, content, blogPostId: postId, captchaToken: token })
      setComments((prev) => [...prev, res.data])
      setAuthorName('')
      setContent('')
      setSuccess(true)
      window.turnstile?.reset(widgetIdRef.current)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      const msg = err.response?.data?.error || 'Fehler beim Senden. Bitte erneut versuchen.'
      setFormError(msg)
      window.turnstile?.reset(widgetIdRef.current)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="blog-comments">
      <h2 className="blog-comments__title">Kommentare ({comments.length})</h2>

      {comments.length > 0 && (
        <ul className="blog-comments__list">
          {comments.map((c) => (
            <li key={c['@id'] || c.id} className="blog-comment">
              <div className="blog-comment__meta">
                <span className="blog-comment__author">{c.authorName}</span>
                <time className="blog-comment__date">
                  {new Date(c.createdAt).toLocaleDateString('de-DE', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </time>
              </div>
              <p className="blog-comment__text">{DOMPurify.sanitize(c.content)}</p>
            </li>
          ))}
        </ul>
      )}

      <form className="blog-comments__form" onSubmit={handleSubmit}>
        <h3 className="blog-comments__form-title">Kommentar schreiben</h3>

        {success && (
          <div className="blog-comments__success">Kommentar wurde veröffentlicht!</div>
        )}
        {formError && (
          <div className="blog-comments__error">{formError}</div>
        )}

        <div className="blog-comments__field">
          <label htmlFor="comment-author">Dein Name</label>
          <input
            id="comment-author"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={100}
            required
            placeholder="Max Mustermann"
          />
        </div>

        <div className="blog-comments__field">
          <label htmlFor="comment-content">Kommentar</label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            required
            rows={5}
            placeholder="Dein Kommentar…"
          />
        </div>

        <div ref={turnstileRef} className="blog-comments__captcha" />

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Wird gesendet…' : 'Kommentar abschicken'}
        </button>
      </form>
    </section>
  )
}

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

  const postId = post['@id'] ? post['@id'].split('/').pop() : post.id

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

          {/* Kommentare */}
          <CommentSection postId={postId} />

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
