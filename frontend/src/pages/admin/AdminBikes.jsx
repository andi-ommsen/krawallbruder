import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminFetchBikes, adminDeleteBike } from '../../services/api'

export default function AdminBikes() {
  const [bikes, setBikes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    adminFetchBikes()
      .then((res) => setBikes(res.data['hydra:member'] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`„${name}" wirklich löschen?`)) return
    try {
      await adminDeleteBike(id)
      load()
    } catch {
      alert('Löschen fehlgeschlagen.')
    }
  }

  const extractId = (iri) => iri?.split('/').pop()

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Bikes</h1>
        <Link to="/geheim-admin/bikes/neu" className="admin-btn admin-btn--primary">+ Neues Bike</Link>
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Lade…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Jahr</th>
              <th>Slug</th>
              <th>Reihenfolge</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {bikes.map((b) => (
              <tr key={b['@id']}>
                <td>{b.name}</td>
                <td style={{ color: '#888' }}>{b.year}</td>
                <td style={{ color: '#666', fontSize: '0.85rem' }}>{b.slug}</td>
                <td style={{ color: '#888' }}>{b.sortOrder}</td>
                <td>
                  <div className="actions">
                    <button
                      className="admin-btn admin-btn--secondary"
                      onClick={() => navigate(`/geheim-admin/bikes/${extractId(b['@id'])}`)}
                    >
                      Bearbeiten
                    </button>
                    <button
                      className="admin-btn admin-btn--danger"
                      onClick={() => handleDelete(extractId(b['@id']), b.name)}
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
