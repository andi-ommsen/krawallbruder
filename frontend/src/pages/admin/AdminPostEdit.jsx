import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ImageUpload from '../../components/ImageUpload'
import '../../components/ImageUpload.css'
import {
  adminFetchPost,
  adminCreatePost,
  adminUpdatePost,
  adminFetchBikes,
} from '../../services/api'

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  youtubeUrl: '',
  publishedAt: new Date().toISOString().slice(0, 16),
  category: '',
  bike: null,
  isPublished: true,
}

export default function AdminPostEdit() {
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
      adminFetchPost(id)
        .then((r) => {
          const d = r.data
          setForm({
            title: d.title ?? '',
            slug: d.slug ?? '',
            excerpt: d.excerpt ?? '',
            content: d.content ?? '',
            featuredImage: d.featuredImage ?? '',
            youtubeUrl: d.youtubeUrl ?? '',
            publishedAt: d.publishedAt ? d.publishedAt.slice(0, 16) : '',
            category: d.category ?? '',
            bike: d.bike?.['@id'] ?? null,
            isPublished: d.isPublished ?? true,
          })
        })
        .catch(() => setError('Post konnte nicht geladen werden.'))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
  }

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
        await adminCreatePost(payload)
        setSuccess('Post erstellt.')
        navigate('/geheim-admin/posts')
      } else {
        await adminUpdatePost(id, payload)
        setSuccess('Post gespeichert.')
      }
    } catch (err) {
      setError(err.response?.data?.['hydra:description'] ?? 'Fehler beim Speichern.')
    }
  }

  if (loading) return <p style={{ color: '#888' }}>Lade…</p>

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">{isNew ? 'Neuer Post' : 'Post bearbeiten'}</h1>
      </div>
      {error && <div className="admin-notice admin-notice--error">{error}</div>}
      {success && <div className="admin-notice admin-notice--success">{success}</div>}
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__row">
          <div className="admin-form__group">
            <label className="admin-form__label">Titel *</label>
            <input className="admin-form__input" value={form.title} onChange={set('title')} required />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Slug *</label>
            <input className="admin-form__input" value={form.slug} onChange={set('slug')} required />
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__group">
            <label className="admin-form__label">Kategorie</label>
            <select className="admin-form__select" value={form.category} onChange={set('category')}>
              <option value="">– keine –</option>
              <option value="Alpentouren">Alpentouren</option>
              <option value="Kurztrip">Kurztrip</option>
              <option value="Vespa">Vespa</option>
              <option value="Voge">Voge</option>
              <option value="Indian">Indian</option>
            </select>
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

        <div className="admin-form__row">
          <div className="admin-form__group">
            <label className="admin-form__label">Veröffentlicht am</label>
            <input type="datetime-local" className="admin-form__input" value={form.publishedAt} onChange={set('publishedAt')} />
          </div>
          <div className="admin-form__group" style={{ justifyContent: 'flex-end', paddingBottom: '0.25rem' }}>
            <label className="admin-form__label" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} />
              Veröffentlicht (sichtbar)
            </label>
          </div>
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Kurzbeschreibung (Excerpt)</label>
          <textarea className="admin-form__textarea" style={{ minHeight: '80px' }} value={form.excerpt} onChange={set('excerpt')} />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Inhalt (HTML) *</label>
          <textarea className="admin-form__textarea" style={{ minHeight: '300px', fontFamily: 'monospace', fontSize: '0.85rem' }} value={form.content} onChange={set('content')} required />
        </div>

        <ImageUpload
          label="Titelbild"
          value={form.featuredImage}
          onChange={(url) => setForm((p) => ({ ...p, featuredImage: url }))}
        />

        <div className="admin-form__group">
          <label className="admin-form__label">YouTube-URL</label>
          <input className="admin-form__input" value={form.youtubeUrl} onChange={set('youtubeUrl')} placeholder="https://youtube.com/…" />
        </div>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Speichern</button>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={() => navigate('/geheim-admin/posts')}>
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}
