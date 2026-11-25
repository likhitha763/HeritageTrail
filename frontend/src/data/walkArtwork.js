import { getDestinationLandmarkArtwork } from './landmarkArtwork.js';

const artworkByItinerary = {
  1: {
    src: '/images/mangaluru-city.jpg',
    alt: 'View across the rooftops and streets of Mangaluru',
  },
  2: {
    src: '/images/mangaladevi-temple.jpg',
    alt: 'The historic Mangaladevi Temple in Mangaluru',
  },
  3: {
    src: '/images/mangalore-coast.jpg',
    alt: 'The Arabian Sea off the coast of Mangaluru',
  },
  4: {
    src: '/images/st-aloysius-church.jpg',
    alt: 'The facade of St. Aloysius Church in Mangaluru',
  },
};

const artworkByDestination = {
  Agra: {
    src: '/images/agra-taj-mahal.jpg',
    alt: 'The Taj Mahal in Agra',
  },
  Delhi: {
    src: '/images/delhi-red-fort.jpg',
    alt: 'The Red Fort in Delhi',
  },
  Hampi: {
    src: '/images/hampi-virupaksha.jpg',
    alt: 'Virupaksha Temple viewed from Hemakuta Hill in Hampi',
  },
  Kochi: {
    src: '/images/kochi-fishing-nets.jpg',
    alt: 'Chinese fishing nets along the Fort Kochi waterfront',
  },
  Jaipur: {
    src: '/images/jaipur-hawa-mahal.jpg',
    alt: 'The Hawa Mahal in Jaipur',
  },
  Mangaluru: {
    src: '/images/mangaluru-city.jpg',
    alt: 'View across the rooftops and streets of Mangaluru',
  },
  Mysuru: {
    src: '/images/mysuru-palace.jpg',
    alt: 'The east side of Mysuru Palace',
  },
  Varanasi: {
    src: '/images/varanasi-ghats.jpg',
    alt: 'The ghats along the Ganges in Varanasi',
  },
};

export function getWalkArtwork(itineraryId) {
  return artworkByItinerary[Number(itineraryId)] || null;
}

export function getDestinationArtwork(cityName) {
  return artworkByDestination[cityName] || getDestinationLandmarkArtwork(cityName);
}
