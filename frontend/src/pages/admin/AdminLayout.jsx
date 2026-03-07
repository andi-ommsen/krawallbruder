import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

export default function AdminLayout() {
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  if (!isLoggedIn) {
    navigate('/geheim-admin/login')
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/geheim-admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">KB Admin</div>
        <nav className="admin-sidebar__nav">
          <NavLink to="/geheim-admin" end className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
          <NavLink to="/geheim-admin/posts" className={({ isActive }) => isActive ? 'active' : ''}>
            Touren / Posts
          </NavLink>
          <NavLink to="/geheim-admin/bikes" className={({ isActive }) => isActive ? 'active' : ''}>
            Bikes
          </NavLink>
          <NavLink to="/geheim-admin/videos" className={({ isActive }) => isActive ? 'active' : ''}>
            YouTube Videos
          </NavLink>
          <NavLink to="/geheim-admin/about" className={({ isActive }) => isActive ? 'active' : ''}>
            Über mich
          </NavLink>
        </nav>
        <button className="admin-sidebar__logout" onClick={handleLogout}>
          Abmelden
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
