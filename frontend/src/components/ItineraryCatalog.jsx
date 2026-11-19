import { Link } from 'react-router-dom';
import SpotlightCard from './SpotlightCard.jsx';
import { getDestinationArtwork, getWalkArtwork } from '../data/walkArtwork.js';

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
              <span className="art-title">{itinerary.Title}</span>
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
