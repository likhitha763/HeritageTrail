import photoCredits from './landmarkPhotoCredits.json';

const photosByLandmarkId = new Map(
  photoCredits.map((photo) => [photo.landmarkId, photo]),
);

const firstPhotoByCity = new Map();
for (const photo of photoCredits) {
  if (!firstPhotoByCity.has(photo.city)) {
    firstPhotoByCity.set(photo.city, photo);
  }
}

export function getLandmarkArtwork(landmarkId) {
  return photosByLandmarkId.get(Number(landmarkId)) || null;
}

export function getDestinationLandmarkArtwork(cityName) {
  return firstPhotoByCity.get(cityName) || null;
}
