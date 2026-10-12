import { getLocalISODate } from "./utils.js";

/**
 * Searches locations using the public Nominatim API (OpenStreetMap).
 * @param {string} query - The search term (e.g., "Park", "Beach").
 * @returns {Promise<Array>} - A list of matching location objects.
 */
export async function searchLocations(query) {
  if (!query || !query.trim()) return [];

  // Nominatim policy compliance: use email query parameter instead of User-Agent header in browsers, and request address details
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&email=ecayambemiranda@byupathway.edu`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from Nominatim API:", error);
    throw error;
  }
}

/**
 * Fetches sunrise, sunset, and solar data for specific coordinates and date.
 * @param {number|string} lat - Latitude.
 * @param {number|string} lon - Longitude.
 * @param {string} [date] - Date in YYYY-MM-DD format.
 * @returns {Promise<Object>} - Sunlight data object.
 */
export async function getSunData(lat, lon, date = getLocalISODate()) {
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error("Failed to retrieve sun data from API.");
    }

    return data.results;
  } catch (error) {
    console.error("Error fetching from Sunrise-Sunset API:", error);
    throw error;
  }
}
