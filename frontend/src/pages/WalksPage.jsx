import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ItineraryCatalog from '../components/ItineraryCatalog.jsx';

export default function WalksPage({ itineraries, loading, error }) {
  const [query, setQuery] = useState('');
  const [duration, setDuration] = useState('all');
  const [travelMode, setTravelMode] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const filteredItineraries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = itineraries.filter((itinerary) => {
      const matchesQuery = !normalizedQuery
        || String(itinerary.Title).toLowerCase().includes(normalizedQuery);
      const hours = Number(itinerary.DurationHours);
      const matchesDuration = duration === 'all'
        || (duration === 'short' && hours <= 2)
        || (duration === 'medium' && hours > 2 && hours <= 3)
        || (duration === 'long' && hours > 3);
      const matchesMode = travelMode === 'all'
        || itinerary.Modes.some((mode) => mode.ModeCode === travelMode);

      return matchesQuery && matchesDuration && matchesMode;
    });

    if (sortBy === 'duration') {
      return [...matching].sort((first, second) => Number(first.DurationHours) - Number(second.DurationHours));
    }
    if (sortBy === 'price') {
      return [...matching].sort((first, second) => Number(first.BasePrice) - Number(second.BasePrice));
    }
    return matching;
  }, [duration, itineraries, query, sortBy, travelMode]);

  return (
    <main className="page-content">
      <section className="page-intro explorer-intro">
        <p className="eyebrow"><span className="eyebrow-dot" /> THE HERITAGE TOUR COLLECTION · MANGALURU</p>
        <h1>Find your way<br />into the city.</h1>
        <p>Choose a route and how you want to explore it: walking, self-drive car, or tourist bus.</p>
      </section>

      {error ? (
        <p className="notice notice-error" role="alert">{error}</p>
      ) : loading ? (
        <p className="notice">Loading all tours…</p>
      ) : itineraries.length === 0 ? (
        <div className="empty-state">
          <p className="eyebrow">NO ROUTES JUST YET</p>
          <h2>The city is ready when you are.</h2>
          <p>Run the sample data script in MySQL Workbench to add the Mangaluru tours.</p>
          <Link className="text-link" to="/">Back to home <span aria-hidden="true">→</span></Link>
        </div>
      ) : (
        <>
          <section className="walk-filters" aria-label="Filter walking routes">
            <label className="walk-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a tour or story"
                aria-label="Search tours"
              />
            </label>
            <label className="filter-select">
              <span>Duration</span>
              <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                <option value="all">Any length</option>
                <option value="short">Up to 2 hours</option>
                <option value="medium">2–3 hours</option>
                <option value="long">Over 3 hours</option>
              </select>
            </label>
            <label className="filter-select">
              <span>Travel mode</span>
              <select value={travelMode} onChange={(event) => setTravelMode(event.target.value)}>
                <option value="all">Any mode</option>
                <option value="WALK">Walking</option>
                <option value="SELF_DRIVE">Self-drive car</option>
                <option value="TOURIST_BUS">Tourist bus</option>
              </select>
            </label>
            <label className="filter-select">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="duration">Shortest first</option>
                <option value="price">Price: low to high</option>
              </select>
            </label>
          </section>
          <div className="catalog-topline">
            <span>{String(filteredItineraries.length).padStart(2, '0')} TOURS</span>
            <span>SELECT A TOUR TO SEE ITS STOPS &amp; TRAVEL OPTIONS</span>
          </div>
          {filteredItineraries.length > 0 ? (
            <ItineraryCatalog itineraries={filteredItineraries} />
          ) : (
            <div className="empty-state filter-empty">
              <p className="eyebrow">NO MATCHING WALKS</p>
              <h2>Try a different search or duration.</h2>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setQuery('');
                  setDuration('all');
                  setTravelMode('all');
                }}
              >
                Clear filters <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
