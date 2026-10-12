import { loadHeaderFooter, getLocalISODate } from "./utils.js";
import { getFavorites } from "./localStorage.mjs";

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

  if (plannerDate) {
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
    geoBtn.addEventListener("click", () => {
      if (!("geolocation" in navigator)) {
        alert("Geolocation is not supported by your browser.");
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
          alert(
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
  return `
    <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      <div class="h-32 bg-gray-200 rounded-xl mb-3 flex items-center justify-center text-gray-400 text-xs">IMAGE PREVIEW</div>
      <h3 class="font-bold text-gray-800 text-base mb-1 truncate">${spot.name || spot.displayName}</h3>
      <p class="text-xs text-gray-500 mb-3">Lat: ${spot.lat}, Lon: ${spot.lon}</p>
      <a href="./detail/index.html?lat=${spot.lat}&lon=${spot.lon}" class="block text-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold py-2 rounded-xl text-sm transition">
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
      <div class="col-span-full border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500">
        <p class="text-sm">No favorites yet – search a spot and tap Save.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = topFavorites.map(favoriteCardTemplate).join("");
}
