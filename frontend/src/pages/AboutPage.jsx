import { Link } from 'react-router-dom';
import { getDestinationArtwork } from '../data/walkArtwork.js';
import photoCredits from '../data/landmarkPhotoCredits.json';
import SwarmCursor from '../components/SwarmCursor.jsx';

const steps = [
  ['01', 'Choose a destination', 'Search by city, state, landmark, or place history, then browse matching tours.'],
  ['02', 'Pick a route', 'Review the tour length, base price, travel options, and the ordered stops before deciding.'],
  ['03', 'Choose how to travel', 'Select walking, self-drive, or a tourist bus when that option is offered for your tour.'],
  ['04', 'Reserve your place', 'Enter your name, email, travel date, and group size. Your booking is saved with payment pending.'],
];

const faqs = [
  {
    question: 'Which destinations can I book?',
    answer: 'The destination guide lists all bookable cities. Search also matches states, landmark names, and historical summaries for places with sample tours.',
  },
  {
    question: 'How is the tour price calculated?',
    answer: 'The tour card shows a base price per person. Landmark entry fees for the selected route are added to the final booking total for your group.',
  },
  {
    question: 'Does the website take payment?',
    answer: 'No. This version records the reservation and marks payment as pending; it does not collect card or other payment details.',
  },
  {
    question: 'What does each travel option include?',
    answer: 'Walking and tourist-bus capacities are counted in people or seats. Self-drive capacity is counted in cars, which visitors arrange themselves. The app does not provide vehicle hire or a bus operator.',
  },
  {
    question: 'How do I look up a reservation?',
    answer: 'Open My bookings and enter the same email address used for the reservation. This demo does not have sign-in or email verification.',
  },
];

const destinationTips = {
  Agra: 'Leave extra time for security checks and crowds around the major monuments.',
  Ahmedabad: 'The old city lanes are easiest to explore on foot; allow extra time for the stepwell outside the centre.',
  Amritsar: 'Dress respectfully at places of worship and allow time for security checks.',
  Bengaluru: 'Check opening hours before combining palace visits with the gardens.',
  Chennai: 'Plan for heat and traffic when travelling between the old city and the coast.',
  Delhi: 'Allow extra travel time between historic districts and major landmarks.',
  Hampi: 'The archaeological area is spread out and uneven; carry water and wear comfortable shoes.',
  Hyderabad: 'The old-city bazaar is busy; check fort and palace opening times before travelling.',
  Jaipur: 'Many heritage sights are outdoors; carry water and check fort opening hours before you go.',
  Kolkata: 'Allow time for traffic between riverfront landmarks and the city centre.',
  Kochi: 'Allow time for transfers between the Fort Kochi waterfront and Mattancherry stops.',
  Mangaluru: 'Routes can combine waterfront and temple stops, so check opening times before setting out.',
  Mumbai: 'Check ferry schedules and allow time for security at major waterfront attractions.',
  Mysuru: 'Start early if you plan to combine palace, market, and hilltop stops.',
  Puri: 'Respect temple access rules; some places of worship have visitor restrictions.',
  Varanasi: 'Old-city lanes and ghat steps can be uneven; comfortable footwear is useful.',
};

export default function AboutPage({ itineraries, loading, error }) {
  const destinationsByName = new Map();
  for (const itinerary of itineraries) {
    const cityName = itinerary.CityName || 'India';
    const destination = destinationsByName.get(cityName) || {
      CityName: cityName,
      State: itinerary.State || '',
      HistoricalSignificance: itinerary.HistoricalSignificance || '',
      Itineraries: [],
    };
    destination.Itineraries.push(itinerary);
    destinationsByName.set(cityName, destination);
  }
  const destinations = [...destinationsByName.values()]
    .sort((first, second) => first.CityName.localeCompare(second.CityName));

  return (
    <main className="page-content guide-page">
      <SwarmCursor className="blue-swarm-intro" count={280} size={2} spread={100}>
        <section className="page-intro guide-intro">
          <p className="eyebrow">TRAVEL GUIDE · INDIA</p>
          <h1>Plan a day of<br />local stories.</h1>
          <p>Find a destination, choose a route that suits your pace, and see what to expect before you reserve.</p>
        </section>
      </SwarmCursor>

      <nav className="guide-nav" aria-label="Travel guide sections">
        <a href="#how-it-works">How it works</a>
        <a href="#destinations">Destinations</a>
        <a href="#faqs">FAQs</a>
      </nav>

      <section className="guide-section" id="how-it-works" aria-labelledby="guide-steps-title">
        <div className="guide-section-heading">
          <p className="eyebrow">A SIMPLE WAY TO PLAN</p>
          <h2 id="guide-steps-title">From first look to reservation.</h2>
        </div>
        <div className="guide-step-grid">
          {steps.map(([number, title, description]) => (
            <article className="guide-step" key={number}>
              <span className="guide-step-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section" id="destinations" aria-labelledby="guide-destinations-title">
        <div className="guide-section-heading">
          <p className="eyebrow">EXPLORE BY PLACE</p>
          <h2 id="guide-destinations-title">Destinations and tour highlights.</h2>
          <p>Each highlight links to its route, stops, travel options, and booking form.</p>
        </div>
        {error ? (
          <p className="notice notice-error" role="alert">{error}</p>
        ) : loading ? (
          <p className="notice" role="status">Loading destinations…</p>
        ) : destinations.length === 0 ? (
          <p className="notice">No destinations are available yet. Check that the sample data has been loaded.</p>
        ) : (
          <div className="guide-destination-grid">
            {destinations.map((destination) => {
              const cityUrl = `/tours?city=${encodeURIComponent(destination.CityName)}`;
              const artwork = getDestinationArtwork(destination.CityName);

              return (
                <article className="guide-destination-card" key={destination.CityName}>
                  <Link
                    className="guide-destination-art"
                    to={cityUrl}
                    aria-label={`Explore tours in ${destination.CityName}`}
                  >
                    {artwork && (
                      <img src={artwork.src} alt="" loading="lazy" decoding="async" />
                    )}
                    <span className="guide-destination-name">{destination.CityName}</span>
                    <span className="guide-destination-state">{destination.State}</span>
                  </Link>
                  <div className="guide-destination-copy">
                    <p className="eyebrow">
                      {destination.Itineraries.length} {destination.Itineraries.length === 1 ? 'TOUR' : 'TOURS'} · ROUTE HIGHLIGHTS
                    </p>
                    {destination.HistoricalSignificance && (
                      <p className="guide-destination-summary">{destination.HistoricalSignificance}</p>
                    )}
                    <p className="guide-destination-tip">
                      <strong>Travel tip:</strong> {destinationTips[destination.CityName] || 'Check the route stops and local opening hours before setting out.'}
                    </p>
                    <ul>
                      {destination.Itineraries.map((itinerary) => (
                        <li key={itinerary.ItineraryID}>
                          <Link to={`/tours/${itinerary.ItineraryID}`}>{itinerary.Title}</Link>
                        </li>
                      ))}
                    </ul>
                    <Link className="text-link" to={cityUrl}>View tours <span aria-hidden="true">↗</span></Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="guide-section" id="faqs" aria-labelledby="guide-faq-title">
        <div className="guide-section-heading">
          <p className="eyebrow">GOOD TO KNOW</p>
          <h2 id="guide-faq-title">Frequently asked questions.</h2>
        </div>
        <div className="guide-faq-list">
          {faqs.map(({ question, answer }) => (
            <details className="guide-faq" key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="guide-section photo-credits-section" id="photo-credits" aria-labelledby="photo-credits-title">
        <div className="guide-section-heading">
          <p className="eyebrow">OPEN IMAGE SOURCES</p>
          <h2 id="photo-credits-title">Landmark photo credits.</h2>
          <p>Photographs are stored locally for this site. Each credit links to its source and license.</p>
        </div>
        <details className="guide-faq photo-credits-details">
          <summary>View {photoCredits.length} photo credits</summary>
          <ul className="photo-credit-list">
            {photoCredits.map((photo) => (
              <li key={photo.landmarkId}>
                <strong>{photo.landmark} · {photo.city}</strong>
                <span>
                  Photo by {photo.author} ·{' '}
                  <a href={photo.sourceUrl} target="_blank" rel="noreferrer">Wikimedia Commons</a>
                  {' '}·{' '}
                  <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a>
                </span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="about-cta">
        <p className="eyebrow eyebrow-light">READY TO STEP OUT?</p>
        <h2>Find the tour that feels like yours.</h2>
        <Link className="button button-paper" to="/tours">Explore the tours <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
