import { useEffect, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { getItineraries } from './api.js';
import AboutPage from './pages/AboutPage.jsx';
import HomePage from './pages/HomePage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import WalkDetailPage from './pages/WalkDetailPage.jsx';
import WalksPage from './pages/WalksPage.jsx';

function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="HeritageTrails home">
        <span className="brand-mark" aria-hidden="true">H</span>
        <span className="brand-name">HERITAGETRAILS <small>INDIA HERITAGE TOURS</small></span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/tours">Explore tours</NavLink>
        <NavLink to="/about">Travel guide</NavLink>
      </nav>
      <div className="header-actions">
        <span className="city-pill"><span aria-hidden="true">●</span> Across India</span>
        <Link className="header-cta" to="/bookings">My bookings <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="footer-brand" to="/">HERITAGETRAILS <span>·</span> INDIA</Link>
      <p>Choose your way. Discover the stories.</p>
      <Link to="/tours">Find a tour <span aria-hidden="true">→</span></Link>
      <Link to="/bookings">My bookings <span aria-hidden="true">→</span></Link>
    </footer>
  );
}

function NotFoundPage() {
  return (
    <main className="empty-page">
      <p className="eyebrow">THIS PATH ENDS HERE</p>
      <h1>We couldn&apos;t find that page.</h1>
      <Link className="button button-dark" to="/tours">Explore all tours</Link>
    </main>
  );
}

export default function App() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getItineraries()
      .then((items) => {
        if (!cancelled) setItineraries(items);
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
  }, []);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <SiteHeader />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                itineraries={itineraries}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/tours"
            element={
              <WalksPage
                itineraries={itineraries}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/walks"
            element={
              <WalksPage
                itineraries={itineraries}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/tours/:id"
            element={<WalkDetailPage itineraries={itineraries} loading={loading} />}
          />
          <Route
            path="/walks/:id"
            element={<WalkDetailPage itineraries={itineraries} loading={loading} />}
          />
          <Route
            path="/about"
            element={<AboutPage itineraries={itineraries} loading={loading} error={error} />}
          />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}
