import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminFetchBike, adminCreateBike, adminUpdateBike } from '../../services/api'
import ImageUpload from '../../components/ImageUpload'
import '../../components/ImageUpload.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const EMPTY = {
  name: '',
  slug: '',
  year: new Date().getFullYear(),
  description: '',
  featuredImage: '',
  technicalData: '{}',
  gallery: [],
  sortOrder: 0,
}

function GalleryManager({ images, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_BASE}/api/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload fehlgeschlagen.')
      onChange([...images, data.url])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const addUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    onChange([...images, trimmed])
    setUrlInput('')
  }

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx))

  const move = (idx, dir) => {
    const next = [...images]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    onChange(next)
  }

  return (
    <div className="gallery-mgr">
      <label className="admin-form__label">Galerie</label>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="gallery-mgr__grid">
          {images.map((url, idx) => (
            <div key={idx} className="gallery-mgr__item">
              <img src={url} alt={`Bild ${idx + 1}`} className="gallery-mgr__thumb" />
              <div className="gallery-mgr__actions">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} title="Nach vorne">←</button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === images.length - 1} title="Nach hinten">→</button>
                <button type="button" onClick={() => remove(idx)} className="gallery-mgr__del" title="Entfernen">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload + URL hinzufügen */}
      <div className="gallery-mgr__add">
        <button
          type="button"
          className="img-upload__btn"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          {uploading ? 'Lädt…' : '↑ Bild hochladen'}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={uploadFile} />

        <input
          type="text"
          className="admin-form__input"
          style={{ flex: 1 }}
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="oder URL eingeben…"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
        />
        <button type="button" className="img-upload__btn" onClick={addUrl}>+ URL</button>
      </div>

      {error && <p style={{ color: '#e55', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>{error}</p>}
    </div>
  )
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
            gallery: d.gallery ?? [],
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

        <ImageUpload
          label="Titelbild"
          value={form.featuredImage}
          onChange={(url) => setForm((p) => ({ ...p, featuredImage: url }))}
        />

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

        <GalleryManager
          images={form.gallery}
          onChange={(gallery) => setForm((p) => ({ ...p, gallery }))}
        />

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
