import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchBike, fetchBlogPosts } from '../services/api'
import BlogCard from '../components/BlogCard'
import './BikeDetail.css'

export default function BikeDetail() {
  const { slug } = useParams()
  const [bike, setBike] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchBike(slug),
      fetchBlogPosts({ 'bike.slug': slug, itemsPerPage: 6 }),
    ])
      .then(([bikeRes, postsRes]) => {
        const bikes = bikeRes.data['hydra:member'] || []
        if (bikes.length === 0) {
          setError('Bike nicht gefunden.')
          return
        }
        setBike(bikes[0])
        setPosts(postsRes.data['hydra:member'] || [])
      })
      .catch(() => setError('Daten konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="page-loading">Lade Bike-Daten…</div>
  if (error) return <div className="container"><div className="error-message">{error}</div></div>
  if (!bike) return null

  return (
    <div className="bike-detail">
      {/* Hero */}
      <div className="bike-detail__hero">
        <img
          src={bike.featuredImage || 'https://picsum.photos/seed/bike/1600/700'}
          alt={bike.name}
          className="bike-detail__hero-img"
        />
        <div className="bike-detail__hero-overlay">
          <div className="container bike-detail__hero-content">
            <h1>{bike.name}</h1>
            <p className="bike-detail__year">{bike.year}</p>
          </div>
        </div>
      </div>

      <div className="container bike-detail__layout">
        {/* Beschreibung */}
        <div className="bike-detail__info">
          <section className="bike-detail__section">
            <h2>Meine Geschichte</h2>
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: bike.description }}
            />
          </section>

          {/* Technische Daten */}
          {bike.technicalData && (
            <section className="bike-detail__section">
              <h2>Technische Daten</h2>
              <table className="bike-detail__specs">
                <tbody>
                  {Object.entries(bike.technicalData).map(([key, val]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Galerie */}
          {bike.gallery && bike.gallery.length > 0 && (
            <section className="bike-detail__section">
              <h2>Galerie</h2>
              <div className="bike-detail__gallery">
                {bike.gallery.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${bike.name} – Bild ${i + 1}`}
                    className="bike-detail__gallery-img"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Touren mit diesem Bike */}
      {posts.length > 0 && (
        <section className="section bike-detail__posts">
          <div className="container">
            <h2 className="section-title">Touren mit der {bike.name}</h2>
            <div className="grid-3">
              {posts.map((post) => (
                <BlogCard key={post['@id']} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container bike-detail__back">
        <Link to="/bikes" className="btn btn-outline">← Zurück zu allen Bikes</Link>
      </div>
    </div>
  )
}
