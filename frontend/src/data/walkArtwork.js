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

export function getWalkArtwork(itineraryId) {
  return artworkByItinerary[Number(itineraryId)] || artworkByItinerary[1];
}
