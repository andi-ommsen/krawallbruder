import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminFetchVideos, adminDeleteVideo } from '../../services/api'

export default function AdminVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    adminFetchVideos()
      .then((res) => setVideos(res.data['hydra:member'] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`„${title}" wirklich löschen?`)) return
    try {
      await adminDeleteVideo(id)
      load()
    } catch {
      alert('Löschen fehlgeschlagen.')
    }
  }

  const extractId = (iri) => iri?.split('/').pop()

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">YouTube Videos</h1>
        <Link to="/geheim-admin/videos/neu" className="admin-btn admin-btn--primary">+ Neues Video</Link>
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Lade…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titel</th>
              <th>Bike</th>
              <th>Datum</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v['@id']}>
                <td>{v.title}</td>
                <td style={{ color: '#888' }}>{v.bike?.name ?? '–'}</td>
                <td style={{ color: '#888' }}>
                  {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('de-DE') : '–'}
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="admin-btn admin-btn--secondary"
                      onClick={() => navigate(`/geheim-admin/videos/${extractId(v['@id'])}`)}
                    >
                      Bearbeiten
                    </button>
                    <button
                      className="admin-btn admin-btn--danger"
                      onClick={() => handleDelete(extractId(v['@id']), v.title)}
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
