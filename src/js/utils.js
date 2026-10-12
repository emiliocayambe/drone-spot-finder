/**
 * Loads an external HTML file (partial) and inserts it into a DOM element.
 * @param {string} path - Path to the partial HTML file.
 * @returns {Promise<string>} - HTML content of the file.
 */
export async function loadTemplate(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load template: ${path}`);
    const html = await res.text();
    return html;
  } catch (error) {
    console.error("Error loading template:", error);
    return "";
  }
}

/**
 * Escapes special HTML characters to prevent XSS attacks.
 * @param {string} str - Raw input string.
 * @returns {string} - Sanitized string.
 */
export function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Renders partial templates into their respective container elements on the page.
 */
// src/js/utils.js (fragmento de loadHeaderFooter actualizado)
export async function loadHeaderFooter() {
  try {
    const base = import.meta.env.BASE_URL;
    const [headerTemplate, footerTemplate] = await Promise.all([
      loadTemplate(`${base}partials/header.html`),
      loadTemplate(`${base}partials/footer.html`),
    ]);

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement) {
      headerElement.innerHTML = headerTemplate;

      // Highlight active nav link and add mobile menu toggle
      const currentPath = window.location.pathname;
      const navLinks = headerElement.querySelectorAll("nav a, #mobile-menu a");

      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (
          href === currentPath ||
          (currentPath.includes("search") && href.includes("search")) ||
          (currentPath.includes("favorites") && href.includes("favorites"))
        ) {
          link.setAttribute("aria-current", "page");
          link.classList.add(
            "text-sky-700",
            "border-b-2",
            "border-sky-700",
            "pb-1",
          );
          link.classList.remove("text-slate-600");
        }
      });

      // Mobile menu toggle logic
      const menuBtn = headerElement.querySelector("#menu-btn");
      const mobileMenu = headerElement.querySelector("#mobile-menu");
      if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
          mobileMenu.classList.toggle("hidden");
        });
      }
    }

    if (footerElement) footerElement.innerHTML = footerTemplate;
  } catch (error) {
    console.error("Error rendering header and footer:", error);
  }
}

/**
 * Returns the current date formatted as YYYY-MM-DD in local time.
 * @returns {string} - Local ISO date string.
 */
export function getLocalISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates morning and evening golden hour windows based on sunrise and sunset ISO strings.
 * @param {Object} sunResults - Results object from Sunrise-Sunset API.
 * @returns {Object} - Golden hour time ranges for morning and evening.
 */
export function calcGoldenHour(sunResults) {
  if (!sunResults || !sunResults.sunrise || !sunResults.sunset) {
    return { morning: null, evening: null };
  }

  const sunriseDate = new Date(sunResults.sunrise);
  const sunsetDate = new Date(sunResults.sunset);

  // Morning golden hour: from sunrise to sunrise + 1 hour
  const morningStart = new Date(sunriseDate);
  const morningEnd = new Date(sunriseDate.getTime() + 60 * 60 * 1000);

  // Evening golden hour: from sunset - 1 hour to sunset
  const eveningStart = new Date(sunsetDate.getTime() - 60 * 60 * 1000);
  const eveningEnd = new Date(sunsetDate);

  return {
    morning: { start: morningStart, end: morningEnd },
    evening: { start: eveningStart, end: eveningEnd },
  };
}
