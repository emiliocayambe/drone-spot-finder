// src/detail/detail.js
import {
  loadHeaderFooter,
  getLocalISODate,
  calcGoldenHour,
  escapeHTML,
} from "../js/utils.js";
import { getSunData } from "../js/externalServices.js";
import { saveFavorite } from "../js/localStorage.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();

  const urlParams = new URLSearchParams(window.location.search);
  const lat = urlParams.get("lat");
  const lon = urlParams.get("lon");
  const date = urlParams.get("date") || getLocalISODate();
  const nameParam = urlParams.get("name");
  const searchQuery = urlParams.get("q") || "";

  const detailHeader = document.querySelector("#detail-header");
  const sunTimeline = document.querySelector("#sun-timeline");
  const detailDateInput = document.querySelector("#detail-date");
  const backLink = document.querySelector("#back-link");

  // Configure back link cleanly using only q and date
  if (backLink) {
    if (searchQuery) {
      const returnParams = new URLSearchParams({ q: searchQuery, date });
      backLink.href = `../search/index.html?${returnParams.toString()}`;
    } else {
      backLink.href = "#";
      backLink.addEventListener("click", (e) => {
        e.preventDefault();
        history.back();
      });
    }
  }

  // Set date input value and handle change event
  if (detailDateInput) {
    detailDateInput.value = date;
    detailDateInput.addEventListener("change", (e) => {
      const newDate = e.target.value;
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set("date", newDate);
      window.location.search = currentParams.toString();
    });
  }

  if (!lat || !lon) {
    detailHeader.innerHTML = `<p class="text-red-500 text-sm">Error: Location coordinates are missing.</p>`;
    sunTimeline.innerHTML = "";
    return;
  }

  // Render header info
  detailHeader.innerHTML = `
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <span class="px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-semibold uppercase tracking-wider">Spot Detail</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 mt-2">${escapeHTML(nameParam || "Selected Location")}</h1>
        <p class="text-xs text-slate-500 mt-1">Latitude: ${Number(lat).toFixed(4)} | Longitude: ${Number(lon).toFixed(4)}</p>
      </div>
      <button id="save-spot-btn" class="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-xl text-sm transition shadow">
        Save
      </button>
    </div>
  `;

  // Save button listener
  const saveBtn = document.querySelector("#save-spot-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveFavorite({
        lat,
        lon,
        name: nameParam || "Selected Location",
        displayName: nameParam || `Lat: ${lat}, Lon: ${lon}`,
      });
      saveBtn.textContent = "Saved ✓";
      saveBtn.classList.remove("bg-sky-700", "hover:bg-sky-800");
      saveBtn.classList.add("bg-green-600");
      setTimeout(() => {
        saveBtn.textContent = "Save";
        saveBtn.classList.remove("bg-green-600");
        saveBtn.classList.add("bg-sky-700", "hover:bg-sky-800");
      }, 1500);
    });
  }

  // Fetch sun data and display golden hour timeline
  try {
    const sunData = await getSunData(lat, lon, date);
    const goldenHour = calcGoldenHour(sunData);
    const userTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const formatTime = (isoString) => {
      if (!isoString) return "N/A";
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    sunTimeline.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Morning Golden Hour -->
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🌅</span>
            <h3 class="font-bold text-amber-900 text-base">Morning Golden Hour</h3>
          </div>
          <p class="text-amber-800 text-sm font-semibold mb-1">
            ${goldenHour.morning ? `${formatTime(goldenHour.morning.start)} -${formatTime(goldenHour.morning.end)}` : "Unavailable"}
          </p>
          <p class="text-amber-700 text-xs">Ideal soft lighting shortly after sunrise for cinematic drone shots.</p>
        </div>

        <!-- Evening Golden Hour -->
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🌇</span>
            <h3 class="font-bold text-amber-900 text-base">Evening Golden Hour</h3>
          </div>
          <p class="text-amber-800 text-sm font-semibold mb-1">
            ${goldenHour.evening ? `${formatTime(goldenHour.evening.start)} -${formatTime(goldenHour.evening.end)}` : "Unavailable"}
          </p>
          <p class="text-amber-700 text-xs">Warm, low-angle sunlight right before sunset for breathtaking aerial photography.</p>
        </div>
      </div>

      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-xs text-slate-500 uppercase font-semibold">Sunrise</p>
          <p class="text-sm font-bold text-slate-800 mt-1">${formatTime(sunData.sunrise)}</p>
        </div>
        <div>
          <p class="text-xs text-slate-500 uppercase font-semibold">Solar Noon</p>
          <p class="text-sm font-bold text-slate-800 mt-1">${formatTime(sunData.solar_noon)}</p>
        </div>
        <div>
          <p class="text-xs text-slate-500 uppercase font-semibold">Sunset</p>
          <p class="text-sm font-bold text-slate-800 mt-1">${formatTime(sunData.sunset)}</p>
        </div>
      </div>

      <div class="mt-4 text-center">
        <p class="text-xs text-slate-500 italic">Times shown in your local time zone (${userTimeZone}).</p>
      </div>
    `;
  } catch (error) {
    console.error("Failed to load sun data:", error);
    sunTimeline.innerHTML = `
      <div class="text-red-500 text-sm py-4">Unable to load sunlight and golden hour data for this location.</div>
    `;
  }
});
