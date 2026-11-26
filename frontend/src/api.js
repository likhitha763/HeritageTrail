const getRetryDelays = [500, 1000, 2000, 4000];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function request(path, options) {
  const method = (options?.method || 'GET').toUpperCase();
  const retryDelays = method === 'GET' ? getRetryDelays : [];

  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      response = await fetch(path, {
        ...options,
        headers: {
          ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
          ...options?.headers,
        },
      });
    } catch (requestError) {
      if (attempt < retryDelays.length) {
        await delay(retryDelays[attempt]);
        continue;
      }
      throw new Error(
        `Cannot reach the HeritageTrails API. Start the API and website with "npm run dev" from the project folder. (${requestError.message})`,
      );
    }

    const body = await response.text();
    let payload = null;
    try {
      payload = body ? JSON.parse(body) : null;
    } catch {
      payload = null;
    }

    const proxyUnavailable = /ECONNREFUSED|socket hang up/i.test(body);
    const temporaryFailure = [502, 503, 504].includes(response.status) || proxyUnavailable;
    if (!response.ok && temporaryFailure && attempt < retryDelays.length) {
      await delay(retryDelays[attempt]);
      continue;
    }
    if (!response.ok) {
      if (proxyUnavailable) {
        throw new Error(
          'The API is not running. Start the API and website with "npm run dev" from the project folder.',
        );
      }
      throw new Error(payload?.error || `The API request failed (HTTP ${response.status}).`);
    }
    if (payload === null) {
      throw new Error('The API returned an invalid response. Check that the backend is running.');
    }

    return payload;
  }
}

export function getItineraries() {
  return request('/api/itineraries');
}

export function getItineraryDetails(itineraryId) {
  return request(`/api/itineraries/${encodeURIComponent(itineraryId)}`);
}

export function getCityLandmarks(cityName) {
  return request(`/api/cities/${encodeURIComponent(cityName)}/landmarks`);
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
