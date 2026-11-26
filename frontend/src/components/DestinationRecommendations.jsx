import { createMapsSearchUrl } from '../data/mapLinks.js';

const recommendationTypes = [
  {
    title: 'Hotels & homestays',
    query: 'hotels and homestays',
    label: 'Compare places to stay',
    icon: '⌂',
  },
  {
    title: 'Restaurants & cafes',
    query: 'restaurants and cafes',
    label: 'Explore local dining',
    icon: '✳',
  },
];

export default function DestinationRecommendations({ cityName, state, compact = false }) {
  const location = [cityName, state, 'India'].filter(Boolean).join(', ');

  return (
    <section
      className={`destination-recommendations${compact ? ' destination-recommendations-compact' : ''}`}
      aria-label={`Hotels and restaurants in ${cityName}`}
    >
      <div className="destination-recommendations-heading">
        <p className="eyebrow">STAY &amp; DINE · {cityName.toUpperCase()}</p>
        {!compact && <h2>Find a place to stay or eat nearby.</h2>}
        {!compact && (
          <p>Open live map listings to compare nearby options, reviews, and opening hours.</p>
        )}
      </div>
      <div className="destination-recommendation-grid">
        {recommendationTypes.map((recommendation) => {
          const search = `${recommendation.query} in ${location}`;
          const mapsUrl = createMapsSearchUrl(search);

          return (
            <a
              className="destination-recommendation-card"
              href={mapsUrl}
              key={recommendation.title}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="destination-recommendation-icon" aria-hidden="true">
                {recommendation.icon}
              </span>
              <span className="destination-recommendation-copy">
                <strong>{recommendation.title}</strong>
                <small>{recommendation.label}</small>
              </span>
              <span className="destination-recommendation-arrow" aria-hidden="true">↗</span>
            </a>
          );
        })}
      </div>
      <p className="destination-recommendations-note">
        Listings, prices, and hours can change; confirm details before you go.
      </p>
    </section>
  );
}
