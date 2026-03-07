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

      {/* ── Hero: split photo / title ── */}
      <div className="about-page__hero">
        <div className="about-page__profile">
          <img
            src={about?.profileImage || 'https://picsum.photos/seed/portrait/600/800'}
            alt="Krawallbruder"
            className="about-page__avatar"
          />
        </div>
        <div className="about-page__hero-inner">
          <p className="about-page__subtitle">Der Mann hinter dem Helm.</p>
          <h1>Über mich</h1>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {about?.stats && (
        <div className="about-page__stats">
          <div className="about-page__stats-grid">
            {[
              { val: about.stats.touren, label: 'Touren' },
              { val: (about.stats.km ?? 0).toLocaleString('de-DE'), label: 'Kilometer' },
              { val: about.stats.laender, label: 'Länder' },
              { val: about.stats.jahre, label: 'Jahre' },
            ].map(({ val, label }) => (
              <div key={label} className="about-page__stat">
                <span className="about-page__stat-value">{val}</span>
                <span className="about-page__stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Text content ── */}
      <div className="about-page__content container">
        {about?.content && (
          <div
            className="blog-content about-page__text"
            dangerouslySetInnerHTML={{ __html: about.content }}
          />
        )}

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
            Zum YouTube-Kanal →
          </a>
        </div>
      </div>

    </div>
  )
}
