import { Fragment, useState } from 'react';
import { createMapsDirectionsUrl, createMapsSearchUrl } from '../data/mapLinks.js';

const MEAL_BREAK_MINUTES = 45;

function formatTime(totalMinutes) {
  const dayOffset = Math.floor(totalMinutes / (24 * 60));
  const minutesOfDay = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = String(Math.floor(minutesOfDay / 60)).padStart(2, '0');
  const minutes = String(minutesOfDay % 60).padStart(2, '0');
  return `${hours}:${minutes}${dayOffset > 0 ? ` (+${dayOffset} day)` : ''}`;
}

export default function RouteDayPlanner({ itinerary, stops }) {
  const [startTime, setStartTime] = useState('09:00');
  const [includeMealBreak, setIncludeMealBreak] = useState(true);
  const [travelMode, setTravelMode] = useState('');
  const hasWalkingOption = itinerary.Modes.some((mode) => mode.ModeCode === 'WALK');
  const hasRoadOption = itinerary.Modes.some(
    (mode) => mode.ModeCode === 'SELF_DRIVE' || mode.ModeCode === 'TOURIST_BUS',
  );
  const travelOptions = [
    ...(hasWalkingOption ? [{ value: 'walking', label: 'Walking' }] : []),
    ...(hasRoadOption ? [{ value: 'driving', label: 'Road route (car/bus)' }] : []),
  ];
  const selectedTravelMode = travelOptions.some((option) => option.value === travelMode)
    ? travelMode
    : travelOptions[0]?.value || 'walking';
  const durationMinutes = Number(itinerary.DurationHours) * 60;
  const parsedStartTime = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(startTime);
  const startAtMinutes = parsedStartTime
    ? Number(parsedStartTime[1]) * 60 + Number(parsedStartTime[2])
    : null;
  const hasValidDuration = Number.isFinite(durationMinutes) && durationMinutes > 0;
  const mealBreakStopCount = stops.length >= 3 ? Math.ceil(stops.length / 2) : null;
  const hasMealBreak = includeMealBreak && mealBreakStopCount !== null;
  const routeUrl = createMapsDirectionsUrl(stops, itinerary.State, selectedTravelMode);

  return (
    <section className="route-day-planner" aria-labelledby="route-day-planner-title">
      <div className="route-day-planner-heading">
        <div>
          <p className="eyebrow">INTERACTIVE ROUTE · {stops.length} ORDERED STOPS</p>
          <h2 id="route-day-planner-title">Plan your day.</h2>
          <p>
            Follow the route in order, then open the live map for road distance and travel-time estimates.
          </p>
        </div>
        <label className="route-day-start">
          <span>Start time</span>
          <input
            type="time"
            required
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </label>
      </div>

      <div className="route-day-controls">
        <label className="route-day-mode">
          <span>Route mode</span>
          <select
            value={selectedTravelMode}
            onChange={(event) => setTravelMode(event.target.value)}
          >
            {travelOptions.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="route-day-break-toggle">
          <input
            type="checkbox"
            checked={includeMealBreak}
            disabled={mealBreakStopCount === null}
            onChange={(event) => setIncludeMealBreak(event.target.checked)}
          />
          <span>Add a 45-minute meal break{mealBreakStopCount === null ? ' (3+ stops)' : ''}</span>
        </label>
        <a
          className="route-day-directions"
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open full route in Google Maps <span aria-hidden="true">↗</span>
        </a>
      </div>

      <p className="route-day-estimate-note">
        Suggested times divide the tour duration evenly between stops; actual visit and travel times vary.
        Google Maps provides live distances and directions.
      </p>

      {hasValidDuration && startAtMinutes !== null ? (
        <ol className="route-day-schedule" aria-label="Suggested day schedule" aria-live="polite">
          {stops.map((stop, index) => {
            const breakIsHere = hasMealBreak && index === mealBreakStopCount;
            const breakOffset = hasMealBreak && index >= mealBreakStopCount
              ? MEAL_BREAK_MINUTES
              : 0;
            const slotStart = startAtMinutes
              + Math.round((index * durationMinutes) / stops.length)
              + breakOffset;
            const slotEnd = startAtMinutes
              + Math.round(((index + 1) * durationMinutes) / stops.length)
              + breakOffset;
            const nearby = [stop.LandmarkName, stop.CityName, itinerary.State, 'India']
              .filter(Boolean)
              .join(', ');

            return (
              <Fragment key={`${stop.StopOrder}-${stop.LandmarkID}`}>
                {breakIsHere && (
                  <li className="route-day-meal-break">
                    <span className="route-day-time">
                      {formatTime(startAtMinutes + Math.round((index * durationMinutes) / stops.length))}
                      {' – '}
                      {formatTime(startAtMinutes + Math.round((index * durationMinutes) / stops.length) + MEAL_BREAK_MINUTES)}
                    </span>
                    <span className="route-day-stop-number" aria-hidden="true">B</span>
                    <div className="route-day-stop-copy">
                      <p className="eyebrow">PAUSE &amp; REFUEL</p>
                      <h3>Meal break</h3>
                      <a
                        href={createMapsSearchUrl(`restaurants near ${nearby}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Find nearby restaurants <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </li>
                )}
                <li className="route-day-stop">
                  <span className="route-day-time">
                    {formatTime(slotStart)} – {formatTime(slotEnd)}
                  </span>
                  <span className="route-day-stop-number">{String(stop.StopOrder).padStart(2, '0')}</span>
                  <div className="route-day-stop-copy">
                    <p className="eyebrow">STOP {String(stop.StopOrder).padStart(2, '0')}</p>
                    <h3>{stop.LandmarkName}</h3>
                    <p>{stop.CityName} · Suggested visit and transfer window</p>
                    <div className="route-day-nearby-links">
                      <a
                        href={createMapsSearchUrl(`restaurants near ${nearby}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Restaurants nearby <span aria-hidden="true">↗</span>
                      </a>
                      <a
                        href={createMapsSearchUrl(`hotels near ${nearby}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Hotels nearby <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                </li>
              </Fragment>
            );
          })}
        </ol>
      ) : (
        <p className="notice notice-error" role="alert">
          {startAtMinutes === null
            ? 'Choose a start time to prepare the day schedule.'
            : 'A valid tour duration is required to prepare the day schedule.'}
        </p>
      )}
    </section>
  );
}
