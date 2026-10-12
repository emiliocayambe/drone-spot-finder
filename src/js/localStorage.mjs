const FAVORITES_KEY = "dsf-favorites";

/**
 * Retrieves the list of favorite spots from localStorage.
 * @returns {Array} - Array of favorite spot objects or an empty array.
 */
export function getFavorites() {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading favorites from localStorage:", error);
    return [];
  }
}

/**
 * Saves a new favorite spot ensuring no duplicates based on lat and lon.
 * @param {Object} spot - The spot object to save.
 */
export function saveFavorite(spot) {
  try {
    const favorites = getFavorites();

    // Check if the spot already exists using latitude and longitude
    const exists = favorites.some(
      (fav) => fav.lat === spot.lat && fav.lon === spot.lon,
    );

    if (!exists) {
      favorites.push(spot);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error("Error saving favorite to localStorage:", error);
  }
}

/**
 * Removes a favorite spot by its unique coordinates or id.
 * @param {string|number} id - Identifier or coordinate string of the spot to remove.
 */
export function removeFavorite(id) {
  try {
    let favorites = getFavorites();
    // Filter out the spot that matches the given id/coordinate reference
    favorites = favorites.filter(
      (fav) => fav.id !== id && `${fav.lat},${fav.lon}` !== id,
    );
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Error removing favorite from localStorage:", error);
  }
}

// Añade esto en src/js/localStorage.mjs

const LAST_SEARCH_KEY = "dsf-last-search";

/**
 * Saves the last search query and date to localStorage.
 * @param {string} query - The search query.
 * @param {string} date - The selected date (YYYY-MM-DD).
 */
export function saveLastSearch(query, date) {
  try {
    const searchData = {
      query,
      date,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(searchData));
  } catch (error) {
    console.error("Error saving last search to localStorage:", error);
  }
}

/**
 * Retrieves the last search object from localStorage.
 * @returns {Object|null} - The last search object or null if not found.
 */
export function getLastSearch() {
  try {
    const data = localStorage.getItem(LAST_SEARCH_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading last search from localStorage:", error);
    return null;
  }
}
