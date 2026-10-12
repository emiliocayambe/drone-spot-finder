# 🚁 Drone Spot Finder

**Drone Spot Finder** is a modern, responsive web application designed for drone pilots, aerial photographers, and hobbyists. It allows users to discover safe and scenic flying locations, plan flights around exact daylight and twilight windows, calculate precise golden hour intervals, and manage a personalized list of favorite spots.

---

## 🌟 Key Features

- **Location Search & Geocoding:** Search for any park, landmark, or city worldwide using OpenStreetMap's Nominatim API.
- **Interactive Mapping:** Powered by Leaflet.js to visualize search results with dynamic markers, custom popups, and automatic bounds fitting.
- **Daylight & Sunlight Analytics:** View exact sunrise, solar noon, and sunset times.
- **Golden Hour Planner:** Calculate morning and evening golden hour intervals tailored to any selected date.
- **Real-time Filtering & Sorting:** Filter search results instantly by name and sort them by name or daylight duration.
- **Favorites Management:** Save and remove favorite flying locations securely using browser `localStorage`.
- **Responsive & Accessible Design:** Crafted with a clean UI utilizing Tailwind CSS v4, custom utility tokens, and full mobile navigation support.

---

## 🛠️ Tech Stack

- **Core:** Vanilla JavaScript (ES Modules)
- **Bundler & Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (Custom theme & typography via Inter)
- **Mapping & GIS:** Leaflet.js (`leaflet`)
- **Persistence:** Browser `localStorage`

---

## 🔌 Integrated APIs & Optimization Strategies

1. **Nominatim API (OpenStreetMap):**
   - Used for geocoding search queries into geographic coordinates (`lat`, `lon`) and metadata (place types, display names).
2. **Sunrise-Sunset API:**
   - Provides precise astronomical data (sunrise, sunset, solar noon, and day length).
   - **Optimization & Performance:** Implements **in-memory caching (`Map`)** to prevent redundant API calls for identical location-date pairs, alongside a **batching strategy (batches of 3 requests)** via `Promise.all` to respect API limits and prevent `429 Too Many Requests` errors.

---

## ☀️ How the Golden Hour is Calculated

The application calculates optimal lighting conditions (golden hours) relative to the precise sunrise and sunset times fetched from the Sunrise-Sunset API:

- **Morning Golden Hour:** Occurs immediately after sunrise when the sun is low in the sky, casting warm, soft light ideal for cinematic aerial shots. The window is calculated from sunrise up to 1 hour after sunrise.
- **Evening Golden Hour:** Occurs during the final hour before sunset. The window is calculated starting 1 hour prior to sunset and ending precisely at sunset.
- **Fallback Handling:** Graceful error catching ensures that if astronomical APIs experience latency or rate limits, default fallbacks keep the application stable without disrupting user navigation.

---

## 🚀 Getting Started & Local Development

Follow these steps to set up and run the project on your local machine:

### Prerequisites
Make sure you have **Node.js** installed on your system (v16+ recommended).

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd drone-spot-finder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL provided by Vite (typically `http://localhost:5173`).

---

## 📂 Project Structure

```text
src/
├── css/
│   └── style.css          # Tailwind CSS configuration and imports
├── js/
│   ├── externalServices.mjs # API wrappers (Nominatim & Sunrise-Sunset with caching)
│   ├── localStorage.mjs     # Favorites management utilities
│   └── utils.js             # Shared helpers, XSS sanitizer, & golden hour calculation
├── public/
│   ├── images/              # Logo and favicon assets
│   └── partials/            # Reusable header and footer HTML components
├── search/                  # Search view module & map integration
├── detail/                  # Detail view & golden hour planner module
└── favorites/               # Saved favorite spots view module
```