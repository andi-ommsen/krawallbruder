import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBlogPosts, fetchBikes, fetchYouTubeVideos, fetchAboutPage } from '../services/api'
import './Home.css'

function getYouTubeId(url) {
  if (!url) return ''
  const m = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)
  return m ? m[1] : ''
}

function stripHtml(html) {
  return html?.replace(/<[^>]+>/g, '') ?? ''
}

export default function Home() {
  const [featuredPost, setFeaturedPost] = useState(null)
  const [morePosts, setMorePosts] = useState([])
  const [featuredBike, setFeaturedBike] = useState(null)
  const [featuredVideo, setFeaturedVideo] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchBlogPosts({ itemsPerPage: 4 }),
      fetchBikes(),
      fetchYouTubeVideos({ itemsPerPage: 1 }),
      fetchAboutPage(),
    ])
      .then(([postsRes, bikesRes, videosRes, aboutRes]) => {
        const postList = postsRes.data['hydra:member'] || []
        setFeaturedPost(postList[0] || null)
        setMorePosts(postList.slice(1, 4))
        setFeaturedBike((bikesRes.data['hydra:member'] || [])[0] || null)
        setFeaturedVideo((videosRes.data['hydra:member'] || [])[0] || null)
        const about = (aboutRes.data['hydra:member'] || [])[0]
        setStats(about?.stats || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home">

      {/* ── Section 1: Featured Tour ── */}
      {!loading && featuredPost && (
        <section className="hs">
          <div className="hs__image">
            <img
              src={featuredPost.featuredImage || 'https://picsum.photos/seed/road-moto/900/700'}
              alt={featuredPost.title}
              loading="eager"
            />
          </div>
          <div className="hs__body">
            <span className="hs__label">Touren</span>
            <h2 className="hs__title">{featuredPost.title}</h2>
            {featuredPost.excerpt && (
              <p className="hs__text">{featuredPost.excerpt}</p>
            )}
            <Link to={`/touren/${featuredPost.slug}`} className="hs__cta">
              Weiterlesen →
            </Link>
            <Link to="/touren" className="hs__sub">Alle Touren ansehen</Link>
          </div>
        </section>
      )}

      {/* ── Section 2: Featured Bike (reversed) ── */}
      {!loading && featuredBike && (
        <section className="hs hs--reverse">
          <div className="hs__body">
            <span className="hs__label">Bikes</span>
            <h2 className="hs__title">{featuredBike.name}</h2>
            {featuredBike.description && (
              <p className="hs__text">
                {stripHtml(featuredBike.description).slice(0, 200).trimEnd()}…
              </p>
            )}
            <Link to={`/bikes/${featuredBike.slug}`} className="hs__cta">
              Zur Maschine →
            </Link>
            <Link to="/bikes" className="hs__sub">Alle Bikes ansehen</Link>
          </div>
          <div className="hs__image">
            <img
              src={featuredBike.featuredImage || 'https://picsum.photos/seed/bike-detail/900/700'}
              alt={featuredBike.name}
              loading="lazy"
            />
          </div>
        </section>
      )}

      {/* ── Stats Strip ── */}
      {stats && (
        <div className="home-stats">
          <div className="home-stats__grid container">
            {[
              { num: stats.touren, label: 'Touren' },
              { num: (stats.km ?? 0).toLocaleString('de-DE'), label: 'Kilometer' },
              { num: stats.laender, label: 'Länder' },
              { num: stats.jahre, label: 'Jahre' },
            ].map(({ num, label }) => (
              <div key={label} className="home-stats__item">
                <span className="home-stats__num">{num}</span>
                <span className="home-stats__label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 3: Latest Video ── */}
      {!loading && featuredVideo && (
        <section className="hs">
          <div className="hs__image hs__image--video">
            <img
              src={
                featuredVideo.thumbnail ||
                `https://img.youtube.com/vi/${getYouTubeId(featuredVideo.youtubeUrl)}/maxresdefault.jpg`
              }
              alt={featuredVideo.title}
              loading="lazy"
            />
            <Link
              to="/youtube"
              className="hs__play-btn"
              aria-label="Video ansehen"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>
          </div>
          <div className="hs__body">
            <span className="hs__label">YouTube</span>
            <h2 className="hs__title">{featuredVideo.title}</h2>
            <p className="hs__text">
              Onboard-Perspektive, Touren-Vlogs und ehrliche Motorrad-Reviews – jetzt auf YouTube.
            </p>
            <Link to="/youtube" className="hs__cta">
              Video ansehen →
            </Link>
            <a
              href="https://youtube.com/@krawallbruder"
              target="_blank"
              rel="noopener noreferrer"
              className="hs__sub"
            >
              Kanal abonnieren
            </a>
          </div>
        </section>
      )}

      {/* ── Weitere Posts ── */}
      {morePosts.length > 0 && (
        <section className="home-posts">
          <div className="home-posts__header container">
            <span className="section-title">Weitere Touren</span>
            <Link to="/touren" className="home-posts__all">Alle ansehen →</Link>
          </div>
          <div className="home-posts__grid">
            {morePosts.map((post) => (
              <Link
                key={post['@id']}
                to={`/touren/${post.slug}`}
                className="home-post-item"
              >
                <div className="home-post-item__image">
                  <img
                    src={post.featuredImage || 'https://picsum.photos/seed/' + post.slug + '/600/400'}
                    alt={post.title}
                    loading="lazy"
                  />
                </div>
                <div className="home-post-item__body">
                  {post.category && (
                    <span className="home-post-item__cat">{post.category}</span>
                  )}
                  <h3 className="home-post-item__title">{post.title}</h3>
                  <span className="home-post-item__date">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('de-DE', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })
                      : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
