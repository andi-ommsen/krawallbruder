import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBlogPosts, fetchBikes, fetchYouTubeVideos } from '../services/api'
import BlogCard from '../components/BlogCard'
import BikeCard from '../components/BikeCard'
import VideoPlayer from '../components/VideoPlayer'
import './Home.css'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [bikes, setBikes] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchBlogPosts({ itemsPerPage: 3 }),
      fetchBikes(),
      fetchYouTubeVideos({ itemsPerPage: 1 }),
    ])
      .then(([postsRes, bikesRes, videosRes]) => {
        setPosts(postsRes.data['hydra:member'] || [])
        setBikes(bikesRes.data['hydra:member'] || [])
        setVideos(videosRes.data['hydra:member'] || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__overlay" />
        <div className="hero__content container">
          <div className="hero__logo-col">
            <img src="/logo.png" alt="Krawallbruder" className="hero__logo" />
          </div>
          <div className="hero__text-col">
            <h1 className="hero__title">Touren.<br />Träume.<br />Asphalt.</h1>
            <div className="hero__cta">
              <Link to="/touren" className="btn btn-primary">Alle Touren</Link>
              <Link to="/bikes" className="btn btn-outline hero__btn-ghost">Meine Bikes</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Aktuelle Beiträge */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Aktuelle Touren</h2>
          {loading ? (
            <div className="page-loading">Lade Beiträge…</div>
          ) : (
            <>
              <div className="grid-3">
                {posts.map((post) => (
                  <BlogCard key={post['@id']} post={post} />
                ))}
              </div>
              <div className="home__more-link">
                <Link to="/touren" className="btn btn-outline">Alle Touren anzeigen →</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured YouTube Video */}
      {videos.length > 0 && (
        <section className="section home__video-section">
          <div className="container">
            <h2 className="section-title">Neuestes Video</h2>
            <div className="home__video-wrap">
              <VideoPlayer
                url={videos[0].youtubeUrl}
                title={videos[0].title}
                thumbnail={videos[0].thumbnail}
              />
            </div>
            <div className="home__more-link">
              <Link to="/youtube" className="btn btn-outline">Alle Videos ansehen →</Link>
            </div>
          </div>
        </section>
      )}

      {/* Bikes Preview */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Meine Maschinen</h2>
          {!loading && (
            <>
              <div className="grid-3">
                {bikes.slice(0, 3).map((bike) => (
                  <BikeCard key={bike['@id']} bike={bike} />
                ))}
              </div>
              <div className="home__more-link">
                <Link to="/bikes" className="btn btn-outline">Alle Bikes →</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA YouTube */}
      <section className="home__yt-cta">
        <div className="container home__yt-cta-inner">
          <div>
            <h2>Abonniere den Kanal</h2>
            <p>Onboard-Videos, Touren-Vlogs und Motorrad-Ehrlichkeit – auf YouTube.</p>
          </div>
          <a
            href="https://youtube.com/@krawallbruder"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Jetzt abonnieren
          </a>
        </div>
      </section>
    </div>
  )
}
