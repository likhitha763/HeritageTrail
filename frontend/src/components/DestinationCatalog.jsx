import { Link } from 'react-router-dom';
import SpotlightCard from './SpotlightCard.jsx';
import { getDestinationArtwork } from '../data/walkArtwork.js';

export default function DestinationCatalog({ destinations }) {
  return (
    <div className="catalog-grid catalog-grid-compact">
      {destinations.map((destination, index) => {
        const toursUrl = `/tours?city=${encodeURIComponent(destination.CityName)}`;
        const artwork = getDestinationArtwork(destination.CityName);

        return (
          <SpotlightCard
            as="article"
            className="walk-card destination-card"
            key={destination.CityName}
            style={{ '--card-order': index }}
          >
            <Link
              className="walk-art destination-art"
              to={toursUrl}
              aria-label={`Explore tours in ${destination.CityName}`}
            >
              {artwork && (
                <img className="walk-art-image" src={artwork.src} alt="" loading="lazy" decoding="async" />
              )}
              <span className="art-index">DESTINATION Nº {String(index + 1).padStart(2, '0')}</span>
              <span className="art-title">{destination.CityName}</span>
              <span className="art-label">{destination.State}</span>
            </Link>
            <div className="walk-card-body">
              <div className="walk-card-kicker">
                <span>INDIA HERITAGE</span>
                <span>{destination.ItineraryCount} TOURS</span>
              </div>
              <div className="walk-card-bottom">
                <p><strong>Discover</strong> <span>local heritage</span></p>
                <Link
                  className="round-arrow"
                  to={toursUrl}
                  aria-label={`See tours in ${destination.CityName}`}
                >
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
