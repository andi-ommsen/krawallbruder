import { useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function ImageUpload({ value, onChange, label = 'Bild-URL' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = async (e) => {
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
      onChange(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="img-upload">
      <label className="admin-form__label">{label}</label>
      <div className="img-upload__row">
        <input
          type="text"
          className="admin-form__input img-upload__url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… oder Datei hochladen →"
        />
        <button
          type="button"
          className="img-upload__btn"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
        >
          {uploading ? 'Lädt…' : '↑ Hochladen'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>
      {error && <p className="img-upload__error">{error}</p>}
      {value && (
        <img src={value} alt="Vorschau" className="img-upload__preview" />
      )}
    </div>
  )
}
