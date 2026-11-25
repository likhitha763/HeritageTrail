import { useEffect, useState } from 'react';
import { getItineraryDetails } from '../api.js';
import { getLandmarkArtwork } from '../data/landmarkArtwork.js';
import { getDestinationArtwork } from '../data/walkArtwork.js';

export default function Timeline({ itinerary }) {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setStops([]);

    getItineraryDetails(itinerary.ItineraryID)
      .then((items) => {
        if (!cancelled) setStops(items);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [itinerary.ItineraryID]);

  return (
    <section className="timeline-section">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">THE ROUTE · {itinerary.DurationHours} HOURS</p>
          <h2>{itinerary.Title}</h2>
        </div>
        <span className="stop-count">{loading ? '…' : `${stops.length} STOPS`}</span>
      </div>

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {loading ? (
        <p className="notice">Loading the route…</p>
      ) : stops.length === 0 && !error ? (
        <p className="notice">No stops are linked to this walk yet. Run the updated seed script in MySQL Workbench.</p>
      ) : (
        <ol className="timeline">
          {stops.map((stop) => {
            const landmarkPhoto = getLandmarkArtwork(stop.LandmarkID);
            const artwork = landmarkPhoto || getDestinationArtwork(stop.CityName);
            const imageAlt = landmarkPhoto
              ? landmarkPhoto.alt
              : `Representative view of ${stop.CityName}; ${stop.LandmarkName} is on this route`;

            return (
              <li className="timeline-stop" key={`${stop.StopOrder}-${stop.LandmarkName}`}>
                <span className="timeline-marker">{String(stop.StopOrder).padStart(2, '0')}</span>
                <div className="stop-content">
                  <div className="stop-copy">
                    <p className="stop-city">{stop.CityName} · {itinerary.State}</p>
                    <h3>{stop.LandmarkName}</h3>
                    {stop.LandmarkDescription && <p className="stop-description">{stop.LandmarkDescription}</p>}
                    <p className="stop-meta">
                      {stop.EntryFee > 0 ? `Entry ₹${Number(stop.EntryFee).toFixed(2)}` : 'Free entry'}
                    </p>
                  </div>
                  {artwork && (
                    <img
                      className="stop-photo"
                      src={artwork.src}
                      alt={imageAlt}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
