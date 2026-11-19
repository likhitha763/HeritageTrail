import { Link, useParams } from 'react-router-dom';
import BookingForm from '../components/BookingForm.jsx';
import Timeline from '../components/Timeline.jsx';
import { getDestinationArtwork, getWalkArtwork } from '../data/walkArtwork.js';

export default function WalkDetailPage({ itineraries, loading }) {
  const { id } = useParams();
  const itinerary = itineraries.find((item) => String(item.ItineraryID) === id);

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

  return (
    <main className="page-content detail-page">
      <Link className="back-link" to="/tours"><span aria-hidden="true">←</span> ALL CITY TOURS</Link>
      <section className="detail-hero">
        {artwork && <img className="detail-hero-image" src={artwork.src} alt={artwork.alt} />}
        <div className="detail-hero-shade" aria-hidden="true" />
        <div className="detail-hero-copy">
          <p className="eyebrow eyebrow-light">
            HERITAGETRAILS TOUR Nº {String(itinerary.ItineraryID).padStart(2, '0')} · {itinerary.CityName}, {itinerary.State}
          </p>
          <h1>{itinerary.Title}</h1>
          <p>Explore the route stop by stop and choose the travel option that suits you.</p>
        </div>
        <div className="detail-stats">
          <span><strong>{itinerary.DurationHours}</strong> hours</span>
          <span><strong>{itinerary.Modes.length}</strong> travel options</span>
          <span><strong>₹{Number(itinerary.BasePrice).toFixed(0)}</strong> base price</span>
        </div>
      </section>

      <div className="detail-layout">
        <Timeline itinerary={itinerary} />
        <BookingForm itinerary={itinerary} />
      </div>
    </main>
  );
}
