import { Link } from 'react-router-dom'
import './BlogCard.css'

export default function BlogCard({ post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('de-DE', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : ''

  const excerpt = post.excerpt
    ? post.excerpt.substring(0, 150) + (post.excerpt.length > 150 ? '…' : '')
    : ''

  return (
    <article className="blog-card card">
      <Link to={`/blog/${post.slug}`} className="blog-card__image-link">
        <img
          src={post.featuredImage || 'https://picsum.photos/seed/default/800/450'}
          alt={post.title}
          className="blog-card__image"
          loading="lazy"
        />
        {post.category && (
          <span className="blog-card__category tag">{post.category}</span>
        )}
      </Link>

      <div className="blog-card__body">
        <time className="blog-card__date">{date}</time>
        <h3 className="blog-card__title">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {excerpt && <p className="blog-card__excerpt">{excerpt}</p>}

        <div className="blog-card__footer">
          {post.bike && (
            <Link to={`/bikes/${post.bike.slug}`} className="blog-card__bike">
              {post.bike.name}
            </Link>
          )}
          <Link to={`/blog/${post.slug}`} className="btn btn-primary btn-sm">
            Weiterlesen →
          </Link>
        </div>
      </div>
    </article>
  )
}
