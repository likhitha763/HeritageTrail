import { useEffect, useState } from 'react';
import { createMapsSearchUrl } from '../data/mapLinks.js';

function getArticleResults(payload, query) {
  return Object.values(payload.query?.pages || {})
    .sort((first, second) => (first.index || 0) - (second.index || 0))
    .slice(0, 6)
    .map((page) => {
      const title = page.title || query;
      return {
        title,
        extract: page.extract || 'Open the article for more information about this place.',
        articleUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        mapUrl: createMapsSearchUrl(`${title}, India`),
      };
    });
}

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isReusableLicense(license) {
  return /^CC BY(?:-SA)? \d+(?:\.\d+)?$/i.test(license)
    || /^CC0(?:\s|$)/i.test(license)
    || /^Public domain/i.test(license);
}

function getFreePhotos(payload, query) {
  return Object.values(payload.query?.pages || {})
    .sort((first, second) => (first.index || 0) - (second.index || 0))
    .map((page) => {
      const image = page.imageinfo?.[0];
      const metadata = image?.extmetadata || {};
      const license = plainText(metadata.LicenseShortName?.value);

      if (!image?.thumburl || !image.descriptionurl || !isReusableLicense(license)) {
        return null;
      }

      return {
        title: page.title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/_/g, ' '),
        imageUrl: image.thumburl,
        sourceUrl: image.descriptionurl,
        author: plainText(metadata.Artist?.value) || 'Wikimedia contributor',
        license,
        licenseUrl: metadata.LicenseUrl?.value?.replace(/^http:/, 'https:'),
        mapUrl: createMapsSearchUrl(`${query} India`),
      };
    })
    .filter(Boolean)
    .slice(0, 6);
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Open place search returned HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.error.info || 'Open place search returned an error.');
  }
  return payload;
}

export default function IndiaPlaceDiscovery({ query }) {
  const [results, setResults] = useState({
    articles: [],
    photos: [],
    loading: false,
    errors: [],
  });

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 3) {
      setResults({ articles: [], photos: [], loading: false, errors: [] });
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setResults({ articles: [], photos: [], loading: true, errors: [] });

      const articleParams = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `${searchTerm} India`,
        gsrnamespace: '0',
        gsrlimit: '6',
        prop: 'extracts',
        exintro: '1',
        explaintext: '1',
        exsentences: '2',
        format: 'json',
        origin: '*',
      });
      const photoParams = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `${searchTerm} India`,
        gsrnamespace: '6',
        gsrlimit: '10',
        prop: 'imageinfo',
        iiprop: 'url|extmetadata',
        iiurlwidth: '720',
        format: 'json',
        origin: '*',
      });

      const [articleResult, photoResult] = await Promise.allSettled([
        fetchJson(`https://en.wikipedia.org/w/api.php?${articleParams}`, controller.signal),
        fetchJson(`https://commons.wikimedia.org/w/api.php?${photoParams}`, controller.signal),
      ]);
      if (!controller.signal.aborted) {
        const errors = [articleResult, photoResult]
          .filter((result) => result.status === 'rejected')
          .map((result) => result.reason.message);
        setResults({
          articles: articleResult.status === 'fulfilled'
            ? getArticleResults(articleResult.value, searchTerm)
            : [],
          photos: photoResult.status === 'fulfilled'
            ? getFreePhotos(photoResult.value, searchTerm)
            : [],
          loading: false,
          errors,
        });
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const mapSearchUrl = createMapsSearchUrl(`${query.trim()} India`);

  return (
    <section className="india-place-discovery" aria-live="polite">
      <div className="india-place-discovery-heading">
        <p className="eyebrow">INDIA-WIDE PLACE SEARCH</p>
        <h2>Explore places matching “{query}”.</h2>
        <p>
          Article summaries come from Wikipedia; photo previews below are reusable Commons images with credits.
          These discoveries do not have a bookable tour yet.
        </p>
      </div>

      {results.loading && <p className="notice" role="status">Searching India-wide place and photo results…</p>}
      {results.errors.map((error) => (
        <p className="notice notice-error" role="alert" key={error}>{error}</p>
      ))}

      {!results.loading && results.articles.length > 0 && (
        <div className="india-place-result-grid">
          {results.articles.map((place) => (
            <article className="india-place-result" key={place.title}>
              <p className="eyebrow">DISCOVERY · NOT BOOKABLE</p>
              <h3>{place.title}</h3>
              <p>{place.extract}</p>
              <div className="india-place-result-links">
                <a href={place.articleUrl} target="_blank" rel="noopener noreferrer">
                  Read Wikipedia overview <span aria-hidden="true">↗</span>
                </a>
                <a href={place.mapUrl} target="_blank" rel="noopener noreferrer">
                  Find on Maps <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {!results.loading && results.photos.length > 0 && (
        <div className="india-place-photo-section">
          <h3>Free-licensed photos matching your search</h3>
          <div className="india-place-photo-grid">
            {results.photos.map((photo) => (
              <article className="india-place-photo" key={photo.sourceUrl}>
                <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <img src={photo.imageUrl} alt={photo.title} loading="lazy" decoding="async" />
                </a>
                <div>
                  <h4>{photo.title}</h4>
                  <p>Photo by {photo.author} · {photo.license}</p>
                  <div className="india-place-result-links">
                    <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Photo source</a>
                    {photo.licenseUrl && (
                      <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">License</a>
                    )}
                    <a href={photo.mapUrl} target="_blank" rel="noopener noreferrer">Find place on Maps</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {!results.loading && results.errors.length === 0 && results.articles.length === 0 && results.photos.length === 0 && (
        <p className="notice">No matching articles or reusable photos were found. Try another spelling or search Maps.</p>
      )}
      {!results.loading && results.errors.length === 0 && results.articles.length > 0 && results.photos.length === 0 && (
        <p className="notice">No reusable photos were found for this search.</p>
      )}

      <a className="india-place-map-fallback" href={mapSearchUrl} target="_blank" rel="noopener noreferrer">
        Search “{query}” on Google Maps <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
