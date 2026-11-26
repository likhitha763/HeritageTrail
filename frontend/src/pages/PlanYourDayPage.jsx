import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCityLandmarks, getItineraryDetails } from '../api.js';
import { buildPlan, interests, paceOptions } from '../data/dayPlanner.js';
import { createMapsDirectionsUrl, createMapsSearchUrl } from '../data/mapLinks.js';

const TRANSFER_MINUTES = {
  walking: 15,
  driving: 20,
};
const MEAL_BREAK_MINUTES = 45;

function formatTime(totalMinutes) {
  const dayOffset = Math.floor(totalMinutes / (24 * 60));
  const minutesOfDay = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = String(Math.floor(minutesOfDay / 60)).padStart(2, '0');
  const minutes = String(minutesOfDay % 60).padStart(2, '0');
  return `${hours}:${minutes}${dayOffset > 0 ? ` (+${dayOffset} day)` : ''}`;
}

function buildSchedule(plan, startTime, pace, travelMode, includeMealBreak) {
  const [hours, minutes] = startTime.split(':').map(Number);
  let cursor = hours * 60 + minutes;
  const schedule = [];
  const visitMinutes = paceOptions[pace].visitMinutes;
  const transferMinutes = TRANSFER_MINUTES[travelMode];
  const mealAtIndex = includeMealBreak && plan.stops.length >= 3
    ? Math.ceil(plan.stops.length / 2)
    : -1;

  plan.stops.forEach((stop, index) => {
    if (index > 0) {
      schedule.push({
        type: 'transfer',
        start: cursor,
        end: cursor + transferMinutes,
        label: `Estimated ${travelMode === 'walking' ? 'walk' : 'road'} transfer`,
        detail: `${transferMinutes}-minute planning buffer; actual travel time varies`,
      });
      cursor += transferMinutes;
    }

    if (index === mealAtIndex) {
      schedule.push({
        type: 'meal',
        start: cursor,
        end: cursor + MEAL_BREAK_MINUTES,
        label: 'Meal break',
        detail: '45 minutes · Find nearby restaurants on Maps',
        mapUrl: createMapsSearchUrl(`restaurants near ${stop.LandmarkName}, ${stop.CityName}, India`),
      });
      cursor += MEAL_BREAK_MINUTES;
    }

    schedule.push({
      type: 'stop',
      start: cursor,
      end: cursor + visitMinutes,
      stop,
      sequence: index + 1,
      label: stop.LandmarkName,
      detail: stop.isIndependent
        ? `${visitMinutes}-minute ${paceOptions[pace].label.toLowerCase()} self-guided visit · not part of a bookable tour`
        : `${visitMinutes}-minute ${paceOptions[pace].label.toLowerCase()} visit estimate`,
      mapUrl: createMapsSearchUrl(`${stop.LandmarkName}, ${stop.CityName}, ${stop.State || ''}, India`),
    });
    cursor += visitMinutes;
  });

  return schedule;
}

export default function PlanYourDayPage({ itineraries, loading: itinerariesLoading, error: itinerariesError }) {
  const cities = useMemo(
    () => [...new Set(itineraries.map((itinerary) => itinerary.CityName).filter(Boolean))].sort(),
    [itineraries],
  );
  const [city, setCity] = useState('');
  const [hoursAvailable, setHoursAvailable] = useState('4');
  const [startTime, setStartTime] = useState('09:00');
  const [pace, setPace] = useState('balanced');
  const [travelMode, setTravelMode] = useState('walking');
  const [planningMode, setPlanningMode] = useState('curated');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [includeMealBreak, setIncludeMealBreak] = useState(true);
  const [tourData, setTourData] = useState({ city: '', tours: [], loading: false, error: '' });
  const [cityLandmarkData, setCityLandmarkData] = useState({
    city: '',
    landmarks: [],
    loading: false,
    error: '',
  });
  const [hasPlanned, setHasPlanned] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState('');
  const [customPlaceName, setCustomPlaceName] = useState('');
  const [customPlaces, setCustomPlaces] = useState([]);
  const [customPlaceError, setCustomPlaceError] = useState('');
  const nextCustomPlaceId = useRef(0);

  useEffect(() => {
    if (!city && cities.length > 0) setCity(cities[0]);
  }, [cities, city]);

  const cityItineraries = useMemo(
    () => itineraries.filter((itinerary) => itinerary.CityName === city),
    [city, itineraries],
  );

  useEffect(() => {
    if (!city || cityItineraries.length === 0) {
      setTourData({ city, tours: [], loading: false, error: '' });
      return undefined;
    }

    let cancelled = false;
    setTourData({ city, tours: [], loading: true, error: '' });

    Promise.all(cityItineraries.map(async (itinerary) => ({
      itinerary,
      stops: await getItineraryDetails(itinerary.ItineraryID),
    })))
      .then((tours) => {
        if (!cancelled) setTourData({ city, tours, loading: false, error: '' });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setTourData({ city, tours: [], loading: false, error: requestError.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [city, cityItineraries]);

  useEffect(() => {
    if (!city) {
      setCityLandmarkData({ city, landmarks: [], loading: false, error: '' });
      return undefined;
    }

    let cancelled = false;
    setCityLandmarkData({ city, landmarks: [], loading: true, error: '' });
    getCityLandmarks(city)
      .then((landmarks) => {
        if (!cancelled) setCityLandmarkData({ city, landmarks, loading: false, error: '' });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setCityLandmarkData({
            city,
            landmarks: [],
            loading: false,
            error: requestError.message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    setHasPlanned(false);
    setSelectedTourId('');
    setCustomPlaceName('');
    setCustomPlaces([]);
    setCustomPlaceError('');
  }, [city]);

  const availableMinutes = Number(hoursAvailable) * 60;
  const plans = useMemo(() => {
    if (!Number.isFinite(availableMinutes) || availableMinutes <= 0) return [];
    const candidateTours = planningMode === 'independent'
      ? [{
        itinerary: {
          CityName: city,
          State: cityItineraries[0]?.State || '',
        },
        stops: [],
      }]
      : tourData.tours;

    return candidateTours
      .map((tour) => buildPlan(
        tour,
        selectedInterests,
        availableMinutes,
        pace,
        travelMode,
        includeMealBreak,
        cityLandmarkData.city === city ? cityLandmarkData.landmarks : [],
        customPlaces,
        planningMode,
      ))
      .filter(Boolean)
      .sort((first, second) => (
        second.stops.length - first.stops.length
        || second.matchedInterests.length - first.matchedInterests.length
        || first.remainingMinutes - second.remainingMinutes
        || Number(second.DurationHours) - Number(first.DurationHours)
      ));
  }, [
    availableMinutes,
    city,
    cityItineraries,
    cityLandmarkData,
    customPlaces,
    includeMealBreak,
    pace,
    planningMode,
    selectedInterests,
    tourData.tours,
    travelMode,
  ]);

  const selectedPlan = plans.find((plan) => (
    String(plan.ItineraryID || 'independent') === String(selectedTourId)
  ))
    || plans[0]
    || null;
  const schedule = selectedPlan
    ? buildSchedule(selectedPlan, startTime, pace, travelMode, includeMealBreak)
    : [];
  const routeUrl = selectedPlan
    ? createMapsDirectionsUrl(selectedPlan.stops, selectedPlan.State, travelMode)
    : '';
  const loadingStops = tourData.city !== city
    || tourData.loading
    || cityLandmarkData.city !== city
    || cityLandmarkData.loading;
  const loadError = itinerariesError || (tourData.city === city ? tourData.error : '');

  function toggleInterest(interestId) {
    setSelectedInterests((current) => (
      current.includes(interestId)
        ? current.filter((value) => value !== interestId)
        : [...current, interestId]
    ));
  }

  function addCustomPlace() {
    const name = customPlaceName.trim();
    if (!name) {
      setCustomPlaceError('Enter a place name to add it to your self-guided plan.');
      return;
    }
    const normalizedName = name.toLocaleLowerCase();
    const alreadyAdded = customPlaces.some(
      (place) => place.LandmarkName.toLocaleLowerCase() === normalizedName,
    );
    const alreadyInCity = cityLandmarkData.landmarks.some(
      (place) => place.LandmarkName.trim().toLocaleLowerCase() === normalizedName,
    );
    if (alreadyAdded || alreadyInCity) {
      setCustomPlaceError('That place is already in your list of city landmarks or self-guided stops.');
      return;
    }

    nextCustomPlaceId.current += 1;
    setCustomPlaces((current) => [
      ...current,
      {
        LandmarkID: `custom-${nextCustomPlaceId.current}`,
        LandmarkName: name,
        LandmarkDescription: '',
        CityName: city,
        State: cityItineraries[0]?.State || '',
        isIndependent: true,
        isCustom: true,
      },
    ]);
    setCustomPlaceName('');
    setCustomPlaceError('');
  }

  function removeCustomPlace(placeId) {
    setCustomPlaces((current) => current.filter((place) => place.LandmarkID !== placeId));
    setCustomPlaceError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    setHasPlanned(true);
    setSelectedTourId(plans[0] ? String(plans[0].ItineraryID || 'independent') : '');
  }

  return (
    <main className="page-content planner-page">
      <section className="page-intro planner-intro">
        <p className="eyebrow"><span className="eyebrow-dot" /> A DAY BUILT AROUND YOU · HERITAGETRAILS</p>
        <h1>Make room for<br />the stories you love.</h1>
        <p>Choose a curated route or plan independently. Extra time can fit more city landmarks or places you add yourself.</p>
      </section>

      <section className="personal-planner" aria-labelledby="personal-planner-title">
        <div className="personal-planner-heading">
          <p className="eyebrow">PERSONAL HERITAGE DAY</p>
          <h2 id="personal-planner-title">What would you like your day to feel like?</h2>
          <p>Choose no interests to include every type of highlight. Changing available hours recalculates how many places fit; changing the start time shifts the schedule clock.</p>
        </div>

        <form className="personal-planner-form" onSubmit={handleSubmit}>
          <label className="planner-field">
            <span>Destination</span>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              disabled={itinerariesLoading || cities.length === 0}
              required
            >
              {cities.map((cityName) => <option value={cityName} key={cityName}>{cityName}</option>)}
            </select>
          </label>

          <label className="planner-field">
            <span>Time available</span>
            <select value={hoursAvailable} onChange={(event) => setHoursAvailable(event.target.value)}>
              {[2, 3, 4, 5, 6, 8, 10, 12].map((hours) => (
                <option value={hours} key={hours}>{hours} hours</option>
              ))}
            </select>
          </label>

          <label className="planner-field">
            <span>Planning style</span>
            <select value={planningMode} onChange={(event) => setPlanningMode(event.target.value)}>
              <option value="curated">Curated route + extra places</option>
              <option value="independent">Explore independently</option>
            </select>
          </label>

          <label className="planner-field">
            <span>Start time</span>
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
          </label>

          <label className="planner-field">
            <span>Your pace</span>
            <select value={pace} onChange={(event) => setPace(event.target.value)}>
              {Object.entries(paceOptions).map(([value, option]) => (
                <option value={value} key={value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="planner-field">
            <span>Getting around</span>
            <select value={travelMode} onChange={(event) => setTravelMode(event.target.value)}>
              <option value="walking">Walking</option>
              <option value="driving">Road route (car / bus)</option>
            </select>
          </label>

          <fieldset className="planner-interest-field">
            <legend>Choose the stories you’re interested in <span>(match any selected)</span></legend>
            <div className="planner-interest-options">
              {interests.map((interest) => (
                <button
                  className={`planner-interest-chip${selectedInterests.includes(interest.id) ? ' is-selected' : ''}`}
                  type="button"
                  aria-pressed={selectedInterests.includes(interest.id)}
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                >
                  {interest.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="planner-meal-toggle">
            <input
              type="checkbox"
              checked={includeMealBreak}
              onChange={(event) => setIncludeMealBreak(event.target.checked)}
            />
            <span>Include a 45-minute meal break when the plan has 3 or more stops</span>
          </label>

          <div className="planner-custom-place">
            <label className="planner-field" htmlFor="planner-custom-place-input">
              <span>Add your own place for self-guided exploration</span>
              <input
                id="planner-custom-place-input"
                type="text"
                value={customPlaceName}
                onChange={(event) => {
                  setCustomPlaceName(event.target.value);
                  setCustomPlaceError('');
                }}
                placeholder="For example, a market, museum, or garden"
                maxLength={150}
              />
              <span className="planner-custom-place-hint">
                Custom places are added after a full curated route or included in independent mode.
              </span>
            </label>
            <button className="planner-add-place" type="button" onClick={addCustomPlace}>
              Add place
            </button>
          </div>

          {customPlaceError && <p className="planner-custom-place-error" role="alert">{customPlaceError}</p>}
          {customPlaces.length > 0 && (
            <ul className="planner-custom-place-list" aria-label="Places you added">
              {customPlaces.map((place) => (
                <li key={place.LandmarkID}>
                  <span>{place.LandmarkName}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${place.LandmarkName}`}
                    onClick={() => removeCustomPlace(place.LandmarkID)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            className="button button-dark planner-submit"
            type="submit"
            disabled={itinerariesLoading || loadingStops || Boolean(loadError) || !city}
          >
            Build my day <span aria-hidden="true">↗</span>
          </button>
        </form>

        {itinerariesLoading && <p className="notice" role="status">Loading destinations…</p>}
        {loadingStops && !itinerariesLoading && <p className="notice" role="status">Preparing this city’s heritage stops…</p>}
        {loadError && <p className="notice notice-error" role="alert">{loadError}</p>}
        {cityLandmarkData.city === city && cityLandmarkData.error && (
          <p className="notice notice-error" role="alert">
            Additional city landmarks could not be loaded: {cityLandmarkData.error}
            {' '}You can still add your own places above.
          </p>
        )}

        {hasPlanned && !loadingStops && !loadError && plans.length === 0 && (
          <p className="notice">
            No places fit this time and interest combination. Try a longer day, a quicker pace, clear your interests, or choose Explore independently.
          </p>
        )}

        {hasPlanned && selectedPlan && (
          <section className="personal-plan-results" aria-live="polite">
            <div className="personal-plan-title">
              <div>
                <p className="eyebrow">YOUR SUGGESTED DAY · {city.toUpperCase()}</p>
                <h2>{selectedPlan.Title}</h2>
                <p>
                  {selectedPlan.planningMode === 'independent'
                    ? `${selectedPlan.stops.length} self-guided stops`
                    : `${selectedPlan.curatedStopCount} curated stops${selectedPlan.independentStopCount
                      ? ` + ${selectedPlan.independentStopCount} self-guided places`
                      : ''}`}
                  {' '}· about {Math.floor(selectedPlan.totalMinutes / 60)}h
                  {selectedPlan.totalMinutes % 60 ? ` ${selectedPlan.totalMinutes % 60}m` : ''}
                  {' '}· {paceOptions[pace].label.toLowerCase()} pace
                </p>
              </div>
              <a className="route-day-directions" href={routeUrl} target="_blank" rel="noopener noreferrer">
                {selectedPlan.planningMode === 'independent' ? 'Open self-guided route in Maps' : 'Open route in Maps'}
                {' '}<span aria-hidden="true">↗</span>
              </a>
            </div>

            {planningMode === 'curated' && plans.length > 1 && (
              <div className="personal-plan-alternatives" aria-label="Alternative suggested routes">
                {plans.slice(0, 3).map((plan) => (
                  <button
                    className={String(plan.ItineraryID) === String(selectedPlan.ItineraryID) ? 'is-selected' : ''}
                    type="button"
                    key={plan.ItineraryID}
                    aria-pressed={String(plan.ItineraryID) === String(selectedPlan.ItineraryID)}
                    onClick={() => setSelectedTourId(String(plan.ItineraryID))}
                  >
                    {plan.Title}
                    <span>{plan.stops.length} stops{plan.independentStopCount ? ` · ${plan.independentStopCount} self-guided` : ''}</span>
                  </button>
                ))}
              </div>
            )}

            <p className="personal-plan-disclaimer">
              Planning estimate only: visits use {paceOptions[pace].visitMinutes} minutes per stop and transfers use
              {' '}{TRANSFER_MINUTES[travelMode]}-minute buffers. Opening hours and actual travel times are not live-checked.
              {selectedPlan.independentStopCount > 0 || selectedPlan.planningMode === 'independent'
                ? ' Self-guided places are not part of a bookable tour.'
                : ''}
              {' '}Check each place and route in Maps before you go.
            </p>

            <ol className="personal-plan-schedule" aria-label="Suggested day schedule">
              {schedule.map((item, index) => (
                <li
                  className={`personal-plan-event personal-plan-event-${item.type}${item.type === 'stop' && item.stop.isIndependent ? ' personal-plan-event-independent' : ''}`}
                  key={`${item.type}-${item.start}-${index}`}
                >
                  <span className="personal-plan-time">{formatTime(item.start)} – {formatTime(item.end)}</span>
                  <span className="personal-plan-marker" aria-hidden="true">
                    {item.type === 'stop'
                      ? item.stop.isIndependent ? 'S' : String(item.sequence).padStart(2, '0')
                      : item.type === 'meal' ? 'M' : '·'}
                  </span>
                  <div>
                    <h3>{item.label}</h3>
                    <p>{item.detail}</p>
                    {item.type === 'stop' && item.mapUrl && (
                      <a href={item.mapUrl} target="_blank" rel="noopener noreferrer">
                        Check place details &amp; opening hours <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {item.type === 'meal' && item.mapUrl && (
                      <a href={item.mapUrl} target="_blank" rel="noopener noreferrer">
                        Find restaurants nearby <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="personal-plan-tour-link">
              {selectedPlan.ItineraryID ? (
                <>
                  <p>
                    Booking covers the full curated tour only. Self-guided places are optional recommendations and are not included.
                    {selectedPlan.remainingMinutes >= 60
                      ? ` About ${Math.floor(selectedPlan.remainingMinutes / 60)}h ${selectedPlan.remainingMinutes % 60}m remains for your own plans.`
                      : ''}
                  </p>
                  <Link to={`/tours/${selectedPlan.ItineraryID}`}>
                    View tour details &amp; booking <span aria-hidden="true">↗</span>
                  </Link>
                </>
              ) : (
                <p>
                  This is an independent, self-guided plan and cannot be booked through HeritageTrails.
                  {selectedPlan.remainingMinutes >= 60
                    ? ` About ${Math.floor(selectedPlan.remainingMinutes / 60)}h ${selectedPlan.remainingMinutes % 60}m remains for your own plans.`
                    : ''}
                </p>
              )}
              {selectedPlan.remainingMinutes >= 60 && (
                <a
                  href={createMapsSearchUrl(`things to do in ${city} museums markets gardens`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Find more places to explore in Maps <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
