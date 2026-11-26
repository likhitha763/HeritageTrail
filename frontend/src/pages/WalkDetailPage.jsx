import { Link, useParams } from 'react-router-dom';
import BookingForm from '../components/BookingForm.jsx';
import DestinationRecommendations from '../components/DestinationRecommendations.jsx';
import RouteDayPlanner from '../components/RouteDayPlanner.jsx';
import Timeline from '../components/Timeline.jsx';
import useItineraryStops from '../hooks/useItineraryStops.js';
import { getDestinationArtwork, getWalkArtwork } from '../data/walkArtwork.js';

export default function WalkDetailPage({ itineraries, loading }) {
  const { id } = useParams();
  const itinerary = itineraries.find((item) => String(item.ItineraryID) === id);
  const route = useItineraryStops(itinerary?.ItineraryID);

  if (loading) {
    return <main className="page-content"><p className="notice">Finding this walk…</p></main>;
  }

  if (!itinerary) {
    return (
      <main className="empty-page">
        <p className="eyebrow">TOUR NOT FOUND</p>
        <h1>This trail may have changed.</h1>
        <Link className="button button-dark" to="/tours">Browse all tours</Link>
      </main>
    );
  }

  const artwork = getWalkArtwork(itinerary.ItineraryID)
    || getDestinationArtwork(itinerary.CityName);
  const facts = {
    Mangaluru: [
      'Mangaluru takes its name from the historic Mangaladevi Temple.',
      'The city is a major port where Arabian Sea trade shaped its food and architecture.',
      'The route crosses coast, Catholic, Hindu, and railway heritage.',
    ],
    Jaipur: [
      'Jaipur was founded in 1727 and planned around nine square sectors.',
      'The Jantar Mantar is a UNESCO World Heritage astronomical observatory.',
      'The city is known internationally for its rose-red architectural style.',
    ],
    Delhi: [
      'Delhi has served as the centre of successive empires for more than a millennium.',
      'The Mughal garden-tomb tradition influenced later royal funerary architecture.',
      'Old and New Delhi preserve contrasting phases of the city’s history.',
    ],
  };
  const trivia = facts[itinerary.CityName] || [
    'This route brings together the landscape, monuments, and living traditions of the city.',
    'Entry conditions and walking distances can change with the season.',
    'Indian heritage sites remain active places of worship and community life.',
  ];

  return (
    <main className="page-content detail-page">
      <div className="detail-breadcrumb">
        <Link className="back-link" to="/tours"><span aria-hidden="true">←</span> EXPLORE TOURS</Link>
        <span>ARCHIVAL WALK MONOGRAPH · EDITION 2026</span>
      </div>
      <section className="detail-hero">
        {artwork && <img className="detail-hero-image" src={artwork.src} alt={artwork.alt} />}
        <div className="detail-hero-shade" aria-hidden="true" />
        <div className="detail-hero-copy">
          <p className="eyebrow eyebrow-light">
            HERITAGETRAILS TOUR Nº {String(itinerary.ItineraryID).padStart(2, '0')} · {itinerary.CityName}, {itinerary.State}
          </p>
          <h1>{itinerary.Title}</h1>
          <p>
            A guided heritage circuit tracing the civic, sacred, and architectural stories of {itinerary.CityName}.
            Walk between significant places or choose a supported travel mode.
          </p>
          <div className="detail-tags" aria-label="Tour features">
            <span>◉ {itinerary.CityName} circuit</span>
            <span>♙ Expert-led</span>
            <span>◎ {itinerary.DurationHours}-hour expedition</span>
            <span>◫ Entry &amp; ticket support</span>
          </div>
        </div>
        <div className="detail-stats">
          <span><strong>{itinerary.DurationHours}</strong> <small>HOURS</small></span>
          <span><strong>{itinerary.Modes.length}</strong> <small>TRAVEL OPTIONS</small></span>
          <span><strong>₹{Number(itinerary.BasePrice).toFixed(0)}</strong> <small>BASE PRICE</small></span>
        </div>
      </section>

      <section className="detail-synopsis">
        <div>
          <p className="eyebrow">CIRCUIT SYNOPSIS</p>
          <p>
            {itinerary.HistoricalSignificance
              || `Follow a carefully ordered route through ${itinerary.CityName}, from its earliest associations to the landmarks that shape the city today.`}
          </p>
        </div>
        <div className="trivia-facts" aria-label="Trivia facts">
          {trivia.map((fact, index) => (
            <article key={fact}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{fact}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="detail-layout">
        <Timeline
          itinerary={itinerary}
          stops={route.stops}
          loading={route.loading}
          error={route.error}
        />
        <BookingForm itinerary={itinerary} />
      </div>

      {!route.loading && !route.error && route.stops.length > 0 && (
        <RouteDayPlanner
          key={itinerary.ItineraryID}
          itinerary={itinerary}
          stops={route.stops}
        />
      )}

      <DestinationRecommendations cityName={itinerary.CityName} state={itinerary.State} />

      <section className="route-logistics">
        <div className="logistics-heading">
          <p className="eyebrow">PLANNING INFORMATION</p>
          <h2>Route Logistics &amp; Expedition Guidelines</h2>
        </div>
        <div className="logistics-grid">
          <article>
            <span aria-hidden="true">◷</span>
            <h3>Hydration Protocol</h3>
            <p>Carry refillable water. Start before midday and allow rest intervals at shaded stops.</p>
          </article>
          <article>
            <span aria-hidden="true">♙</span>
            <h3>Footwear &amp; Advisory</h3>
            <p>Use sturdy shoes and weather-appropriate clothing. Routes include uneven stone surfaces.</p>
          </article>
          <article>
            <span aria-hidden="true">◉</span>
            <h3>Photography Rights</h3>
            <p>Ask before photographing worshippers or restricted interiors. Flash is not permitted in many monuments.</p>
          </article>
          <article>
            <span aria-hidden="true">!</span>
            <h3>Route Reference</h3>
            <p>Keep this pass accessible during the walk. Entry access and opening hours may vary.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
