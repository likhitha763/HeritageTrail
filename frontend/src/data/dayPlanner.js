export const paceOptions = {
  relaxed: { label: 'Unhurried', visitMinutes: 50 },
  balanced: { label: 'Balanced', visitMinutes: 35 },
  brisk: { label: 'Brisk', visitMinutes: 25 },
};

const transferMinutes = {
  walking: 15,
  driving: 20,
};
const mealBreakMinutes = 45;

export const interests = [
  {
    id: 'architecture',
    label: 'Architecture & monuments',
    pattern: /\b(architect\w*|palace|fort|mahal|haveli|monument|gateway|tomb|mosque|church|cathedral|basilica|observatory|stupa|stepwell|temple)\b/i,
  },
  {
    id: 'spirituality',
    label: 'Faith & living traditions',
    pattern: /\b(temple|mosque|church|sacred|shrine|pilgrim\w*|worship|ghat|dargah|gurdwara|monastery|cathedral|basilica)\b/i,
  },
  {
    id: 'history',
    label: 'History & empires',
    pattern: /\b(history|historic|historical|dynasty|empire|king|queen|royal|archaeolog\w*|ancient|fort|tomb|memorial|heritage|colonial)\b/i,
  },
  {
    id: 'culture',
    label: 'Art, crafts & markets',
    pattern: /\b(art|culture|craft|market|bazaar|textile|painting|museum|music|dance|workshop|observatory)\b/i,
  },
  {
    id: 'nature',
    label: 'Nature & waterfront',
    pattern: /\b(garden|lake|river|sea|coast|beach|hill|park|waterfront|island|forest|falls|waterfall|viewpoint)\b/i,
  },
];

function getStopInterests(stop) {
  const searchText = `${stop.LandmarkName || ''} ${stop.LandmarkDescription || ''}`;
  return interests
    .filter((interest) => interest.pattern.test(searchText))
    .map((interest) => interest.id);
}

function matchesSelectedInterests(stop, selectedInterests) {
  return selectedInterests.length === 0
    || getStopInterests(stop).some((interest) => selectedInterests.includes(interest));
}

function uniquePlaces(places, excludedPlaces = []) {
  const seenIds = new Set();
  const seenNames = new Set();
  const unique = [];

  for (const place of excludedPlaces) {
    if (place.LandmarkID !== undefined && place.LandmarkID !== null) {
      seenIds.add(String(place.LandmarkID));
    }
    const name = String(place.LandmarkName || '').trim().toLocaleLowerCase();
    if (name) seenNames.add(name);
  }

  for (const place of places) {
    const id = place.LandmarkID === undefined || place.LandmarkID === null
      ? ''
      : String(place.LandmarkID);
    const name = String(place.LandmarkName || '').trim().toLocaleLowerCase();
    if ((id && seenIds.has(id)) || (name && seenNames.has(name))) continue;
    if (id) seenIds.add(id);
    if (name) seenNames.add(name);
    unique.push(place);
  }

  return unique;
}

export function getEstimatedMinutes(stopCount, pace, travelMode, includeMealBreak) {
  if (stopCount < 1) return 0;
  const visitTime = paceOptions[pace].visitMinutes * stopCount;
  const transferTime = transferMinutes[travelMode] * Math.max(0, stopCount - 1);
  const mealTime = includeMealBreak && stopCount >= 3 ? mealBreakMinutes : 0;
  return visitTime + transferTime + mealTime;
}

export function buildPlan(
  tour,
  selectedInterests,
  availableMinutes,
  pace,
  travelMode,
  includeMealBreak,
  cityLandmarks = [],
  customPlaces = [],
  planningMode = 'curated',
) {
  if (!Number.isFinite(availableMinutes) || availableMinutes <= 0) return null;

  const itinerary = tour.itinerary || tour;
  const orderedStops = [...(tour.stops || [])]
    .sort((first, second) => Number(first.StopOrder) - Number(second.StopOrder));
  const matchingRouteStops = planningMode === 'independent'
    ? []
    : orderedStops.filter((stop) => matchesSelectedInterests(stop, selectedInterests));
  const additionalPlaces = uniquePlaces(
    [...customPlaces, ...cityLandmarks],
    planningMode === 'independent' ? [] : orderedStops,
  ).filter((place) => matchesSelectedInterests(place, selectedInterests));

  const stops = [];
  for (const stop of matchingRouteStops) {
    if (getEstimatedMinutes(stops.length + 1, pace, travelMode, includeMealBreak) > availableMinutes) break;
    stops.push({ ...stop, isIndependent: false });
  }

  const curatedStopCount = stops.length;
  const mayAddIndependentPlaces = planningMode === 'independent'
    || (curatedStopCount > 0 && curatedStopCount === matchingRouteStops.length);

  if (mayAddIndependentPlaces) {
    for (const place of additionalPlaces) {
      if (getEstimatedMinutes(stops.length + 1, pace, travelMode, includeMealBreak) > availableMinutes) break;
      stops.push({ ...place, isIndependent: true });
    }
  }

  if (stops.length === 0) return null;

  const matchedInterests = new Set(stops.flatMap(getStopInterests));
  const independentMode = planningMode === 'independent';
  const totalMinutes = getEstimatedMinutes(stops.length, pace, travelMode, includeMealBreak);

  return {
    ...itinerary,
    ItineraryID: independentMode ? null : itinerary.ItineraryID,
    Title: independentMode ? `Self-guided exploration in ${itinerary.CityName}` : itinerary.Title,
    stops,
    planningMode,
    curatedStopCount: independentMode ? 0 : curatedStopCount,
    independentStopCount: stops.length - curatedStopCount,
    totalMinutes,
    remainingMinutes: availableMinutes - totalMinutes,
    matchedInterests: selectedInterests.filter((interest) => matchedInterests.has(interest)),
  };
}
