// src/js/utils.js

/**
 * Loads an external HTML file (partial) and inserts it into a DOM element.
 * @param {string} path - Path to the partial HTML file.
 * @returns {Promise<string>} - HTML content of the file.
 */

export function getLocalISODate(d = new Date()) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

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
 * Renders partial templates into their respective container elements on the page.
 */
export async function loadHeaderFooter() {
  try {
    // If your public folder is configured in Vite, adjust paths accordingly (e.g., "/partials/header.html")
    const base = import.meta.env.BASE_URL;
    const [headerTemplate, footerTemplate] = await Promise.all([
      loadTemplate(`${base}partials/header.html`),
      loadTemplate(`${base}partials/footer.html`),
    ]);

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement) {
      headerElement.innerHTML = headerTemplate;
    }
    if (footerElement) {
      footerElement.innerHTML = footerTemplate;
    }
  } catch (error) {
    console.error("Error rendering header and footer:", error);
  }
}
