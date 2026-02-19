# Map Component

An interactive two-level geographic explorer that visualizes the GeoJournal database on a real SVG world map. Built with [`react-simple-maps`](https://www.react-simple-maps.io/).

---

## What It Does

The Map page lets users visually explore which countries, states, and cities exist in the backend database.

**Level 1 — World Map**
Every country in the world is rendered as a shape. Countries that exist in the database are highlighted in blue; the rest are gray. Hovering a country shows its name in a tooltip. Clicking **USA** drills into the US States view.

**Level 2 — US States Map**
All 50 US states are rendered. States that exist in the database are highlighted in green. Hovering shows the state name and its capital city. Clicking any green state opens the Cities sidebar on the right.

**Cities Sidebar**
A panel slides in listing every city in the database for the selected state. Clicking the ✕ closes the panel. The "← World Map" button in the header returns to Level 1.

---

## Backend API Calls

The component calls three separate endpoints from the Flask backend (`src/services/api.js`):

### 1. `GET /countries`
Called on **page load**.

```js
import { getCountries } from '../../services/api';

getCountries().then(data => {
  // data.countries = { "United States": { name, iso_code }, ... }
});
```

Used to build:
- A `Set` of ISO alpha-2 codes (e.g. `"US"`, `"FR"`) for O(1) lookup
- A `iso_code → name` map for tooltip display
- The total country count shown in the legend

Each SVG country shape is colored based on whether its ISO code is in this set.

---

### 2. `GET /states`
Called when the user **clicks USA** on the world map (lazy-loaded once).

```js
import { getStates } from '../../services/api';

getStates().then(data => {
  // data.states = { "New York": { name, state_code, capital }, ... }
});
```

Used to build:
- A `Set` of state names (matched against `geo.properties.name` from the US topojson)
- A `name → state_code` map (used to trigger the cities fetch)
- A `name → capital` map (displayed in tooltips and the sidebar)
- The total state count shown in the legend

---

### 3. `GET /cities/search?state_code=XX`
Called when the user **clicks a highlighted state**.

```js
import { searchCities } from '../../services/api';

searchCities({ state_code: 'NY' }).then(data => {
  // data.cities = { "New York City": { name, state_code }, ... }
});
```

Results are sorted alphabetically and rendered as a list in the Cities sidebar. Each item shows a "City" badge and the city name.

---

## Data Flow Summary

```
Page loads
  └── GET /countries  →  highlight countries on world map

User clicks USA
  └── GET /states     →  switch to US map, highlight states

User clicks a state
  └── GET /cities/search?state_code=XX  →  populate cities sidebar
```

---

## Map Data Sources

The SVG geography shapes are fetched from public CDNs at runtime — no API key required:

| Map | URL | Format |
|---|---|---|
| World countries | `cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` | TopoJSON |
| US states | `cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json` | TopoJSON |

Country features use numeric ISO 3166-1 codes as IDs (e.g. `840` = USA). A static `NUMERIC_TO_ALPHA2` lookup table inside `Map.jsx` maps these to the ISO alpha-2 codes stored in the backend (e.g. `"US"`).

US state features include a `properties.name` field (e.g. `"New York"`) that is matched directly against the state names returned by `GET /states`.

---

## Files

```
src/Components/Map/
├── Map.jsx      — full component (world map, US map, cities sidebar)
└── README.md    — this file
```
