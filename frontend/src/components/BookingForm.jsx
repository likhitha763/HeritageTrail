import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createBooking } from '../api.js';

function getToday() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default function BookingForm({ itinerary }) {
  const [selectedModeId, setSelectedModeId] = useState(itinerary.Modes[0]?.TourModeID || '');
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    travelDate: '',
    groupSize: '1',
    vehicleCount: itinerary.Modes[0]?.CapacityUnit === 'VEHICLES' ? '1' : '0',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const selectedMode = itinerary.Modes.find(
    (mode) => String(mode.TourModeID) === String(selectedModeId),
  ) || itinerary.Modes[0];

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function selectMode(event) {
    const nextMode = itinerary.Modes.find(
      (mode) => String(mode.TourModeID) === event.target.value,
    );
    setSelectedModeId(event.target.value);
    setForm((current) => ({
      ...current,
      vehicleCount: nextMode?.CapacityUnit === 'VEHICLES' ? '1' : '0',
    }));
  }

  async function submitBooking(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const booking = await createBooking({
        ...form,
        itineraryId: itinerary.ItineraryID,
        tourModeId: Number(selectedModeId),
        groupSize: Number(form.groupSize),
        vehicleCount: Number(form.vehicleCount),
      });
      setMessage(
        `Booking #${booking.bookingId} created for ${booking.groupSize} ${booking.groupSize === 1 ? 'person' : 'people'} via ${booking.tourMode}${booking.vehicleCount ? ` (${booking.vehicleCount} ${booking.vehicleCount === 1 ? 'car' : 'cars'})` : ''}. Total: ₹${Number(booking.finalPrice).toFixed(2)}. Payment is pending.`,
      );
      setForm({
        customerName: '',
        customerEmail: '',
        travelDate: '',
        groupSize: '1',
        vehicleCount: selectedMode?.CapacityUnit === 'VEHICLES' ? '1' : '0',
      });
      setBookingEmail(form.customerEmail.trim());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel booking-panel">
      <p className="eyebrow">DIRECT CIRCUIT BOOKING</p>
      <h2>Reserve Your Circuit Slot</h2>
      <p className="booking-intro">
        From ₹{Number(itinerary.BasePrice).toFixed(2)} per person, plus any landmark entry fees.
      </p>
      <p className="booking-estimate" aria-live="polite">
        Base for {Number(form.groupSize) || 0} {Number(form.groupSize) === 1 ? 'person' : 'people'}: ₹
        {(Number(itinerary.BasePrice) * (Number(form.groupSize) || 0)).toFixed(2)}
        <span> · Entry fees are added to the final total</span>
      </p>

      <form className="booking-form" onSubmit={submitBooking}>
        <label>
          How would you like to travel?
          <select
            name="tourModeId"
            value={selectedModeId}
            onChange={selectMode}
            required
          >
            {itinerary.Modes.map((mode) => (
              <option key={mode.TourModeID} value={mode.TourModeID}>
                {mode.ModeName} · capacity {mode.CapacityLimit} {mode.CapacityUnit === 'VEHICLES' ? 'cars' : 'people/seats'}
              </option>
            ))}
          </select>
        </label>
        <label>
          Your name
          <input
            name="customerName"
            autoComplete="name"
            value={form.customerName}
            onChange={updateField}
            maxLength="160"
            required
          />
        </label>
        <label>
          Email address
          <input
            name="customerEmail"
            type="email"
            autoComplete="email"
            value={form.customerEmail}
            onChange={updateField}
            maxLength="254"
            required
          />
        </label>
        <label>
          Number of people
          <input
            name="groupSize"
            type="number"
            min="1"
            max={selectedMode?.CapacityUnit === 'PEOPLE' ? selectedMode.CapacityLimit : undefined}
            step="1"
            value={form.groupSize}
            onChange={updateField}
            required
          />
        </label>
        {selectedMode?.CapacityUnit === 'VEHICLES' && (
          <label>
            Number of cars
            <input
              name="vehicleCount"
              type="number"
              min="1"
              max={Number(form.groupSize) || undefined}
              step="1"
              value={form.vehicleCount}
              onChange={updateField}
              required
            />
          </label>
        )}
        <label>
          Travel date
          <input
            name="travelDate"
            type="date"
            min={getToday()}
            value={form.travelDate}
            onChange={updateField}
            required
          />
        </label>
        <button className="submit-button" type="submit" disabled={submitting}>
          {submitting ? 'Reserving…' : 'Reserve your place'} <span aria-hidden="true">→</span>
        </button>
      </form>

      {error && <p className="form-feedback form-error" role="alert">{error}</p>}
      {message && <p className="form-feedback form-success" role="status">{message}</p>}
      {message && bookingEmail && (
        <Link className="booking-result-link" to={`/bookings?email=${encodeURIComponent(bookingEmail)}`}>
          View your bookings <span aria-hidden="true">→</span>
        </Link>
      )}
      <p className="payment-note">
        Capacity is counted in {selectedMode?.CapacityUnit === 'VEHICLES' ? 'vehicle slots' : 'people/seats'}.
        For self-drive, visitors arrange their own cars; the bus option tracks seats but does not book an operator.
        Transport hire and fuel costs are not included. Payment starts as pending, and your tour price is locked at booking.
      </p>
    </section>
  );
}
