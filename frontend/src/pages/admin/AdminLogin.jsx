import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminLogin } from '../../services/api'
import './AdminLogin.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminLogin(username, password)
      login(res.data.token)
      navigate('/geheim-admin')
    } catch {
      setError('Ungültige Zugangsdaten.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <h1 className="admin-login__title">Krawallbruder Admin</h1>
        <form onSubmit={handleSubmit} className="admin-login__form">
          <label className="admin-login__label">
            Benutzername
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="admin-login__input"
              autoComplete="username"
              required
            />
          </label>
          <label className="admin-login__label">
            Passwort
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login__input"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="admin-login__error">{error}</p>}
          <button type="submit" className="admin-login__btn" disabled={loading}>
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
