import { loadHeaderFooter, getLocalISODate, escapeHTML } from "../js/utils.js";
import { searchLocations, getSunData } from "../js/externalServices.js";
import { saveFavorite } from "../js/localStorage.mjs";

// Import Leaflet and its CSS
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default marker icons in Vite bundler
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

let map = null;
let markersLayer = null;
let currentLocations = [];

document.addEventListener("DOMContentLoaded", async () => {
  // Load header and footer partials
  await loadHeaderFooter();

  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q") || "";
  const date = urlParams.get("date") || getLocalISODate();

  const refineInput = document.querySelector("#refine-input");
  const refineDate = document.querySelector("#refine-date");
  const refineForm = document.querySelector("#refine-form");
  const filterInput = document.querySelector("#filter-input");
  const sortSelect = document.querySelector("#sort-select");
  const resultsContainer = document.querySelector("#results-container");
  const resultsCount = document.querySelector("#results-count");
  const searchError = document.querySelector("#search-error");

  if (refineInput) refineInput.value = query;
  if (refineDate) refineDate.value = date;

  initMap();

  if (refineForm) {
    refineForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newQuery = refineInput.value.trim();
      const newDate = refineDate.value || getLocalISODate();

      if (!newQuery) {
        showError("Please enter a location to search.", searchError);
        return;
      }

      const params = new URLSearchParams({ q: newQuery, date: newDate });
      window.location.href = `./index.html?${params.toString()}`;
    });
  }

  // Handle real-time name filtering
  if (filterInput) {
    filterInput.addEventListener("input", () => {
      const filterValue = filterInput.value.toLowerCase().trim();
      const sortOrder = sortSelect ? sortSelect.value : "name-asc";

      const filtered = currentLocations.filter((spot) =>
        (spot.display_name || "").toLowerCase().includes(filterValue),
      );

      renderAndMapLocations(filtered, date, sortOrder, resultsContainer);
    });
  }

  // Handle sorting changes considering current filter
  if (sortSelect) {
    sortSelect.addEventListener("change", async () => {
      const filterValue = filterInput
        ? filterInput.value.toLowerCase().trim()
        : "";
      const filtered = currentLocations.filter((spot) =>
        (spot.display_name || "").toLowerCase().includes(filterValue),
      );
      await renderAndMapLocations(
        filtered,
        date,
        sortSelect.value,
        resultsContainer,
      );
    });
  }

  // Event delegation for "Save" favorite button clicks
  if (resultsContainer) {
    resultsContainer.addEventListener("click", (e) => {
      const saveBtn = e.target.closest("[data-save]");
      if (saveBtn) {
        const spotData = JSON.parse(saveBtn.dataset.spot);
        saveFavorite(spotData);
        saveBtn.textContent = "Saved ✓";
        saveBtn.classList.remove("bg-sky-50", "text-sky-700");
        saveBtn.classList.add("bg-green-50", "text-green-600");
        setTimeout(() => {
          saveBtn.textContent = "Save";
          saveBtn.classList.remove("bg-green-50", "text-green-600");
          saveBtn.classList.add("bg-sky-50", "text-sky-700");
        }, 1500);
      }
    });
  }

  if (query) {
    await handleSearch(
      query,
      date,
      resultsContainer,
      resultsCount,
      searchError,
    );
  } else {
    showError("Please enter a search term to find drone spots.", searchError);
    resultsContainer.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-500 text-sm">
        No search query provided.
      </div>
    `;
    if (resultsCount) resultsCount.textContent = "0 results";
  }
});

/**
 * Initializes the Leaflet map.
 */
function initMap() {
  const mapElement = document.querySelector("#map");
  if (!mapElement) return;

  map = L.map(mapElement).setView([-2.1894, -79.8891], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

/**
 * Fetches search results and enriches them with sun data in batches of 3.
 */
async function handleSearch(
  query,
  date,
  container,
  countElement,
  errorElement,
) {
  try {
    hideError(errorElement);
    showLoading(container);

    const locations = await searchLocations(query);

    if (!locations || locations.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-500 text-sm">
          No locations found for "${escapeHTML(query)}". Try another landmark or park.
        </div>
      `;
      if (countElement) countElement.textContent = `0 results for "${query}"`;
      showError(`No locations found for "${query}"`, errorElement);
      return;
    }

    // Fetch sun data in batches of 3 to respect API limits and prevent 429 errors
    const batchSize = 3;
    const enrichedLocations = [];

    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (spot) => {
          try {
            const sunData = await getSunData(spot.lat, spot.lon, date);
            return { ...spot, dayLengthSeconds: sunData?.day_length || 0 };
          } catch {
            return { ...spot, dayLengthSeconds: 0 };
          }
        }),
      );
      enrichedLocations.push(...batchResults);
    }

    currentLocations = enrichedLocations;
    const sortSelect = document.querySelector("#sort-select");
    const sortOrder = sortSelect ? sortSelect.value : "name-asc";
    const filterInput = document.querySelector("#filter-input");
    const filterValue = filterInput
      ? filterInput.value.toLowerCase().trim()
      : "";

    const initialFiltered = enrichedLocations.filter((spot) =>
      (spot.display_name || "").toLowerCase().includes(filterValue),
    );

    await renderAndMapLocations(initialFiltered, date, sortOrder, container);

    if (countElement) {
      countElement.textContent = `${enrichedLocations.length} results for "${query}"`;
    }
  } catch (error) {
    console.error("Search failed:", error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-red-500 text-sm">
        An error occurred while fetching locations. Please try again later.
      </div>
    `;
    if (countElement) countElement.textContent = "0 results";
    showError(
      "Network error while connecting to location service.",
      errorElement,
    );
  }
}

/**
 * Renders location cards and updates map markers based on sorting order.
 */
async function renderAndMapLocations(locations, date, sortOrder, container) {
  const sortedLocations = [...locations].sort((a, b) => {
    const nameA = (a.display_name || "").toLowerCase();
    const nameB = (b.display_name || "").toLowerCase();

    if (sortOrder === "name-desc") {
      return nameB.localeCompare(nameA);
    }
    if (sortOrder === "daylight-desc") {
      return (b.dayLengthSeconds || 0) - (a.dayLengthSeconds || 0);
    }
    return nameA.localeCompare(nameB);
  });

  if (sortedLocations.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-500 text-sm">
        No locations match your filter criteria.
      </div>
    `;
  } else {
    container.innerHTML = sortedLocations
      .map((spot) => spotCardTemplate(spot, date))
      .join("");
  }

  if (markersLayer && map) {
    markersLayer.clearLayers();
    const bounds = [];

    sortedLocations.forEach((spot) => {
      const lat = Number(spot.lat);
      const lon = Number(spot.lon);
      const fullName = escapeHTML(spot.display_name || "Location");
      const shortName = fullName.split(",")[0];

      const marker = L.marker([lat, lon]).bindPopup(`<b>${shortName}</b>`);
      markersLayer.addLayer(marker);
      bounds.push([lat, lon]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }
}

/**
 * Displays loading spinner.
 */
function showLoading(container) {
  container.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-700 mb-4"></div>
      <p class="text-sm">Searching locations and daylight data...</p>
    </div>
  `;
}

/**
 * Shows an error message.
 */
function showError(message, element) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("hidden");
}

/**
 * Hides the error message.
 */
function hideError(element) {
  if (!element) return;
  element.textContent = "";
  element.classList.add("hidden");
}

/**
 * Template generator for a spot search result card.
 */
function spotCardTemplate(spot, date) {
  const fullDisplayName = spot.display_name || "Unknown Location";
  const parts = fullDisplayName.split(",");
  const mainName = parts[0].trim();
  const subName = parts.slice(1).join(",").trim();

  const lat = spot.lat;
  const lon = spot.lon;
  const placeType = spot.type || spot.class || "spot";

  const spotPayload = JSON.stringify({
    lat,
    lon,
    name: mainName,
    displayName: fullDisplayName,
  });

  return `
    <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-3">
          <span class="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-semibold uppercase tracking-wider">
            ${escapeHTML(placeType)}
          </span>
          <span class="text-xs text-slate-500">GPS: ${Number(lat).toFixed(2)}, ${Number(lon).toFixed(2)}</span>
        </div>
        <h3 class="font-bold text-slate-800 text-base mb-1 line-clamp-1">${escapeHTML(mainName)}</h3>
        <p class="text-xs text-slate-500 mb-4 line-clamp-2">${escapeHTML(subName)}</p>
      </div>

      <div class="flex gap-2 mt-4">
        <a 
          href="../detail/index.html?lat=${lat}&lon=${lon}&date=${date}&name=${encodeURIComponent(mainName)}" 
          class="flex-1 text-center bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow"
        >
          View Details
        </a>
        <button
          data-save
          data-spot='${escapeHTML(spotPayload)}'
          class="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-xl text-sm transition"
          aria-label="Save ${escapeHTML(mainName)} to favorites"
          title="Save to favorites"
        >
          Save
        </button>
      </div>
    </div>
  `;
}
