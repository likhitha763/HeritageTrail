import { Link } from 'react-router-dom';
import DestinationCatalog from '../components/DestinationCatalog.jsx';

export default function HomePage({ itineraries, loading, error }) {
  const destinationsByName = new Map();
  for (const itinerary of itineraries) {
    const cityName = itinerary.CityName || 'India';
    const destination = destinationsByName.get(cityName) || {
      CityName: cityName,
      State: itinerary.State || '',
      ItineraryCount: 0,
    };
    destination.ItineraryCount += 1;
    destinationsByName.set(cityName, destination);
  }
  const destinations = [...destinationsByName.values()]
    .sort((first, second) => first.CityName.localeCompare(second.CityName));
  const destinationCount = destinations.length;
  const destinationLabel = loading || !destinationCount
    ? 'INDIA'
    : `${String(destinationCount).padStart(2, '0')} DESTINATIONS`;

  return (
    <main>
      <section className="home-hero">
        <img
          className="home-hero-image"
          src="/images/mangaluru-city.jpg"
          alt="View over the rooftops and streets of Mangaluru"
          fetchPriority="high"
        />
        <div className="hero-image-shade" aria-hidden="true" />
        <div className="hero-texture" aria-hidden="true" />
        <div className="home-hero-copy">
          <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> HERITAGE TOURS · ACROSS INDIA</p>
          <h1>A country,<br />your way.</h1>
          <p className="hero-description">
            Explore stories across Mangaluru, Delhi, Jaipur, Agra, Varanasi,
            Mysuru, Hampi, and Kochi by foot, self-drive car, or tourist bus.
          </p>
          <Link className="button button-paper" to="/tours">Find your tour <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="hero-side-note">
          <span>12° 52&apos; N</span>
          <span>74° 50&apos; E</span>
          <i />
          <small>MANGALURU<br />ONE PLACE TO BEGIN</small>
        </div>
        <div className="hero-caption">
          <span>{destinationLabel}</span>
          <span>ONE COUNTRY, MANY STORIES</span>
        </div>
      </section>

      <section className="intro-strip">
        <p>NOT JUST A CHECKLIST.</p>
        <p>Local histories, thoughtful routes, and room to look around.</p>
        <Link to="/about">How it works <span aria-hidden="true">→</span></Link>
      </section>

      <section className="home-walks content-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CHOOSE YOUR DESTINATION</p>
            <h2>Cities worth discovering.</h2>
          </div>
          <Link className="text-link" to="/tours">See all destinations <span aria-hidden="true">↗</span></Link>
        </div>
        {error ? (
          <p className="notice notice-error" role="alert">{error}</p>
        ) : loading ? (
          <p className="notice">Finding the routes…</p>
        ) : itineraries.length === 0 ? (
          <p className="notice">No tours are available yet. Check that the database seed has been run.</p>
        ) : (
          <DestinationCatalog destinations={destinations} />
        )}
      </section>

      <section className="home-note">
        <span className="note-number">A NOTE FROM THE JOURNEY</span>
        <p>“The best way into a place is through the stories it keeps.”</p>
        <Link to="/about">Plan your visit <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
