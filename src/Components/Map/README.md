# Map Component

An interactive two-level geographic explorer that visualizes the GeoJournal database on a real SVG world map, with journal heatmaps, filtering, and full CRUD for journal entries.

Rendered with plain SVG using [`d3-geo`](https://github.com/d3/d3-geo) for map projections and [`topojson-client`](https://github.com/topojson/topojson-client) to decode the map shapes. No third-party React map library is used, so there are no peer dependency conflicts with React 19.

---

## What It Does

**Level 1 — World Map (`WorldMap`)**
Every country is rendered as an SVG path. Countries in the database are shaded on a blue heatmap scale based on journal count; countries not in the database are sand-colored. USA is shown in darker blue to invite a click. Hovering shows the country name and journal count.

**Level 2 — US States Map (`USMap`)**
Clicking USA switches to a US map. States in the database are shaded on a green heatmap scale proportional to journal count. Clicking a state selects/deselects it (multi-select) and highlights it in ocean-blue. Hovering shows the state name, capital, and journal count.

**Cities Sidebar (`StateSidebar`)**
Selecting one or more states opens a right-side panel listing every city in the database for those states, each with its journal count badge. Clicking a city opens the journal panel.

**Journal Panel (`JournalPanel`)**
Clicking a city in the sidebar opens a second panel that fetches and displays all journal entries for that city. Logged-in users can create, edit, and delete journals inline via `JournalForm`. Entries respect the active date filter.

**Filtering**
The header provides two filter bars:
- **Date filter** — "From" / "To" date pickers narrow which journals are counted and displayed.
- **Location filter** — cascading Country → State → City dropdowns that sync with the map view. State and city selectors support multi-select with removable chips.

**Heatmap & Badges**
Both maps use a 5-stop color gradient (computed by `heatColor` in `mapConstants`) to shade regions by journal density. Numeric badges are drawn at each region's centroid to show the filtered journal count.

---

## Backend API Calls

The component communicates with the Flask backend via `src/services/api.js`:

### 1. `GET /countries`
Called on **page load**.

```js
import { getCountries } from '../../services/api';

getCountries().then(data => {
  // data.countries = { "United States": { name, iso_code }, ... }
});
```

Used to build:
- A `Set` of ISO alpha-2 codes for O(1) fill lookup per SVG path
- An `iso_code → name` map for tooltip display and the location-filter dropdown
- The total country count shown in the legend

### 2. `GET /states`
Called when the user **clicks USA** (lazy-loaded once, cached for the session).

```js
import { getStates } from '../../services/api';

getStates().then(data => {
  // data.states = { "New York": { name, state_code, capital }, ... }
});
```

Used to build:
- A `Set` of state names matched against the US TopoJSON features
- A `name → state_code` map for the cities fetch and location filter
- A `name → capital` map shown in tooltips and the sidebar header

### 3. `GET /cities/search?state_code=XX`
Called when the user **clicks a highlighted state** (one request per selected state, run in parallel).

```js
import { searchCities } from '../../services/api';

searchCities({ state_code: 'NY' }).then(data => {
  // data.cities = { "New York City": { name, state_code }, ... }
});
```

Results from all selected states are merged, sorted alphabetically, and rendered in `StateSidebar`.

### 4. `GET /journals`
Called on **page load** (if logged in) and after every journal create/edit/delete. Used by `Map` for heatmap counts and by `JournalPanel` for the per-city entry list.

```js
import { getJournals } from '../../services/api';

getJournals().then(data => {
  // data.journals = [{ _id, title, body, visited_at, location_name, state_code, iso_code }, ...]
});
```

### 5. `POST /journals` (create) / `PUT /journals/:id` (update) / `DELETE /journals/:id`
Called from `JournalForm` and `JournalPanel` when the user adds, edits, or removes a journal entry. Requires authentication.

```js
import { createJournal, updateJournal, deleteJournal } from '../../services/api';

await createJournal({
  title, body, location_type: 'city', location_name: city,
  state_code, iso_code: 'US', visited_at,
});
await updateJournal(id, { title, body, visited_at });
await deleteJournal(id);
```

---

## Data Flow

```
Page loads
  ├── fetch world TopoJSON from CDN      (one-time, no auth)
  ├── GET /countries                      → highlight countries on world map
  └── GET /journals (if logged in)        → compute heatmap counts & badges

User clicks USA
  ├── fetch US states TopoJSON from CDN   (lazy, one-time)
  └── GET /states                         → switch to US map, highlight states

User clicks a state (multi-select)
  └── GET /cities/search?state_code=XX    → populate StateSidebar (one per state)

User clicks a city
  └── GET /journals?location_type=city    → populate JournalPanel

User creates / edits / deletes a journal
  └── POST / PUT / DELETE /journals/:id   → refresh JournalPanel + heatmap counts
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
   - World map: `geoEqualEarth()` — an equal-area projection (800 × 460 viewBox)
   - US map: `geoAlbersUsa()` with `fitSize` — the standard US conic projection with inset Alaska/Hawaii (960 × 600 viewBox)

4. **`geoPath(projection)`** generates the SVG `d` attribute string for each country/state polygon.

5. Each feature is rendered as a plain `<path>` element inside an `<svg viewBox>`. Fill color is determined by a 5-stop heatmap gradient based on journal count, computed by `heatColor()` in `mapConstants.js`.

**Country ID matching:** World-atlas encodes each country with a numeric ISO 3166-1 id (e.g. `840` = USA). A static `NUMERIC_TO_ALPHA2` lookup table in `mapConstants.js` maps these to the ISO alpha-2 codes stored in the backend.

**State name matching:** US-atlas state features include `properties.name` (e.g. `"New York"`) which is matched directly against the state names returned by `GET /states`.

---

## Tests

All tests use [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) and can be run with `npm test` (or `npx vitest run`). The suite is organized into six test files covering every source module.

### Testing strategy

| Layer | What's tested | Approach |
|---|---|---|
| **Pure utility functions** | `journalDateFilter`, `journalLocationFilter` | Direct function calls with various inputs — no rendering, no mocks |
| **Presentational components** | `StateSidebar`, `JournalForm` | Render with props, assert DOM output, simulate clicks/input |
| **Async data components** | `JournalPanel`, `Map` | Mock the API module (`vi.mock`), stub `fetch` for CDN calls, assert loading/error/success states |

### How mocking works

The tests never hit a real backend or CDN. Two layers of mocking are used:

1. **`vi.mock('../../services/api')`** — replaces every API function (`getCountries`, `getStates`, `searchCities`, `getJournals`, `createJournal`, `updateJournal`, `deleteJournal`, `getStoredToken`) with Vitest spies that return controlled `Promise.resolve(...)` or `Promise.reject(...)` values. This isolates tests from the network and lets each test decide exactly what the "backend" returns.

2. **`vi.stubGlobal('fetch')`** (in `Map.test.jsx` only) — intercepts the raw `fetch()` calls to the CDN URLs (`world-atlas`, `us-atlas`) and returns minimal TopoJSON topologies with a single polygon. This avoids downloading real map geometry in CI while still exercising the `topojson-client` parsing path.

Authentication is simulated by setting/clearing `localStorage.setItem('token', 'fake-token')` — `getStoredToken` reads from `localStorage`, so tests control the logged-in/logged-out state.

### `Map.test.jsx` — location filter UI (5 tests)

Tests the top-level `Map` component's location-filter toolbar. The global `fetch` is stubbed to return minimal TopoJSON, and the API module is mocked to return two countries (US, Utopia) and one state (Texas).

| Test | What it verifies |
|---|---|
| renders the location filter row | The filter bar appears with all three `<select>` elements (Country, States, Cities) |
| lists countries from GET /countries | The country dropdown is populated with the names from the mock API response |
| switches to US map when US is chosen | Selecting "US" in the country dropdown changes the heading to "United States" |
| enables state select after US is selected | The States dropdown starts disabled; after selecting US it becomes enabled and lists "Texas" |
| adds a state chip when a state is selected | Choosing "Texas" from the dropdown renders a removable chip tag |
| shows Clear location after applying a filter | Selecting any country makes the "Clear location" button appear |

### `StateSidebar.test.jsx` — city panel rendering (9 tests)

Tests the `StateSidebar` component in isolation with controlled props (no API mocks needed since the parent passes data down).

| Test | What it verifies |
|---|---|
| renders state name, code, and capital | Header shows "New York", "NY", "Capital: Albany" |
| renders multiple selected states | Shows both states with a "2 States" badge |
| shows loading spinner | `citiesLoading={true}` renders "Loading..." |
| shows error message | `citiesError="..."` renders the error text |
| shows empty-state (single) | Zero cities shows "No cities found for the selected state." |
| shows empty-state (plural) | Two states with zero cities uses "states." plural wording |
| renders city buttons | Each city name appears as a clickable button |
| calls onCityClick | Clicking a city button fires the callback with the city name |
| displays journal count badge | A city with `journalCounts={{ Albany: 5 }}` shows a "5" badge |
| calls onClose | Clicking the close button fires the `onClose` callback |

### `JournalPanel.test.jsx` — journal list + CRUD (10 tests)

Tests the `JournalPanel` component which fetches and displays journal entries for a city. The API module is mocked; authentication is controlled via `localStorage`.

| Test | What it verifies |
|---|---|
| login prompt when logged out | Shows "Log in to see and add journal entries" when no token |
| renders city and state code | Header always shows the city name and state code |
| calls onClose | Close button fires the callback |
| shows entries + Add button | Logged-in user sees journal titles and the "+ Add Journal" button |
| empty-state when no journals | Shows "No journal entries for Austin yet." |
| API error message | A rejected `getJournals` shows the error text |
| reveals JournalForm on Add | Clicking "+ Add Journal" shows the "New Journal Entry" form |
| delete removes entry | After successful `deleteJournal`, the entry disappears from the list |
| inline edit form | Clicking the edit icon shows the pre-filled edit form |
| successful update re-fetches | After `updateJournal` succeeds, the panel re-fetches and shows updated title |
| delete error message | A rejected `deleteJournal` shows the error while keeping the entry |

**Visit date filter sub-suite (3 tests):**

| Test | What it verifies |
|---|---|
| hides journals outside range | `dateFrom/dateTo` props filter entries by `visited_at` |
| date-range empty message | When all journals fall outside the range, shows a specific message |
| no filter shows all | Empty `dateFrom`/`dateTo` shows every journal |

### `JournalForm.test.jsx` — create & edit modes (11 tests)

Tests the `JournalForm` component in both create mode (no `journal` prop) and edit mode (with an existing `journal` prop).

**Create mode (7 tests):**

| Test | What it verifies |
|---|---|
| renders form fields and buttons | Title, body, date visited inputs + Save/Cancel buttons present |
| Save disabled when title empty | Submit button is disabled until a title is entered |
| Save enabled after typing title | Typing into the title field enables the button |
| Cancel fires callback | Clicking Cancel calls `onCancel` |
| successful submit calls onSuccess | After `createJournal` resolves, `onSuccess` fires |
| API error shows message | A rejected `createJournal` renders the error text inline |
| shows "Saving..." in flight | While the promise is pending, button text changes to "Saving..." |

**Edit mode (5 tests):**

| Test | What it verifies |
|---|---|
| heading and pre-filled fields | Shows "Edit Journal Entry" with title/body/date pre-populated |
| Update button instead of Save | The submit button reads "Update" |
| calls updateJournal not createJournal | Submitting calls `updateJournal(id, ...)` and never `createJournal` |
| successful update calls onSuccess | After `updateJournal` resolves, `onSuccess` fires |
| API error shows message | A rejected `updateJournal` renders the error text |

### `journalDateFilter.test.js` — date filter logic (14 tests)

Pure unit tests for the `hasJournalDateFilter` and `journalMatchesDateRange` functions.

| Area | What's covered |
|---|---|
| `hasJournalDateFilter` | Returns `false` for empty/whitespace inputs; `true` when either or both bounds are set |
| `journalMatchesDateRange` | Passes through when no filter is active; rejects missing/invalid `visited_at`; correctly applies `dateFrom` lower bound, `dateTo` upper bound, and combined range; handles ISO timestamps; trims whitespace on date strings |

### `journalLocationFilter.test.js` — location filter logic (10 tests)

Pure unit tests for the `hasLocationFilter` and `filterJournalsByLocation` functions using a fixture of three journals (NYC/US, Paris/FR, Austin/US).

| Area | What's covered |
|---|---|
| `hasLocationFilter` | Returns `false` for all-empty inputs; `true` when country, stateNames Set, or cityNames Set has entries; handles whitespace-only strings |
| `filterJournalsByLocation` | No filter returns full list; filters by country ISO; filters by single or multiple state names (translated via `stateNameToCode`); returns empty for unknown state; filters by single or multiple city names; chains country + state + city together; returns empty when country excludes all; trims whitespace on `countryIso` |

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
├── Map.jsx                       — top-level orchestrator: data fetching, state management, filtering, layout
├── WorldMap.jsx                  — SVG world map with country heatmap and journal badges
├── USMap.jsx                     — SVG US states map with state heatmap, selection, and journal badges
├── StateSidebar.jsx              — right-side panel listing cities for selected states
├── JournalPanel.jsx              — right-side panel showing journal entries for a city (CRUD)
├── JournalForm.jsx               — inline form for creating / editing a journal entry
├── mapConstants.js               — shared constants: colors, heatmap scales, heatColor(), NUMERIC_TO_ALPHA2
├── journalDateFilter.js          — pure functions for date-range filtering of journals
├── journalLocationFilter.js      — pure functions for country/state/city filtering of journals
├── Map.test.jsx                  — tests for the top-level Map component
├── StateSidebar.test.jsx         — tests for StateSidebar
├── JournalPanel.test.jsx         — tests for JournalPanel (fetch, delete, edit)
├── JournalForm.test.jsx          — tests for JournalForm (create & update modes)
├── journalDateFilter.test.js     — unit tests for date-range filter logic
├── journalLocationFilter.test.js — unit tests for location filter logic
└── README.md                     — this file
```
