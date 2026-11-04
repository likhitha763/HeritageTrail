import { Link } from 'react-router-dom';
import ItineraryCatalog from '../components/ItineraryCatalog.jsx';

export default function HomePage({ itineraries, loading, error }) {
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
          <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> HERITAGE TOURS · COASTAL KARNATAKA</p>
          <h1>A city, your<br />way.</h1>
          <p className="hero-description">
            Explore Mangaluru&apos;s layered stories on foot, by self-drive car,
            or with a tourist-bus route.
          </p>
          <Link className="button button-paper" to="/tours">Find your tour <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="hero-side-note">
          <span>12° 52&apos; N</span>
          <span>74° 50&apos; E</span>
          <i />
          <small>MANGALURU<br />KARNATAKA, INDIA</small>
        </div>
        <div className="hero-caption"><span>01 — 04</span><span>THE COAST HAS MANY STORIES</span></div>
      </section>

      <section className="intro-strip">
        <p>NOT JUST A CHECKLIST.</p>
        <p>Local histories, thoughtful routes, and room to look around.</p>
        <Link to="/about">Our point of view <span aria-hidden="true">→</span></Link>
      </section>

      <section className="home-walks content-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CHOOSE YOUR PACE</p>
            <h2>Tours worth discovering.</h2>
          </div>
          <Link className="text-link" to="/tours">See all tours <span aria-hidden="true">↗</span></Link>
        </div>
        {error ? (
          <p className="notice notice-error" role="alert">{error}</p>
        ) : loading ? (
          <p className="notice">Finding the routes…</p>
        ) : itineraries.length === 0 ? (
          <p className="notice">No tours are available yet. Check that the database seed has been run.</p>
        ) : (
          <ItineraryCatalog itineraries={itineraries.slice(0, 3)} compact />
        )}
      </section>

      <section className="home-note">
        <span className="note-number">A NOTE FROM THE JOURNEY</span>
        <p>“The best way into a place is through the stories it keeps.”</p>
        <Link to="/about">Get to know HeritageTrails <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
