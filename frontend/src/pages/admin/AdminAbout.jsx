import { useEffect, useState } from 'react'
import { adminFetchAbout, adminCreateAbout, adminUpdateAbout } from '../../services/api'
import ImageUpload from '../../components/ImageUpload'
import '../../components/ImageUpload.css'

export default function AdminAbout() {
  const [aboutId, setAboutId] = useState(null)
  const [form, setForm] = useState({
    content: '',
    profileImage: '',
    touren: '',
    km: '',
    laender: '',
    jahre: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminFetchAbout()
      .then((r) => {
        const items = r.data['hydra:member'] ?? []
        if (items.length > 0) {
          const d = items[0]
          const stats = d.stats ?? {}
          setAboutId(d['@id'].split('/').pop())
          setForm({
            content: d.content ?? '',
            profileImage: d.profileImage ?? '',
            touren: stats.touren ?? '',
            km: stats.km ?? '',
            laender: stats.laender ?? '',
            jahre: stats.jahre ?? '',
          })
        }
      })
      .catch(() => setError('Seite konnte nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const payload = {
      content: form.content,
      profileImage: form.profileImage || null,
      stats: {
        touren: parseInt(form.touren, 10) || 0,
        km: parseInt(form.km, 10) || 0,
        laender: parseInt(form.laender, 10) || 0,
        jahre: parseInt(form.jahre, 10) || 0,
      },
    }
    try {
      if (aboutId) {
        await adminUpdateAbout(aboutId, payload)
      } else {
        const res = await adminCreateAbout(payload)
        setAboutId(res.data['@id'].split('/').pop())
      }
      setSuccess('Seite gespeichert.')
    } catch (err) {
      setError(err.response?.data?.['hydra:description'] ?? 'Fehler beim Speichern.')
    }
  }

  if (loading) return <p style={{ color: '#888' }}>Lade…</p>

  return (
    <div>
      <div className="admin-page__header">
        <h1 className="admin-page__title">Über mich</h1>
      </div>
      {error && <div className="admin-notice admin-notice--error">{error}</div>}
      {success && <div className="admin-notice admin-notice--success">{success}</div>}
      <form onSubmit={handleSubmit} className="admin-form">
        <ImageUpload
          label="Profilbild"
          value={form.profileImage}
          onChange={(url) => setForm((p) => ({ ...p, profileImage: url }))}
        />

        <div className="admin-form__group">
          <label className="admin-form__label">Inhalt (HTML) *</label>
          <textarea
            className="admin-form__textarea"
            style={{ minHeight: '300px', fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={form.content}
            onChange={set('content')}
            required
          />
        </div>

        <fieldset style={{ border: '1px solid #2a2a2a', borderRadius: '8px', padding: '1rem' }}>
          <legend style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.5rem' }}>
            Statistiken
          </legend>
          <div className="admin-form__row">
            <div className="admin-form__group">
              <label className="admin-form__label">Touren</label>
              <input type="number" className="admin-form__input" value={form.touren} onChange={set('touren')} />
            </div>
            <div className="admin-form__group">
              <label className="admin-form__label">Kilometer</label>
              <input type="number" className="admin-form__input" value={form.km} onChange={set('km')} />
            </div>
          </div>
          <div className="admin-form__row" style={{ marginTop: '1rem' }}>
            <div className="admin-form__group">
              <label className="admin-form__label">Länder</label>
              <input type="number" className="admin-form__input" value={form.laender} onChange={set('laender')} />
            </div>
            <div className="admin-form__group">
              <label className="admin-form__label">Jahre</label>
              <input type="number" className="admin-form__input" value={form.jahre} onChange={set('jahre')} />
            </div>
          </div>
        </fieldset>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary">Speichern</button>
        </div>
      </form>
    </div>
  )
}
