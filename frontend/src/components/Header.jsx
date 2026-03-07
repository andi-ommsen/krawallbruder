import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import './Header.css'

const navLinks = [
  { to: '/touren', label: 'Touren' },
  { to: '/bikes', label: 'Bikes' },
  { to: '/ueber-mich', label: 'Über mich' },
  { to: '/youtube', label: 'YouTube' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <>
      <header className="header">
        <button
          className="header__menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Menü öffnen"
        >
          Menü
        </button>

        <Link to="/" className="header__wordmark" onClick={close}>
          Krawallbruder®
        </Link>

        <div className="header__right" />
      </header>

      {/* Overlay */}
      <div
        className={`nav-overlay${menuOpen ? ' nav-overlay--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="nav-overlay__top">
          <span className="nav-overlay__brand">Krawallbruder®</span>
          <button className="nav-overlay__close" onClick={close} aria-label="Menü schließen">
            Schließen
          </button>
        </div>

        <nav className="nav-overlay__nav">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-overlay__link${isActive ? ' nav-overlay__link--active' : ''}`
              }
              onClick={close}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-overlay__footer">
          <a href="https://youtube.com/@krawallbruder" target="_blank" rel="noopener noreferrer" className="nav-overlay__social">
            YouTube
          </a>
          <a href="https://instagram.com/krawallbruder" target="_blank" rel="noopener noreferrer" className="nav-overlay__social">
            Instagram
          </a>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div className="nav-overlay__backdrop" onClick={close} aria-hidden="true" />
      )}
    </>
  )
}
