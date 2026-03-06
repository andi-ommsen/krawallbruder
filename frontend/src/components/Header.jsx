import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import './Header.css'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/touren', label: 'Touren' },
  { to: '/bikes', label: 'Meine Bikes' },
  { to: '/ueber-mich', label: 'Über mich' },
  { to: '/youtube', label: 'YouTube' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="header__inner container">
        <Link to="/" className="header__wordmark" onClick={() => setMenuOpen(false)}>
          Krawallbruder
        </Link>

        <nav className={`header__nav${menuOpen ? ' header__nav--open' : ''}`}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="header__burger"
          aria-label="Menü öffnen"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={`burger-bar${menuOpen ? ' open' : ''}`} />
          <span className={`burger-bar${menuOpen ? ' open' : ''}`} />
          <span className={`burger-bar${menuOpen ? ' open' : ''}`} />
        </button>
      </div>
    </header>
  )
}
