import { useEffect, useState } from 'react'
import { fetchYouTubeVideos, fetchBikes } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import './YouTube.css'

function getYouTubeId(url) {
  if (!url) return ''
  const m = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)
  return m ? m[1] : ''
}

export default function YouTube() {
  const [videos, setVideos] = useState([])
  const [bikes, setBikes] = useState([])
  const [bikeFilter, setBikeFilter] = useState('')
  const [modalVideo, setModalVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetchYouTubeVideos(bikeFilter ? { 'bike.slug': bikeFilter } : {}),
      fetchBikes(),
    ])
      .then(([vidRes, bikeRes]) => {
        setVideos(vidRes.data['hydra:member'] || [])
        setBikes(bikeRes.data['hydra:member'] || [])
      })
      .catch(() => setError('Videos konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [bikeFilter])

  return (
    <div className="youtube-page">
      <div className="youtube-page__hero">
        <div className="container">
          <h1>YouTube</h1>
          <p>Alle Videos – Onboard, Touren, Reviews.</p>
        </div>
      </div>

      <div className="container youtube-page__content">
        {/* Bike-Filter */}
        <div className="youtube-page__filters">
          <button
            className={`blog-page__cat-btn${!bikeFilter ? ' active' : ''}`}
            onClick={() => setBikeFilter('')}
          >
            Alle
          </button>
          {bikes.map((bike) => (
            <button
              key={bike['@id']}
              className={`blog-page__cat-btn${bikeFilter === bike.slug ? ' active' : ''}`}
              onClick={() => setBikeFilter(bike.slug)}
            >
              {bike.name}
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="page-loading">Lade Videos…</div>
        ) : (
          <div className="youtube-page__grid">
            {videos.map((video) => (
              <div
                key={video['@id']}
                className="youtube-card"
                onClick={() => setModalVideo(video)}
                role="button"
                tabIndex={0}
                aria-label={`Video abspielen: ${video.title}`}
                onKeyDown={(e) => e.key === 'Enter' && setModalVideo(video)}
              >
                <div className="youtube-card__thumb-wrap">
                  {video.thumbnail ? (
                    <>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="youtube-card__thumb"
                        loading="lazy"
                      />
                      <div className="youtube-card__play">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </>
                  ) : (
                    <iframe
                      className="youtube-card__embed"
                      src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(video.youtubeUrl)}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
                <div className="youtube-card__info">
                  <h3 className="youtube-card__title">{video.title}</h3>
                  <div className="youtube-card__meta">
                    {video.bike && <span>{video.bike.name}</span>}
                    {video.publishedAt && (
                      <time>
                        {new Date(video.publishedAt).toLocaleDateString('de-DE', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </time>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalVideo && (
        <div
          className="youtube-modal"
          onClick={() => setModalVideo(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="youtube-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="youtube-modal__close"
              onClick={() => setModalVideo(null)}
              aria-label="Schließen"
            >
              ✕
            </button>
            <VideoPlayer
              url={modalVideo.youtubeUrl}
              title={modalVideo.title}
            />
          </div>
        </div>
      )}
    </div>
  )
}
