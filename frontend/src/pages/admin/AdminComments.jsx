import { useEffect, useState } from 'react'
import { adminFetchComments, adminDeleteComment } from '../../services/api'

export default function AdminComments() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminFetchComments()
      .then((res) => setComments(res.data['hydra:member'] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (iri, author) => {
    if (!confirm(`Kommentar von „${author}" wirklich löschen?`)) return
    try {
      const id = iri.split('/').pop()
      await adminDeleteComment(id)
      load()
    } catch {
      alert('Löschen fehlgeschlagen.')
    }
  }

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Kommentare</h1>
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Lade…</p>
      ) : comments.length === 0 ? (
        <p style={{ color: '#888' }}>Noch keine Kommentare.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Autor</th>
              <th>Kommentar</th>
              <th>Blog-Post</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c['@id']}>
                <td style={{ color: '#888', whiteSpace: 'nowrap' }}>
                  {new Date(c.createdAt).toLocaleDateString('de-DE')}
                </td>
                <td>{c.authorName}</td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.content}
                </td>
                <td style={{ color: '#888' }}>
                  {c.blogPost?.title ?? '–'}
                </td>
                <td>
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => handleDelete(c['@id'], c.authorName)}
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
