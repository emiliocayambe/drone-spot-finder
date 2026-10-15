// src/favorites/favorites.js
import { loadHeaderFooter, escapeHTML } from "../js/utils.js";
import { getFavorites, removeFavorite } from "../js/localStorage.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();

  const favoritesGrid = document.querySelector("#favorites-grid");
  if (!favoritesGrid) return;

  renderFavoritesPage(favoritesGrid);

  // Event delegation to handle removal of favorite spots
  favoritesGrid.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-remove]");
    if (removeBtn) {
      const id = removeBtn.dataset.remove;
      removeFavorite(id);
      renderFavoritesPage(favoritesGrid);
    }
  });
});

/**
 * Renders all favorite spots or an empty state message if none exist.
 * @param {HTMLElement} container - The grid container element.
 */
function renderFavoritesPage(container) {
  const favorites = getFavorites();

  if (!favorites || favorites.length === 0) {
    container.innerHTML = `
      <div class="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500 bg-white shadow-sm">
        <p class="text-lg font-semibold text-slate-700 mb-2">No favorites yet</p>
        <p class="text-sm mb-6">Search for a spot and tap "Save" to keep track of your favorite flying locations.</p>
        <a href="/search/" class="inline-block px-6 py-3 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-xl text-sm transition shadow">
          Search Spots Now
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = favorites
    .map((spot) => favoriteItemTemplate(spot))
    .join("");
}

/**
 * Template generator for a favorite spot card.
 * @param {Object} spot - The favorite spot object.
 * @returns {string} - HTML card string.
 */
function favoriteItemTemplate(spot) {
  const name = spot.name || "Unknown Spot";
  const displayName = spot.displayName || "";
  const lat = spot.lat;
  const lon = spot.lon;
  // Unique reference identifier for removal matching lat/lon
  const uniqueId = spot.id || `${lat},${lon}`;

  return `
    <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-3">
          <span class="inline-block px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-semibold uppercase tracking-wider hover:animate-pulse cursor-default">
            Favorite
          </span>
          <span class="text-xs text-slate-500">GPS: ${Number(lat).toFixed(2)}, ${Number(lon).toFixed(2)}</span>
        </div>
        <h3 class="font-bold text-slate-800 text-base mb-1 line-clamp-1">${escapeHTML(name)}</h3>
        <p class="text-xs text-slate-500 mb-4 line-clamp-2">${escapeHTML(displayName)}</p>
      </div>

      <div class="flex gap-2 mt-4">
        <a 
          href="../detail/index.html?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}" 
          class="flex-1 text-center bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow"
        >
          View Detail
        </a>
        <button 
          data-remove="${uniqueId}" 
          class="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-sm transition"
          title="Remove from favorites"
        >
          Remove
        </button>
      </div>
    </div>
  `;
}
