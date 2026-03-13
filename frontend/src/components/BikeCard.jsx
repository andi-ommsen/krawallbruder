import { Link } from 'react-router-dom'
import './BikeCard.css'

export default function BikeCard({ bike }) {
  return (
    <Link to={`/bikes/${bike.slug}`} className="bike-card card">
      <div className="bike-card__image-wrap">
        <img
          src={bike.featuredImage || 'https://picsum.photos/seed/bike/800/500'}
          alt={bike.name}
          className="bike-card__image"
          loading="lazy"
        />
      </div>

      <div className="bike-card__body">
        <div className="bike-card__header">
          <h3 className="bike-card__name">{bike.name}</h3>
          <span className="bike-card__year">{bike.year}</span>
        </div>

        {bike.technicalData && (
          <table className="bike-card__specs">
            <tbody>
              {Object.entries(bike.technicalData).slice(0, 4).map(([key, val]) => (
                <tr key={key}>
                  <th>{key}</th>
                  <td>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <span className="btn btn-primary">Zur Maschine →</span>
      </div>
    </Link>
  )
}
