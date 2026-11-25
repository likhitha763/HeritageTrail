import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ItineraryCatalog from '../components/ItineraryCatalog.jsx';
import SwarmCursor from '../components/SwarmCursor.jsx';

export default function WalksPage({ itineraries, loading, error }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [duration, setDuration] = useState('all');
  const [travelMode, setTravelMode] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const city = searchParams.get('city') || 'all';
  const searchInput = useRef(null);

  useEffect(() => {
    if (window.location.hash === '#tour-search') {
      searchInput.current?.focus();
      searchInput.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const cities = useMemo(
    () => [...new Set(itineraries.map((itinerary) => itinerary.CityName).filter(Boolean))].sort(),
    [itineraries],
  );

  const filteredItineraries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = itineraries.filter((itinerary) => {
      const matchesQuery = !normalizedQuery
        || `${itinerary.Title} ${itinerary.CityName} ${itinerary.State} ${itinerary.HistoricalSignificance} ${itinerary.SearchText}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCity = city === 'all' || itinerary.CityName === city;
      const hours = Number(itinerary.DurationHours);
      const matchesDuration = duration === 'all'
        || (duration === 'short' && hours <= 2)
        || (duration === 'medium' && hours > 2 && hours <= 3)
        || (duration === 'long' && hours > 3);
      const matchesMode = travelMode === 'all'
        || itinerary.Modes.some((mode) => mode.ModeCode === travelMode);

      return matchesQuery && matchesCity && matchesDuration && matchesMode;
    });

    if (sortBy === 'duration') {
      return [...matching].sort((first, second) => Number(first.DurationHours) - Number(second.DurationHours));
    }
    if (sortBy === 'price') {
      return [...matching].sort((first, second) => Number(first.BasePrice) - Number(second.BasePrice));
    }
    return matching;
  }, [city, duration, itineraries, query, sortBy, travelMode]);

  function selectCity(cityName) {
    const nextParams = new URLSearchParams(searchParams);
    if (cityName === 'all') {
      nextParams.delete('city');
    } else {
      nextParams.set('city', cityName);
    }
    setSearchParams(nextParams);
  }

  return (
    <main className="page-content">
      <SwarmCursor className="blue-swarm-intro" count={300} size={2} spread={104}>
        <section className="page-intro explorer-intro">
          <p className="eyebrow"><span className="eyebrow-dot" /> THE HERITAGE TOUR COLLECTION · INDIA</p>
          <h1>Find your way<br />through India.</h1>
          <p>Choose a destination and how you want to explore it: walking, self-drive car, or tourist bus.</p>
        </section>
      </SwarmCursor>

      {error ? (
        <p className="notice notice-error" role="alert">{error}</p>
      ) : loading ? (
        <p className="notice">Loading all tours…</p>
      ) : itineraries.length === 0 ? (
        <div className="empty-state">
          <p className="eyebrow">NO ROUTES JUST YET</p>
          <h2>India is ready when you are.</h2>
          <p>Run the sample data script in MySQL Workbench to add the destination tours.</p>
          <Link className="text-link" to="/">Back to home <span aria-hidden="true">→</span></Link>
        </div>
      ) : (
        <>
          <section className="walk-filters" aria-label="Filter tours">
            <label className="walk-search">
              <span aria-hidden="true">⌕</span>
              <input
                id="tour-search"
                ref={searchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a city, state, tour or story"
                aria-label="Search cities, states, tours, or stories"
              />
            </label>
            <label className="filter-select">
              <span>Destination</span>
              <select value={city} onChange={(event) => selectCity(event.target.value)}>
                <option value="all">All cities</option>
                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>{cityName}</option>
                ))}
              </select>
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
              <h2>Try a different city, search, or duration.</h2>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchParams(new URLSearchParams());
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
