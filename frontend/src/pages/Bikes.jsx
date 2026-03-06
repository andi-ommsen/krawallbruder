import { useEffect, useState } from 'react'
import { fetchBikes } from '../services/api'
import BikeCard from '../components/BikeCard'
import './Bikes.css'

export default function Bikes() {
  const [bikes, setBikes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBikes()
      .then((res) => setBikes(res.data['hydra:member'] || []))
      .catch(() => setError('Bikes konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bikes-page">
      <div className="bikes-page__hero">
        <div className="container">
          <h1>Meine Maschinen</h1>
          <p>Drei Charaktere. Drei Welten. Eine Leidenschaft.</p>
        </div>
      </div>

      <div className="container bikes-page__content">
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="page-loading">Lade Bikes…</div>
        ) : (
          <div className="grid-3">
            {bikes.map((bike) => (
              <BikeCard key={bike['@id']} bike={bike} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
