import { Link } from 'react-router-dom';
import SpotlightCard from './SpotlightCard.jsx';
import { getDestinationArtwork, getWalkArtwork } from '../data/walkArtwork.js';

const tourCaptions = {
  1: 'Coastal landmarks, sacred spaces, and stories of an old port city.',
  2: 'Temple traditions and quiet corners of Mangaluru.',
  3: 'Trace the city’s maritime past along the Arabian Sea.',
  4: 'A journey through local faith, art, and architecture.',
  5: 'Discover the imperial legacy woven through Old Delhi.',
  6: 'From soaring minarets to the city’s ancient ruins.',
  7: 'Palaces, observatories, and the colour of the Pink City.',
  8: 'Follow the hilltop forts that guarded Jaipur.',
  9: 'Mughal monuments and gardens beside the Yamuna.',
  10: 'Riverside views and finely detailed Mughal tombs.',
  11: 'A living riverfront shaped by centuries of devotion.',
  12: 'Explore the quiet Buddhist landmarks of ancient Sarnath.',
  13: 'Royal Mysuru, from palace courtyards to lively markets.',
  14: 'Sacred hilltop sites and stories of the old kingdom.',
  15: 'Walk among Vijayanagara temples and bazaar streets.',
  16: 'Step into the ceremonial heart of the Vijayanagara empire.',
  17: 'A sea-breeze walk through Kochi’s layered waterfront.',
  18: 'Explore palace murals and the old spice-trading quarter.',
};

export default function ItineraryCatalog({ itineraries, compact = false }) {
  return (
    <div className={`catalog-grid${compact ? ' catalog-grid-compact' : ''}`}>
      {itineraries.map((itinerary, index) => {
        const artwork = getWalkArtwork(itinerary.ItineraryID)
          || getDestinationArtwork(itinerary.CityName);

        return (
          <SpotlightCard
            as="article"
            className="walk-card"
            key={itinerary.ItineraryID}
            style={{ '--card-order': index }}
          >
            <Link
              className="walk-art"
              to={`/tours/${itinerary.ItineraryID}`}
              aria-label={`View ${itinerary.Title}`}
            >
              {artwork && (
                <img className="walk-art-image" src={artwork.src} alt="" loading="lazy" decoding="async" />
              )}
              <span className="art-index">TOUR Nº {String(index + 1).padStart(2, '0')}</span>
              <span className="art-copy">
                <span className="art-title shiny-hover-text">{itinerary.Title}</span>
                <span className="art-description shiny-hover-text">
                  {tourCaptions[itinerary.ItineraryID] || `Discover the landmarks and local stories of ${itinerary.CityName}.`}
                </span>
              </span>
              <span className="art-label">{[itinerary.CityName, itinerary.State].filter(Boolean).join(' · ')}</span>
            </Link>
            <div className="walk-card-body">
              <div className="walk-card-kicker">
                <span>{itinerary.DurationHours} HOURS</span>
                <span>{itinerary.Modes.length} TRAVEL OPTIONS</span>
              </div>
              <h3><Link to={`/tours/${itinerary.ItineraryID}`}>{itinerary.Title}</Link></h3>
              <div className="transport-chips" aria-label="Available travel options">
                {itinerary.Modes.map((mode) => (
                  <span key={mode.TourModeID}>{mode.ModeName}</span>
                ))}
              </div>
              <div className="walk-card-bottom">
                <p><strong>₹{Number(itinerary.BasePrice).toFixed(0)}</strong> <span>per person</span></p>
                <Link className="round-arrow" to={`/tours/${itinerary.ItineraryID}`} aria-label={`View ${itinerary.Title}`}>
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
