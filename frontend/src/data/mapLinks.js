export function createMapsSearchUrl(query) {
  const params = new URLSearchParams({ api: '1', query });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function createMapsDirectionsUrl(stops, state, travelMode) {
  if (stops.length === 0) {
    throw new Error('At least one stop is required to create route directions.');
  }

  const places = stops.map((stop) => (
    [stop.LandmarkName, stop.CityName, state, 'India'].filter(Boolean).join(', ')
  ));
  const params = new URLSearchParams({
    api: '1',
    origin: places[0],
    destination: places[places.length - 1],
    travelmode: travelMode,
  });

  if (places.length > 2) {
    params.set('waypoints', places.slice(1, -1).join('|'));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
