import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBookings, payBooking } from '../api.js';
import SwarmCursor from '../components/SwarmCursor.jsx';

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
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  function makePassCode(booking) {
    return `HT-${formatTravelDate(booking.TravelDate).replaceAll(',', '').replaceAll(' ', '-').toUpperCase()}-${String(booking.BookingID).padStart(4, '0')}`;
  }

  async function confirmPayment(event) {
    event.preventDefault();
    if (!selectedPayment) return;

    setPaying(true);
    setError('');
    setPaymentMessage('');
    try {
      await payBooking(selectedPayment.BookingID, email.trim(), paymentMethod);
      setBookings((current) => current.map((booking) => (
        booking.BookingID === selectedPayment.BookingID
          ? { ...booking, PaymentStatus: 'Paid' }
          : booking
      )));
      setPaymentMessage(`Payment confirmed for pass ${makePassCode(selectedPayment)}.`);
      setSelectedPayment(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPaying(false);
    }
  }

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
      <SwarmCursor className="blue-swarm-intro" count={260} size={2} spread={96}>
        <section className="page-intro">
          <p className="eyebrow">OFFICIAL HERITAGE LEDGER</p>
          <h1>My Reservations <em>&amp; Passes</em></h1>
          <p>Retrieve your registered booking with the email used at the time of reservation.</p>
        </section>
      </SwarmCursor>

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
              <span>{String(bookings.length).padStart(2, '0')} CONFIRMED RESERVATIONS</span>
              <span>OFFICIAL DIGITAL BOARDING PASS</span>
            </div>
            {bookings.map((booking) => (
              <article className="heritage-pass" key={booking.BookingID}>
                <div className="heritage-pass-main">
                  <div className="pass-brand">
                    <span className="pass-brand-mark">H</span>
                    <div>
                      <span>HERITAGETRAILS</span>
                      <small>OFFICIAL WALKING PASS</small>
                    </div>
                  </div>
                  <span className={`pass-status ${String(booking.PaymentStatus).toLowerCase()}`}>
                    {String(booking.PaymentStatus).toUpperCase()}
                  </span>
                  <p className="pass-eyebrow">CIRCUIT CODE &nbsp; HT-{String(booking.BookingID).padStart(4, '0')}</p>
                  <h2>{booking.ItineraryTitle}</h2>
                  <div className="pass-details">
                    <div>
                      <small>GUEST</small>
                      <strong>{email.split('@')[0]}</strong>
                    </div>
                    <div>
                      <small>TRAVEL DATE</small>
                      <strong>{formatTravelDate(booking.TravelDate)}</strong>
                    </div>
                    <div>
                      <small>PARTY</small>
                      <strong>{booking.GroupSize} {booking.GroupSize === 1 ? 'guest' : 'guests'}</strong>
                    </div>
                    <div>
                      <small>ASSEMBLY POINT</small>
                      <strong>{booking.TourMode} · Main entrance</strong>
                    </div>
                  </div>
                </div>
                <aside className="heritage-pass-side">
                  <p className="pass-side-title">BOARDING TICKET</p>
                  <div className="pass-qr" aria-label="Decorative pass QR code">
                    {Array.from({ length: 64 }, (_, index) => (
                      <span
                        key={index}
                        className={((booking.BookingID + index * 3) % 5 < 2 || index % 11 === 0) ? 'filled' : ''}
                      />
                    ))}
                  </div>
                  <strong className="pass-code">{makePassCode(booking)}</strong>
                  <small>Scan at scheduled assembly</small>
                  <strong className="pass-price">₹{Number(booking.FinalPrice).toFixed(2)}</strong>
                  <button
                    className="pass-pay-button"
                    type="button"
                    disabled={String(booking.PaymentStatus).toLowerCase() === 'paid'}
                    onClick={() => {
                      setSelectedPayment(booking);
                      setPaymentMessage('');
                    }}
                  >
                    {String(booking.PaymentStatus).toLowerCase() === 'paid' ? 'Payment complete' : 'Pay now'}
                  </button>
                  <button
                    className="pass-print-button"
                    type="button"
                    onClick={() => window.print()}
                  >
                    Download / print pass
                  </button>
                </aside>
              </article>
            ))}
          </div>
        )}

        {paymentMessage && <p className="notice notice-success" role="status">{paymentMessage}</p>}
      </section>

      {selectedPayment && (
        <div className="payment-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedPayment(null);
        }}>
          <form className="payment-modal" onSubmit={confirmPayment}>
            <div className="payment-modal-heading">
              <div>
                <p className="eyebrow">SECURE PAYMENT</p>
                <h2>Complete your reservation</h2>
              </div>
              <button type="button" className="payment-close" aria-label="Close payment" onClick={() => setSelectedPayment(null)}>×</button>
            </div>
            <div className="payment-summary">
              <span>{selectedPayment.ItineraryTitle}</span>
              <strong>₹{Number(selectedPayment.FinalPrice).toFixed(2)}</strong>
            </div>
            <fieldset className="payment-methods">
              <legend>Payment method</legend>
              {['UPI', 'Credit card', 'Net banking'].map((method) => (
                <label key={method}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </fieldset>
            <button className="submit-button payment-confirm" type="submit" disabled={paying}>
              {paying ? 'Processing…' : `Pay ₹${Number(selectedPayment.FinalPrice).toFixed(2)}`}
            </button>
            <p className="payment-disclaimer">This is a demo payment. No real charges or financial information are collected.</p>
          </form>
        </div>
      )}
    </main>
  );
}
