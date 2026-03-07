import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminFetchBike, adminCreateBike, adminUpdateBike } from '../../services/api'

const EMPTY = {
  name: '',
  slug: '',
  year: new Date().getFullYear(),
  description: '',
  featuredImage: '',
  technicalData: '{}',
  gallery: '[]',
  sortOrder: 0,
}

export default function AdminBikeEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (!isNew) {
      adminFetchBike(id)
        .then((r) => {
          const d = r.data
          setForm({
            name: d.name ?? '',
            slug: d.slug ?? '',
            year: d.year ?? new Date().getFullYear(),
            description: d.description ?? '',
            featuredImage: d.featuredImage ?? '',
            technicalData: JSON.stringify(d.technicalData ?? {}, null, 2),
            gallery: JSON.stringify(d.gallery ?? [], null, 2),
            sortOrder: d.sortOrder ?? 0,
          })
        })
        .catch(() => setError('Bike konnte nicht geladen werden.'))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const parseJson = (str, fallback) => {
    try { return JSON.parse(str) } catch { return fallback }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const payload = {
      ...form,
      year: parseInt(form.year, 10),
      sortOrder: parseInt(form.sortOrder, 10),
      technicalData: parseJson(form.technicalData, {}),
      gallery: parseJson(form.gallery, []),
    }
    try {
      if (isNew) {
        await adminCreateBike(payload)
        navigate('/geheim-admin/bikes')
      } else {
        await adminUpdateBike(id, payload)
        setSuccess('Bike gespeichert.')
      }
    } catch (err) {
      setError(err.response?.data?.['hydra:description'] ?? 'Fehler beim Speichern.')
    }
  }

  if (loading) return <p style={{ color: '#888' }}>Lade…</p>

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">{isNew ? 'Neues Bike' : 'Bike bearbeiten'}</h1>
      </div>
      {error && <div className="admin-notice admin-notice--error">{error}</div>}
      {success && <div className="admin-notice admin-notice--success">{success}</div>}
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__row">
          <div className="admin-form__group">
            <label className="admin-form__label">Name *</label>
            <input className="admin-form__input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Slug *</label>
            <input className="admin-form__input" value={form.slug} onChange={set('slug')} required />
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__group">
            <label className="admin-form__label">Baujahr *</label>
            <input type="number" className="admin-form__input" value={form.year} onChange={set('year')} required />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Sortierung</label>
            <input type="number" className="admin-form__input" value={form.sortOrder} onChange={set('sortOrder')} />
          </div>
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Beschreibung (HTML) *</label>
          <textarea
            className="admin-form__textarea"
            style={{ minHeight: '200px', fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={form.description}
            onChange={set('description')}
            required
          />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Titelbild-URL</label>
          <input className="admin-form__input" value={form.featuredImage} onChange={set('featuredImage')} placeholder="https://…" />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Technische Daten (JSON-Objekt)</label>
          <textarea
            className="admin-form__textarea"
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={form.technicalData}
            onChange={set('technicalData')}
            placeholder={'{\n  "Motor": "125 ccm",\n  "Leistung": "12 PS"\n}'}
          />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Galerie (JSON-Array mit URLs)</label>
          <textarea
            className="admin-form__textarea"
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={form.gallery}
            onChange={set('gallery')}
            placeholder={'[\n  "https://…/bild1.jpg",\n  "https://…/bild2.jpg"\n]'}
          />
        </div>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Speichern</button>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={() => navigate('/geheim-admin/bikes')}>
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}
