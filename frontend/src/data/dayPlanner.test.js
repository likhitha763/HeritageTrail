import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPlan } from './dayPlanner.js';

function makePlace(id, name, description = 'A historic place.') {
  return {
    LandmarkID: id,
    LandmarkName: name,
    LandmarkDescription: description,
    CityName: 'Delhi',
    State: 'Delhi',
  };
}

const tour = {
  itinerary: {
    ItineraryID: 5,
    Title: 'Delhi Heritage Route',
    CityName: 'Delhi',
    State: 'Delhi',
  },
  stops: [
    { ...makePlace(1, 'Red Fort'), StopOrder: 1 },
    { ...makePlace(2, 'Jama Masjid'), StopOrder: 2 },
  ],
};

test('more available time adds independent city landmarks after the curated route', () => {
  const places = [
    makePlace(3, 'Humayun Tomb'),
    makePlace(4, 'Qutub Minar'),
  ];
  const shortPlan = buildPlan(tour, [], 120, 'balanced', 'walking', false, places);
  const longerPlan = buildPlan(tour, [], 240, 'balanced', 'walking', false, places);

  assert.equal(shortPlan.stops.length, 2);
  assert.equal(longerPlan.stops.length, 4);
  assert.equal(longerPlan.curatedStopCount, 2);
  assert.equal(longerPlan.independentStopCount, 2);
  assert.deepEqual(longerPlan.stops.slice(2).map((stop) => stop.isIndependent), [true, true]);
});

test('independent planning schedules city and user-added places without a bookable tour', () => {
  const plan = buildPlan(
    { itinerary: { CityName: 'Delhi', State: 'Delhi' }, stops: [] },
    [],
    240,
    'balanced',
    'walking',
    false,
    [makePlace(3, 'Humayun Tomb')],
    [makePlace('custom-1', 'A local craft market')],
    'independent',
  );

  assert.equal(plan.ItineraryID, null);
  assert.equal(plan.planningMode, 'independent');
  assert.equal(plan.curatedStopCount, 0);
  assert.equal(plan.independentStopCount, 2);
  assert.deepEqual(plan.stops.map((stop) => stop.LandmarkName), [
    'A local craft market',
    'Humayun Tomb',
  ]);
});

test('additional places respect selected interests and do not duplicate route stops', () => {
  const routeWithGarden = {
    itinerary: tour.itinerary,
    stops: [{ ...makePlace(5, 'Historic garden'), StopOrder: 1 }],
  };
  const plan = buildPlan(
    routeWithGarden,
    ['nature'],
    240,
    'balanced',
    'walking',
    false,
    [
      makePlace(5, 'Historic garden'),
      makePlace(6, 'City museum', 'A collection of historical art.'),
    ],
  );

  assert.deepEqual(plan.stops.map((stop) => stop.LandmarkName), ['Historic garden']);
});
