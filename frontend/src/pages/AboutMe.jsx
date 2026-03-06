import { useEffect, useState } from 'react'
import { fetchAboutPage } from '../services/api'
import './AboutMe.css'

export default function AboutMe() {
  const [about, setAbout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAboutPage()
      .then((res) => {
        const members = res.data['hydra:member'] || []
        if (members.length > 0) setAbout(members[0])
      })
      .catch(() => setError('Seite konnte nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loading">Lade…</div>
  if (error) return <div className="container"><div className="error-message">{error}</div></div>

  return (
    <div className="about-page">
      <div className="about-page__hero">
        <div className="container about-page__hero-inner">
          <div className="about-page__profile">
            <img
              src={about?.profileImage || 'https://picsum.photos/seed/portrait/400/400'}
              alt="Krawallbruder"
              className="about-page__avatar"
            />
          </div>
          <div>
            <h1>Über mich</h1>
            <p className="about-page__subtitle">Der Mann hinter dem Helm.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {about?.stats && (
        <div className="about-page__stats">
          <div className="container about-page__stats-grid">
            {about.stats.touren && (
              <div className="about-page__stat">
                <span className="about-page__stat-value">{about.stats.touren}</span>
                <span className="about-page__stat-label">Touren</span>
              </div>
            )}
            {about.stats.km && (
              <div className="about-page__stat">
                <span className="about-page__stat-value">{about.stats.km.toLocaleString('de-DE')}</span>
                <span className="about-page__stat-label">Kilometer</span>
              </div>
            )}
            {about.stats.laender && (
              <div className="about-page__stat">
                <span className="about-page__stat-value">{about.stats.laender}</span>
                <span className="about-page__stat-label">Länder</span>
              </div>
            )}
            {about.stats.jahre && (
              <div className="about-page__stat">
                <span className="about-page__stat-value">{about.stats.jahre}</span>
                <span className="about-page__stat-label">Jahre auf zwei Rädern</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container about-page__content">
        {about?.content && (
          <div
            className="blog-content about-page__text"
            dangerouslySetInnerHTML={{ __html: about.content }}
          />
        )}

        {/* YouTube-Sektion */}
        <div className="about-page__youtube">
          <h2>YouTube-Kanal</h2>
          <p>
            Alle Touren, alle Bikes, alle Abenteuer – auch als Video auf YouTube.
            Abonniere den Kanal für regelmäßige Updates.
          </p>
          <a
            href="https://youtube.com/@krawallbruder"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Zum YouTube-Kanal
          </a>
        </div>
      </div>
    </div>
  )
}
