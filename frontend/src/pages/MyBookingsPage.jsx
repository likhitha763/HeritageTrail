import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBookings } from '../api.js';

function formatTravelDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MyBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromUrl);
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!emailFromUrl) {
      setBookings([]);
      setSearched(false);
      return undefined;
    }

    let cancelled = false;
    setEmail(emailFromUrl);
    setLoading(true);
    setError('');
    setSearched(true);

    getBookings(emailFromUrl)
      .then((items) => {
        if (!cancelled) setBookings(items);
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
  }, [emailFromUrl]);

  function searchBookings(event) {
    event.preventDefault();
    setSearchParams({ email: email.trim() });
  }

  return (
    <main className="page-content bookings-page">
      <section className="page-intro">
        <p className="eyebrow">YOUR HERITAGETRAILS RESERVATIONS</p>
        <h1>Your tours,<br />all in one place.</h1>
        <p>Enter the email address used when booking to find your reservations.</p>
      </section>

      <section className="bookings-lookup">
        <form className="bookings-search" onSubmit={searchBookings}>
          <label htmlFor="booking-email">Booking email address</label>
          <div className="bookings-search-row">
            <input
              id="booking-email"
              type="email"
              autoComplete="email"
              maxLength="254"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Searching…' : 'Find my bookings'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <p className="bookings-privacy-note">
          This demo does not have sign-in or email verification. Anyone who knows an email address can look up the bookings associated with it.
        </p>

        {error && <p className="notice notice-error" role="alert">{error}</p>}
        {loading && <p className="notice" role="status">Looking up your bookings…</p>}
        {!loading && searched && !error && bookings.length === 0 && (
          <div className="empty-state bookings-empty">
            <p className="eyebrow">NO BOOKINGS FOUND</p>
            <h2>There are no reservations for that email yet.</h2>
            <Link className="text-link" to="/tours">Explore the tours <span aria-hidden="true">→</span></Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="booking-results" aria-live="polite">
            <div className="catalog-topline">
              <span>{String(bookings.length).padStart(2, '0')} BOOKINGS</span>
              <span>ORDERED BY TRAVEL DATE</span>
            </div>
            {bookings.map((booking) => (
              <article className="booking-record" key={booking.BookingID}>
                <div className="booking-record-main">
                  <p className="eyebrow">BOOKING Nº {booking.BookingID}</p>
                  <h2>{booking.ItineraryTitle}</h2>
                  <p>
                    {formatTravelDate(booking.TravelDate)} · {booking.GroupSize} {booking.GroupSize === 1 ? 'person' : 'people'}
                    {' · '}{booking.TourMode}
                    {booking.VehicleCount > 0 ? ` · ${booking.VehicleCount} ${booking.VehicleCount === 1 ? 'car' : 'cars'}` : ''}
                  </p>
                </div>
                <div className="booking-record-total">
                  <span>{booking.PaymentStatus}</span>
                  <strong>₹{Number(booking.FinalPrice).toFixed(2)}</strong>
                  <small>Total booking price</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
