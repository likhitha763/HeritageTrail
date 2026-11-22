import { useEffect, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { getItineraries } from './api.js';
import FallingFooterText from './components/FallingFooterText.jsx';
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
        <NavLink to="/tours">Explore Tours</NavLink>
        <NavLink to="/walks/1">Heritage Detail</NavLink>
        <NavLink to="/bookings">My Bookings</NavLink>
        <NavLink to="/about">Travel Guide</NavLink>
        <NavLink to="/about">Admin</NavLink>
      </nav>
      <div className="header-actions">
        <button className="country-select" type="button" aria-label="Select country">
          <span aria-hidden="true">●</span> All Cities <span aria-hidden="true">⌄</span>
        </button>
        <button className="header-search" type="button" aria-label="Search tours">⌕</button>
        <Link className="header-cta" to="/bookings">Book a walk <span aria-hidden="true">↗</span></Link>
        <span className="header-profile" aria-label="Guest profile">G</span>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link className="footer-brand" to="/">
            HERITAGETRAILS <span>·</span> INDIA
          </Link>
          <p>Thoughtful journeys through India&apos;s most storied places.</p>
          <Link className="footer-cta" to="/tours">
            Explore all tours <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <nav className="footer-column" aria-label="Explore">
          <h2>Explore</h2>
          <Link to="/tours">Heritage walks</Link>
          <Link to="/about">Travel guide</Link>
          <Link to="/bookings">My bookings</Link>
        </nav>

        <nav className="footer-column" aria-label="Plan your visit">
          <h2>Plan your visit</h2>
          <Link to="/about">Before you go</Link>
          <Link to="/tours">Popular destinations</Link>
          <Link to="/bookings">View your itinerary</Link>
        </nav>

        <div className="footer-column footer-about">
          <h2>Heritage, closer</h2>
          <p>Curated walking experiences with local context and room to discover.</p>
        </div>
      </div>

      <section className="footer-story">
        <div className="footer-story-kicker">
          <span className="footer-story-rule" />
          <span>A SMALL NOTE FROM THE JOURNEY</span>
          <span className="footer-story-rule" />
        </div>
        <FallingFooterText />
        <p>Hover over the words and watch each story find its way back.</p>
      </section>

      <div className="footer-bottom">
        <p>© 2026 HeritageTrails India</p>
        <p>Choose your way. Discover the stories.</p>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </div>
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
      <div className="app-shell" id="top">
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
