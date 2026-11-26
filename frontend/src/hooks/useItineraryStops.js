import { useEffect, useState } from 'react';
import { getItineraryDetails } from '../api.js';

export default function useItineraryStops(itineraryId) {
  const [result, setResult] = useState({
    itineraryId: null,
    stops: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (!itineraryId) {
      setResult({ itineraryId: null, stops: [], loading: false, error: '' });
      return undefined;
    }

    let cancelled = false;
    setResult({ itineraryId, stops: [], loading: true, error: '' });

    getItineraryDetails(itineraryId)
      .then((stops) => {
        if (!cancelled) setResult({ itineraryId, stops, loading: false, error: '' });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setResult({
            itineraryId,
            stops: [],
            loading: false,
            error: requestError.message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [itineraryId]);

  if (result.itineraryId !== itineraryId) {
    return { stops: [], loading: Boolean(itineraryId), error: '' };
  }

  return result;
}
