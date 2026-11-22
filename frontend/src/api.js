async function request(path, options) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'The request could not be completed.');
  }

  return payload;
}

export function getItineraries() {
  return request('/api/itineraries');
}

export function getItineraryDetails(itineraryId) {
  return request(`/api/itineraries/${encodeURIComponent(itineraryId)}`);
}

export function createBooking(booking) {
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  });
}

export function getBookings(email) {
  return request(`/api/bookings?email=${encodeURIComponent(email)}`);
}

export function payBooking(bookingId, email, paymentMethod) {
  return request(`/api/bookings/${encodeURIComponent(bookingId)}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ email, paymentMethod }),
  });
}
