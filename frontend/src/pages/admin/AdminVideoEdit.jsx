import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminFetchVideo,
  adminCreateVideo,
  adminUpdateVideo,
  adminFetchBikes,
} from '../../services/api'

const EMPTY = {
  title: '',
  youtubeUrl: '',
  thumbnail: '',
  publishedAt: new Date().toISOString().slice(0, 16),
  bike: null,
}

export default function AdminVideoEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [bikes, setBikes] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    adminFetchBikes().then((r) => setBikes(r.data['hydra:member'] ?? []))
  }, [])

  useEffect(() => {
    if (!isNew) {
      adminFetchVideo(id)
        .then((r) => {
          const d = r.data
          setForm({
            title: d.title ?? '',
            youtubeUrl: d.youtubeUrl ?? '',
            thumbnail: d.thumbnail ?? '',
            publishedAt: d.publishedAt ? d.publishedAt.slice(0, 16) : '',
            bike: d.bike?.['@id'] ?? null,
          })
        })
        .catch(() => setError('Video konnte nicht geladen werden.'))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const payload = {
      ...form,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      bike: form.bike || null,
    }
    try {
      if (isNew) {
        await adminCreateVideo(payload)
        navigate('/geheim-admin/videos')
      } else {
        await adminUpdateVideo(id, payload)
        setSuccess('Video gespeichert.')
      }
    } catch (err) {
      setError(err.response?.data?.['hydra:description'] ?? 'Fehler beim Speichern.')
    }
  }

  if (loading) return <p style={{ color: '#888' }}>Lade…</p>

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">{isNew ? 'Neues Video' : 'Video bearbeiten'}</h1>
      </div>
      {error && <div className="admin-notice admin-notice--error">{error}</div>}
      {success && <div className="admin-notice admin-notice--success">{success}</div>}
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__group">
          <label className="admin-form__label">Titel *</label>
          <input className="admin-form__input" value={form.title} onChange={set('title')} required />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">YouTube-URL *</label>
          <input className="admin-form__input" value={form.youtubeUrl} onChange={set('youtubeUrl')} placeholder="https://youtube.com/watch?v=…" required />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Thumbnail-URL</label>
          <input className="admin-form__input" value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://…" />
        </div>

        <div className="admin-form__row">
          <div className="admin-form__group">
            <label className="admin-form__label">Datum</label>
            <input type="datetime-local" className="admin-form__input" value={form.publishedAt} onChange={set('publishedAt')} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Bike</label>
            <select className="admin-form__select" value={form.bike ?? ''} onChange={set('bike')}>
              <option value="">– keins –</option>
              {bikes.map((b) => (
                <option key={b['@id']} value={b['@id']}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Speichern</button>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={() => navigate('/geheim-admin/videos')}>
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}
