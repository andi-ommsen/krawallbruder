import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <Link to="/">
            <img src="/logo.png" alt="Krawallbruder" className="footer__logo" />
          </Link>
          <p className="footer__tagline">Touren. Träume. Asphalt.</p>
        </div>

        <div className="footer__links">
          <Link to="/touren">Touren</Link>
          <Link to="/bikes">Meine Bikes</Link>
          <Link to="/ueber-mich">Über mich</Link>
          <Link to="/youtube">YouTube</Link>
        </div>

        <div className="footer__social">
          <a
            href="https://youtube.com/@krawallbruder"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social-link"
            aria-label="YouTube"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
            </svg>
          </a>
          <a
            href="https://instagram.com/krawallbruder"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social-link"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.2 4.8 1.7 5 5 .1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.2 3.3-1.7 4.8-5 5-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.2-4.8-1.7-5-5C2.1 15.6 2 15.3 2 12c0-3.2 0-3.6.1-4.8.2-3.3 1.7-4.8 5-5C8.4 2.1 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Krawallbruder. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  )
}
