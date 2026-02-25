# Map Component

An interactive two-level geographic explorer that visualizes the GeoJournal database on a real SVG world map.

Rendered with plain SVG using [`d3-geo`](https://github.com/d3/d3-geo) for map projections and [`topojson-client`](https://github.com/topojson/topojson-client) to decode the map shapes. No third-party React map library is used, so there are no peer dependency conflicts with React 19.

---

## What It Does

**Level 1 — World Map**
Every country in the world is rendered as an SVG path shape. Countries that exist in the backend database are highlighted in blue; the rest are gray. USA is shown in a darker blue to invite a click. Hovering shows a tooltip with the country name.

**Level 2 — US States Map**
Clicking USA switches to a US map where states in the database are highlighted in green. Hovering shows the state name and capital city.

**Cities Sidebar**
Clicking any green state opens a right-side panel that fetches and lists every city in the database for that state. The "← World Map" button returns to Level 1.

---

## Backend API Calls

The component hits three separate endpoints from the Flask backend via `src/services/api.js`:

### 1. `GET /countries`
Called on **page load**.

```js
import { getCountries } from '../../services/api';

getCountries().then(data => {
  // data.countries = { "United States": { name, iso_code }, ... }
});
```

Used to build:
- A `Set` of ISO alpha-2 codes (`"US"`, `"FR"`, …) for O(1) fill lookup per SVG path
- An `iso_code → name` map for tooltip display
- The total country count shown in the legend

---

### 2. `GET /states`
Called when the user **clicks USA** (lazy-loaded once, cached for the session).

```js
import { getStates } from '../../services/api';

getStates().then(data => {
  // data.states = { "New York": { name, state_code, capital }, ... }
});
```

Used to build:
- A `Set` of state names matched against `geo.properties.name` from the US TopoJSON
- A `name → state_code` map to trigger the cities fetch on click
- A `name → capital` map shown in tooltips and the sidebar header

---

### 3. `GET /cities/search?state_code=XX`
Called when the user **clicks a highlighted state**.

```js
import { searchCities } from '../../services/api';

searchCities({ state_code: 'NY' }).then(data => {
  // data.cities = { "New York City": { name, state_code }, ... }
});
```

Results are sorted alphabetically and rendered as a list in the Cities sidebar.

---

## Data Flow

```
Page loads
  └── fetch world TopoJSON from CDN  (one-time, no auth)
  └── GET /countries                 →  highlight countries on world map

User clicks USA
  └── fetch US states TopoJSON from CDN  (lazy, one-time)
  └── GET /states                    →  switch to US map, highlight states

User clicks a state
  └── GET /cities/search?state_code=XX  →  populate cities sidebar
```

---

## How the Map Rendering Works

The component does not use any React map library. Instead:

1. **TopoJSON is fetched** from public CDNs at runtime (no API key required):

   | Map | CDN URL |
   |---|---|
   | World countries | `cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` |
   | US states | `cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json` |

2. **`topojson-client`'s `feature()`** converts the compact TopoJSON format into standard GeoJSON feature arrays.

3. **`d3-geo` projections** convert geographic coordinates (longitude/latitude) into SVG x/y pixel coordinates:
   - World map: `geoEqualEarth()` — an equal-area projection
   - US map: `geoAlbersUsa()` — the standard US conic projection with inset Alaska/Hawaii

4. **`geoPath(projection)`** generates the SVG `d` attribute string for each country/state polygon.

5. Each feature is rendered as a plain `<path>` element inside an `<svg viewBox>`. Fill color is determined by whether the feature's ID is in the Set returned by the API.

**Country ID matching:** World-atlas encodes each country with a numeric ISO 3166-1 id (e.g. `840` = USA). A static `NUMERIC_TO_ALPHA2` lookup table maps these to the ISO alpha-2 codes stored in the backend (e.g. `"US"`).

**State name matching:** US-atlas state features include `properties.name` (e.g. `"New York"`) which is matched directly against the state names returned by `GET /states`.

---

## Dependencies

| Package | Role | React peer dep? |
|---|---|---|
| `d3-geo` | Map projections and SVG path generation | None |
| `topojson-client` | Decodes TopoJSON into GeoJSON features | None |

Neither package has any React peer dependency, so they work with any React version including React 19.

---

## Files

```
src/Components/Map/
├── Map.jsx      — full component (world map, US map, cities sidebar)
└── README.md    — this file
```
