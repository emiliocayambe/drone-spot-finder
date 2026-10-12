import {
  loadHeaderFooter,
  getLocalISODate,
  latLonToTile,
  escapeHTML,
} from "./utils.js";
import { getFavorites, getLastSearch } from "./localStorage.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  // Dynamically load header and footer partials on page load
  await loadHeaderFooter();

  // Render user favorite spots on load
  renderFavorites();

  const searchForm = document.querySelector("#search-form");
  const searchInput = document.querySelector("#search-input");
  const searchError = document.querySelector("#search-error");
  const plannerDate = document.querySelector("#planner-date");
  const geoBtn = document.querySelector("#geo-btn");

  function showGeoError(msg) {
    geoError.textContent = msg;
    geoError.classList.remove("hidden");
  }

  const last = getLastSearch();
  if (last) {
    if (searchInput && last.query) {
      searchInput.value = last.query;
    }

    if (plannerDate) {
      const today = getLocalISODate();
      // Use saved date if it's today or in the future, otherwise fallback to today's date
      plannerDate.value = last.date && last.date >= today ? last.date : today;
    }
  } else if (plannerDate) {
    plannerDate.value = getLocalISODate();
  }

  // Real-time input validation to clear error states
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (searchInput.value.trim().length > 0) {
        searchError.classList.add("hidden");
        searchInput.classList.remove(
          "border-red-500",
          "ring-2",
          "ring-red-200",
        );
      }
    });
  }

  // Handle search form submission
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();

      // Validate empty search input
      if (!query) {
        searchError.classList.remove("hidden");
        searchInput.classList.add("border-red-500", "ring-2", "ring-red-200");
        searchInput.focus();
        return;
      }

      searchError.classList.add("hidden");
      searchInput.classList.remove("border-red-500", "ring-2", "ring-red-200");

      const selectedDate = plannerDate ? plannerDate.value : "";
      window.location.href = `./search/index.html?q=${encodeURIComponent(query)}&date=${selectedDate}`;
    });
  }

  // Handle geolocation button click
  if (geoBtn) {
    const geoError = document.querySelector("#geo-error");
    function showGeoError(msg) {
      geoError.textContent = msg;
      geoError.classList.remove("hidden");
    }

    geoBtn.addEventListener("click", () => {
      if (!("geolocation" in navigator)) {
        showGeoError("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const selectedDate = plannerDate ? plannerDate.value : "";
          window.location.href = `./detail/index.html?lat=${lat}&lon=${lon}&date=${selectedDate}`;
        },
        (err) => {
          console.error("Geolocation error:", err);
          showGeoError(
            "Unable to retrieve your location. Please check your permissions.",
          );
        },
        { timeout: 10000 },
      );
    });
  }
});

/**
 * Template generator for a favorite spot card.
 *
 * @param {Object} spot - The favorite spot object.
 * @returns {string} - HTML string for the card.
 */
function favoriteCardTemplate(spot) {
  const title = escapeHTML(spot.name || spot.displayName);
  const { x, y } = latLonToTile(Number(spot.lat), Number(spot.lon));
  return `
    <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      <div class="h-32 bg-slate-200 rounded-xl mb-3 flex items-center justify-center text-slate-500 text-xs"><img src="https://tile.openstreetmap.org/13/${x}/${y}.png" alt="Map of ${title}" loading="lazy" class="w-full h-32 object-cover rounded-xl"></div>
      <h3 class="font-bold text-slate-800 text-base mb-1 truncate">${title || spot.displayName}</h3>
      <p class="text-xs text-slate-500 mb-3">Lat: ${spot.lat}, Lon: ${spot.lon}</p>
      <a href="./detail/index.html?lat=${spot.lat}&lon=${spot.lon}&name=${encodeURIComponent(spot.name || "")}" class="block text-center bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold py-2 rounded-xl text-sm transition">
        View detail
      </a>
    </div>
  `;
}

/**
 * Renders the user's favorite spots into the DOM container.
 */
function renderFavorites() {
  const container = document.querySelector("#favorites-container");
  if (!container) return;

  const favorites = getFavorites();
  const topFavorites = favorites.slice(0, 4);

  if (topFavorites.length === 0) {
    container.innerHTML = `
      <div class="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        <p class="text-sm">No favorites yet – search a spot and tap Save.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = topFavorites.map(favoriteCardTemplate).join("");
}
