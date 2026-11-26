import { getDestinationLandmarkArtwork, getLandmarkArtwork } from './landmarkArtwork.js';

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

const landmarkByItinerary = {
  5: 9,
  6: 12,
  7: 14,
  8: 16,
  9: 17,
  10: 20,
  11: 22,
  12: 23,
  13: 25,
  14: 27,
  15: 30,
  16: 32,
  17: 36,
  18: 40,
  19: 54,
  20: 58,
  21: 62,
  22: 66,
  23: 70,
  24: 74,
  25: 78,
  26: 82,
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
  Jodhpur: {
    src: '/images/jodhpur-mehrangarh-fort.jpg',
    alt: 'Interior of Mehrangarh Fort in Jodhpur',
  },
  Khajuraho: {
    src: '/images/khajuraho-vishvanath-temple.jpg',
    alt: 'Vishvanath Temple in Khajuraho',
  },
  Kochi: {
    src: '/images/kochi-fishing-nets.jpg',
    alt: 'Chinese fishing nets along the Fort Kochi waterfront',
  },
  Jaipur: {
    src: '/images/jaipur-hawa-mahal.jpg',
    alt: 'The Hawa Mahal in Jaipur',
  },
  Lucknow: {
    src: '/images/lucknow-bara-imambara.jpg',
    alt: 'Bara Imambara in Lucknow',
  },
  Madurai: {
    src: '/images/madurai-meenakshi-temple.jpg',
    alt: 'Sri Meenakshi Temple replica in Pearland, Texas, inspired by Madurai’s temple',
  },
  Mangaluru: {
    src: '/images/mangaluru-city.jpg',
    alt: 'View across the rooftops and streets of Mangaluru',
  },
  Mysuru: {
    src: '/images/mysuru-palace.jpg',
    alt: 'The east side of Mysuru Palace',
  },
  Panaji: {
    src: '/images/panaji-fontainhas.jpg',
    alt: 'A street in Panaji’s Fontainhas Latin Quarter',
  },
  Udaipur: {
    src: '/images/udaipur-city-palace.jpg',
    alt: 'City Palace beside Lake Pichola in Udaipur',
  },
  Varanasi: {
    src: '/images/varanasi-ghats.jpg',
    alt: 'The ghats along the Ganges in Varanasi',
  },
};

export function getWalkArtwork(itineraryId) {
  const id = Number(itineraryId);
  return artworkByItinerary[id] || getLandmarkArtwork(landmarkByItinerary[id]) || null;
}

export function getDestinationArtwork(cityName) {
  return artworkByDestination[cityName] || getDestinationLandmarkArtwork(cityName);
}
