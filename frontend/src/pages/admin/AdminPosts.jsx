import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminFetchPosts, adminDeletePost } from '../../services/api'

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    adminFetchPosts()
      .then((res) => setPosts(res.data['hydra:member'] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`„${title}" wirklich löschen?`)) return
    try {
      await adminDeletePost(id)
      load()
    } catch {
      alert('Löschen fehlgeschlagen.')
    }
  }

  const extractId = (iri) => iri?.split('/').pop()

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Touren / Posts</h1>
        <Link to="/geheim-admin/posts/neu" className="admin-btn admin-btn--primary">+ Neuer Post</Link>
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Lade…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titel</th>
              <th>Kategorie</th>
              <th>Veröffentlicht</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p['@id']}>
                <td>{p.title}</td>
                <td style={{ color: '#888' }}>{p.category || '–'}</td>
                <td style={{ color: '#888' }}>
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('de-DE') : '–'}
                </td>
                <td>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: p.isPublished ? 'rgba(50,200,100,0.15)' : 'rgba(200,50,50,0.15)',
                    color: p.isPublished ? '#6d9' : '#e77',
                  }}>
                    {p.isPublished ? 'Aktiv' : 'Entwurf'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="admin-btn admin-btn--secondary"
                      onClick={() => navigate(`/geheim-admin/posts/${extractId(p['@id'])}`)}
                    >
                      Bearbeiten
                    </button>
                    <button
                      className="admin-btn admin-btn--danger"
                      onClick={() => handleDelete(extractId(p['@id']), p.title)}
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
