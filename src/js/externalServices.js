import { getLocalISODate } from "./utils.js";

// In-memory cache to store sun data and prevent redundant API requests
const sunDataCache = new Map();

/**
 * Searches locations using the public Nominatim API (OpenStreetMap).
 */
export async function searchLocations(query) {
  if (!query || !query.trim()) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&email=ecayambemiranda@byupathway.edu`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nominatim error ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from Nominatim API:", error);
    throw error;
  }
}

/**
 * Fetches sunrise, sunset, and solar data with built-in caching.
 */
export async function getSunData(lat, lon, date = getLocalISODate()) {
  const cacheKey = `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)},${date}`;

  if (sunDataCache.has(cacheKey)) {
    return sunDataCache.get(cacheKey);
  }

  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sunrise-Sunset error ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Sunrise-Sunset API status: ${data.status}`);
    }

    // Save result to cache
    sunDataCache.set(cacheKey, data.results);
    return data.results;
  } catch (error) {
    console.warn(
      `Error fetching sun data for (${lat}, ${lon}):`,
      error.message,
    );
    throw error;
  }
}
