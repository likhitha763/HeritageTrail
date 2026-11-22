import { Link } from 'react-router-dom';
import SpotlightCard from './SpotlightCard.jsx';
import { getDestinationArtwork } from '../data/walkArtwork.js';

const destinationCaptions = {
  Agra: 'Marble monuments, riverside gardens, and Mughal stories.',
  Delhi: 'Layer upon layer of living history in India’s capital.',
  Hampi: 'Temple roads and the monumental ruins of Vijayanagara.',
  Jaipur: 'A rose-coloured city of palaces, forts, and astronomy.',
  Kochi: 'A historic harbour shaped by centuries of sea trade.',
  Mangaluru: 'Coastal heritage where many traditions meet.',
  Mysuru: 'Royal architecture, fragrant markets, and hilltop shrines.',
  Varanasi: 'Ancient lanes and timeless life along the Ganges.',
};

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
              <span className="art-copy">
                <span className="art-title shiny-hover-text">{destination.CityName}</span>
                <span className="art-description shiny-hover-text">
                  {destinationCaptions[destination.CityName] || 'Find your way through local heritage and stories.'}
                </span>
              </span>
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
