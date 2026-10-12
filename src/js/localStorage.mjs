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
