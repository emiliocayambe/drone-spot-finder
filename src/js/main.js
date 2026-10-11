// src/js/main.js
import { loadHeaderFooter } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Dynamically load header and footer partials on page load
  await loadHeaderFooter();

  const searchForm = document.querySelector("#search-form");
  const searchInput = document.querySelector("#search-input");
  const searchError = document.querySelector("#search-error");
  const plannerDate = document.querySelector("#planner-date");

  // Set default date to today
  if (plannerDate) {
    const today = new Date().toISOString().split("T")[0];
    plannerDate.value = today;
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
});
