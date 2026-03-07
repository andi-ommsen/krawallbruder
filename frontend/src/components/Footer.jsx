import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__bottom">
        <p>
          &copy; {new Date().getFullYear()} Krawallbruder. Alle Rechte vorbehalten.{' '}
          <Link to="/impressum" className="footer__impressum-link">Impressum</Link>
        </p>
      </div>
    </footer>
  )
}
