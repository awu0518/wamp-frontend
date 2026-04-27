import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { geoEqualEarth, geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { getCountries, getStates, searchCities, getJournals, getStoredToken } from '../../services/api';
import { COLOR, NUMERIC_TO_ALPHA2, STATE_HEAT, COUNTRY_HEAT, STATE_SELECTED } from './mapConstants';
import { journalMatchesDateRange, hasJournalDateFilter } from './journalDateFilter';
import { filterJournalsByLocation, hasLocationFilter } from './journalLocationFilter';
import WorldMap from './WorldMap';
import USMap from './USMap';
import StateSidebar from './StateSidebar';
import JournalPanel from './JournalPanel';

const WORLD_GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const US_GEO_URL =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const W_W = 800;
const W_H = 460;
const US_W = 960;
const US_H = 600;

export default function Map() {
  const [view, setView] = useState('world');

  const location = useLocation();

  const cityFromUrl = useMemo(() => {
    return new URLSearchParams(location.search).get('city');
  }, [location.search]);

  // ── TopoJSON features ──────────────────────────────────────────────────
  const [worldFeatures, setWorldFeatures] = useState(null);
  const [usFeatures, setUsFeatures] = useState(null);
  const [geoLoading, setGeoLoading] = useState(true);

  useEffect(() => {
    fetch(WORLD_GEO_URL)
      .then((r) => r.json())
      .then((topo) => {
        setWorldFeatures(feature(topo, topo.objects.countries).features);
      })
      .finally(() => setGeoLoading(false));
  }, []);

  const loadUsGeo = () => {
    if (usFeatures) return;
    fetch(US_GEO_URL)
      .then((r) => r.json())
      .then((topo) => setUsFeatures(feature(topo, topo.objects.states).features));
  };

  // ── Projections ────────────────────────────────────────────────────────
  const worldPath = useMemo(() => {
    const proj = geoEqualEarth()
      .scale(153)
      .translate([W_W / 2, W_H / 2 + 20]);
    return geoPath(proj);
  }, []);

  const usPath = useMemo(() => {
    if (!usFeatures) return null;
    const collection = { type: 'FeatureCollection', features: usFeatures };
    const proj = geoAlbersUsa().fitSize([US_W, US_H], collection);
    return geoPath(proj);
  }, [usFeatures]);

  // ── Countries (GET /countries) ─────────────────────────────────────────
  const [countryIsoCodes, setCountryIsoCodes] = useState(new Set());
  const [isoToName, setIsoToName] = useState({});
  const [totalCountries, setTotalCountries] = useState(0);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);

  useEffect(() => {
    getCountries()
      .then((data) => {
        const raw = data.countries || {};
        const codes = new Set();
        const nameMap = {};
        Object.values(raw).forEach((c) => {
          if (c.iso_code) {
            codes.add(c.iso_code);
            nameMap[c.iso_code] = c.name;
          }
        });
        setCountryIsoCodes(codes);
        setIsoToName(nameMap);
        setTotalCountries(Object.keys(raw).length);
      })
      .catch((err) => setCountriesError(err.message))
      .finally(() => setCountriesLoading(false));
  }, []);

  // ── States (GET /states) ───────────────────────────────────────────────
  const [stateNames, setStateNames] = useState(new Set());
  const [stateNameToCode, setStateNameToCode] = useState({});
  const [stateCapitals, setStateCapitals] = useState({});
  const [totalStates, setTotalStates] = useState(0);
  const [statesLoaded, setStatesLoaded] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);

  const loadStates = () => {
    if (statesLoaded || statesLoading) return;
    setStatesLoading(true);
    getStates()
      .then((data) => {
        const raw = data.states || {};
        const names = new Set();
        const nameToCode = {};
        const capitals = {};
        Object.entries(raw).forEach(([name, s]) => {
          names.add(name);
          nameToCode[name] = s.state_code;
          capitals[name] = s.capital || '';
        });
        setStateNames(names);
        setStateNameToCode(nameToCode);
        setStateCapitals(capitals);
        setTotalStates(Object.keys(raw).length);
        setStatesLoaded(true);
      })
      .catch(() => {})
      .finally(() => setStatesLoading(false));
  };

  // ── Cities (GET /cities/search) ────────────────────────────────────────
  const [selectedStates, setSelectedStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityStateCode, setCityStateCode] = useState({});
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState(null);

  const loadCitiesForStates = useCallback((stateNameSet) => {
    const entries = [...stateNameSet]
      .map((n) => ({ name: n, code: stateNameToCode[n], capital: stateCapitals[n] || '' }))
      .filter((e) => e.code);
    setSelectedStates(entries);
    setCities([]);
    setCityStateCode({});
    setCitiesError(null);
    if (entries.length === 0) { setCitiesLoading(false); return; }
    setCitiesLoading(true);
    Promise.all(entries.map((e) => searchCities({ state_code: e.code }).then((d) => ({ code: e.code, cities: d.cities || {} }))))
      .then((results) => {
        const merged = new Set();
        const codeMap = {};
        results.forEach(({ code, cities: raw }) => {
          Object.keys(raw).forEach((c) => { merged.add(c); codeMap[c] = code; });
        });
        setCities([...merged].sort());
        setCityStateCode(codeMap);
      })
      .catch((err) => setCitiesError(err.message))
      .finally(() => setCitiesLoading(false));
  }, [stateNameToCode, stateCapitals]);

  // ── Journals (GET /journals) — raw list + date filter + aggregation ─────
  const [rawJournals, setRawJournals] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  const [, bumpAuthRead] = useState(0);
  const isLoggedIn = !!getStoredToken();

  useEffect(() => {
    const onFocus = () => bumpAuthRead((n) => n + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const refreshJournalCounts = useCallback(() => {
    if (!getStoredToken()) {
      void Promise.resolve().then(() => {
        setRawJournals([]);
      });
      return;
    }
    getJournals()
      .then((data) => {
        setRawJournals(data.journals || []);
      })
      .catch((err) => {
        if (err.status === 401) {
          localStorage.removeItem('token');
          setRawJournals([]);
        }
      });
  }, []);

  useEffect(() => {
    if (!cityFromUrl) return;

    setView('us');
    setGeoFilterCountry('US');
    loadStates();
    loadUsGeo();
    setSelectedCity(cityFromUrl);
    setGeoFilterCities(new Set([cityFromUrl]));
  }, [cityFromUrl]);
  
  useEffect(() => {
    refreshJournalCounts();
  }, [refreshJournalCounts]);

  // ── Location filter (country / states / cities) — narrows journals + syncs with map ──
  const [geoFilterCountry, setGeoFilterCountry] = useState('');
  const [geoFilterStateNames, setGeoFilterStateNames] = useState(new Set());
  const [geoFilterCities, setGeoFilterCities] = useState(new Set());

  const locationFilterActive = hasLocationFilter(
    geoFilterCountry,
    geoFilterStateNames,
    geoFilterCities,
  );

  const filteredJournals = useMemo(() => {
    const dateFiltered = rawJournals.filter((j) =>
      journalMatchesDateRange(j, dateFrom, dateTo),
    );
    return filterJournalsByLocation(
      dateFiltered,
      {
        countryIso: geoFilterCountry,
        stateNames: geoFilterStateNames,
        cityNames: geoFilterCities,
      },
      stateNameToCode,
    );
  }, [
    rawJournals,
    dateFrom,
    dateTo,
    geoFilterCountry,
    geoFilterStateNames,
    geoFilterCities,
    stateNameToCode,
  ]);

  const journalCounts = useMemo(() => {
    const byCity = {};
    const byState = {};
    const byCountry = {};
    filteredJournals.forEach((j) => {
      if (j.location_name) byCity[j.location_name] = (byCity[j.location_name] || 0) + 1;
      if (j.state_code) byState[j.state_code] = (byState[j.state_code] || 0) + 1;
      if (j.iso_code) byCountry[j.iso_code] = (byCountry[j.iso_code] || 0) + 1;
    });
    return { byCity, byState, byCountry };
  }, [filteredJournals]);

  // Heatmap counts: date-filtered only (ignores location filter so all
  // states/countries keep their shading when one is selected).
  const heatmapCounts = useMemo(() => {
    const dateOnly = rawJournals.filter((j) =>
      journalMatchesDateRange(j, dateFrom, dateTo),
    );
    const byState = {};
    const byCountry = {};
    dateOnly.forEach((j) => {
      if (j.state_code) byState[j.state_code] = (byState[j.state_code] || 0) + 1;
      if (j.iso_code) byCountry[j.iso_code] = (byCountry[j.iso_code] || 0) + 1;
    });
    return { byState, byCountry };
  }, [rawJournals, dateFrom, dateTo]);

  // ── Tooltip ────────────────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  const showTooltip = (text, e) =>
    setTooltip({ visible: true, text, x: e.clientX, y: e.clientY });
  const moveTooltip = (e) =>
    setTooltip((prev) => (prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev));
  const hideTooltip = () =>
    setTooltip({ visible: false, text: '', x: 0, y: 0 });

  // ── Hover state ────────────────────────────────────────────────────────
  const [hoveredId, setHoveredId] = useState(null);

  const handleCountryClick = (geo) => {
    const alpha2 = NUMERIC_TO_ALPHA2[geo.id];
    if (alpha2 === 'US') {
      setGeoFilterCountry('US');
      setGeoFilterStateNames(new Set());
      setGeoFilterCities(new Set());
      setSelectedCity(null);
      setView('us');
      loadStates();
      loadUsGeo();
    }
  };

  const handleStateClick = (geo) => {
    const name = geo.properties.name;
    if (stateNames.has(name)) {
      setGeoFilterStateNames((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        loadCitiesForStates(next);
        return next;
      });
      setGeoFilterCities(new Set());
      setSelectedCity(null);
    }
  };

  const handleCityClick = (cityName) => {
    setSelectedCity(cityName);
    setGeoFilterCities((prev) => {
      const next = new Set(prev);
      if (next.has(cityName)) next.delete(cityName);
      else next.add(cityName);
      return next;
    });
  };

  const clearLocationFilters = useCallback(() => {
    setGeoFilterCountry('');
    setGeoFilterStateNames(new Set());
    setGeoFilterCities(new Set());
    setSelectedStates([]);
    setSelectedCity(null);
    setCities([]);
    setCityStateCode({});
    setView('world');
  }, []);

  const resetAllFilters = useCallback(() => {
    setDateFrom('');
    setDateTo('');
    clearLocationFilters();
  }, [clearLocationFilters]);

  const sortedCountryOptions = useMemo(
    () =>
      Object.entries(isoToName)
        .filter(([iso]) => iso)
        .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: 'base' })),
    [isoToName],
  );

  const sortedStateNames = useMemo(
    () => [...stateNames].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    [stateNames],
  );

  const onLocationCountryChange = (iso) => {
    setGeoFilterCountry(iso);
    setGeoFilterStateNames(new Set());
    setGeoFilterCities(new Set());
    setSelectedStates([]);
    setSelectedCity(null);
    setCities([]);
    setCityStateCode({});
    if (iso === 'US') {
      setView('us');
      loadStates();
      loadUsGeo();
    } else {
      setView('world');
    }
  };

  const toggleFilterState = (stateName) => {
    setGeoFilterStateNames((prev) => {
      const next = new Set(prev);
      if (next.has(stateName)) next.delete(stateName);
      else next.add(stateName);
      loadCitiesForStates(next);
      return next;
    });
    setGeoFilterCities(new Set());
    setSelectedCity(null);
  };

  const toggleFilterCity = (cityName) => {
    setGeoFilterCities((prev) => {
      const next = new Set(prev);
      if (next.has(cityName)) next.delete(cityName);
      else next.add(cityName);
      return next;
    });
    setSelectedCity(cityName || null);
  };

  const isLoading = geoLoading || countriesLoading || statesLoading;

  // ── Total journal count for the legend (respects date filter) ───────────
  const totalJournals = Object.values(journalCounts.byCity).reduce((a, b) => a + b, 0);
  const dateFilterActive = hasJournalDateFilter(dateFrom, dateTo);
  const anyFilterActive = dateFilterActive || locationFilterActive;
  const filterHint =
    [dateFilterActive && 'date', locationFilterActive && 'location'].filter(Boolean).join(' · ') ||
    null;

  return (
    <div className="w-full flex flex-col" style={{ height: 'calc(100vh - 72px)' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-sand-200 bg-white shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-ocean-900">
              {view === 'world' ? 'Geographic Explorer' : 'United States'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {view === 'world'
                ? 'Countries highlighted in blue exist in the database. Click the USA to explore states.'
                : 'Green states exist in the database. Click any green state to see its cities.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {anyFilterActive && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="border-2 border-coral-500 text-coral-600 hover:bg-coral-500 hover:text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-1.5"
                title="Clear visit-date range and country/state/city filters"
              >
                Reset all filters
              </button>
            )}
            {view === 'us' && (
              <button
                type="button"
                onClick={clearLocationFilters}
                className="border-2 border-earth-600 text-earth-600 hover:bg-earth-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-1.5"
              >
                ← World Map
              </button>
            )}
          </div>
        </div>

        {/* Visit date filter — own row so it stays visible (works when logged in; sign-in hint otherwise) */}
        <div
          className={`mt-3 flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border px-3 py-2.5 text-xs ${
            isLoggedIn
              ? 'border-ocean-200 bg-ocean-50/60 text-neutral-700'
              : 'border-sand-200 bg-sand-50 text-neutral-500'
          }`}
        >
          <span className="font-semibold text-ocean-900 whitespace-nowrap">Filter by visit date</span>
          {!isLoggedIn && (
            <span className="text-neutral-500">
              — log in to load your journals; date range still applies once you do.
            </span>
          )}
          <label className="flex items-center gap-1.5">
            <span className="text-neutral-500 shrink-0">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-sand-200 rounded-md px-2 py-1.5 text-neutral-800 bg-white text-xs min-h-8"
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-neutral-500 shrink-0">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-sand-200 rounded-md px-2 py-1.5 text-neutral-800 bg-white text-xs min-h-8"
            />
          </label>
          {isLoggedIn && dateFilterActive && (
            <button
              type="button"
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-ocean-700 hover:text-ocean-900 font-semibold px-2 py-1 rounded-md hover:bg-white/80"
            >
              Clear dates
            </button>
          )}
        </div>

        {/* Location filter — country / states / cities */}
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border border-forest-200 bg-forest-50/50 px-3 py-2.5 text-xs text-neutral-700">
          <span className="font-semibold text-forest-900 whitespace-nowrap">Filter by location</span>
          <label className="flex items-center gap-1.5">
            <span className="text-neutral-500 shrink-0">Country</span>
            <select
              value={geoFilterCountry}
              onChange={(e) => onLocationCountryChange(e.target.value)}
              disabled={countriesLoading}
              className="border border-sand-200 rounded-md px-2 py-1.5 text-neutral-800 bg-white text-xs min-h-8 max-w-44 sm:max-w-56 disabled:opacity-50"
            >
              <option value="">All countries</option>
              {sortedCountryOptions.map(([iso, name]) => (
                <option key={iso} value={iso}>
                  {name} ({iso})
                </option>
              ))}
            </select>
          </label>

          {/* Multi-select state picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 shrink-0">States</span>
            <select
              value=""
              onChange={(e) => { if (e.target.value) toggleFilterState(e.target.value); }}
              disabled={view !== 'us' || !statesLoaded || statesLoading}
              className="border border-sand-200 rounded-md px-2 py-1.5 text-neutral-800 bg-white text-xs min-h-8 max-w-44 sm:max-w-56 disabled:opacity-50"
              title={view !== 'us' ? 'Open the United States map to choose states' : undefined}
            >
              <option value="">{geoFilterStateNames.size ? 'Add state…' : 'All states'}</option>
              {sortedStateNames
                .filter((n) => !geoFilterStateNames.has(n))
                .map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
            </select>
          </div>
          {geoFilterStateNames.size > 0 && (
            <div className="flex flex-wrap gap-1">
              {[...geoFilterStateNames].sort().map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 bg-forest-100 text-forest-800 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => toggleFilterState(name)}
                    className="text-forest-600 hover:text-forest-900 leading-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Multi-select city picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 shrink-0">Cities</span>
            <select
              value=""
              onChange={(e) => { if (e.target.value) toggleFilterCity(e.target.value); }}
              disabled={selectedStates.length === 0 || citiesLoading}
              className="border border-sand-200 rounded-md px-2 py-1.5 text-neutral-800 bg-white text-xs min-h-8 max-w-44 sm:max-w-64 disabled:opacity-50"
              title={selectedStates.length === 0 ? 'Choose a state first' : undefined}
            >
              <option value="">{geoFilterCities.size ? 'Add city…' : 'All cities'}</option>
              {cities
                .filter((n) => !geoFilterCities.has(n))
                .map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
            </select>
          </div>
          {geoFilterCities.size > 0 && (
            <div className="flex flex-wrap gap-1">
              {[...geoFilterCities].sort().map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 bg-ocean-100 text-ocean-800 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => toggleFilterCity(name)}
                    className="text-ocean-600 hover:text-ocean-900 leading-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {locationFilterActive && (
            <button
              type="button"
              onClick={clearLocationFilters}
              className="text-forest-800 hover:text-forest-950 font-semibold px-2 py-1 rounded-md hover:bg-white/80"
            >
              Clear location
            </button>
          )}
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>

        {/* Map canvas */}
        <div
          className="flex-1 relative bg-ocean-50 overflow-hidden"
          onMouseMove={moveTooltip}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-ocean-50/80 z-10">
              <div className="bg-white rounded-xl border border-sand-200 px-5 py-3 shadow-sm">
                <p className="text-sm text-ocean-600 font-medium">
                  {countriesLoading || geoLoading ? 'Loading countries…' : 'Loading states…'}
                </p>
              </div>
            </div>
          )}

          {countriesError && !countriesLoading && (
            <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-2 bg-coral-400/10 border border-coral-400/20 rounded-lg p-3">
              <span className="text-coral-600">✕</span>
              <p className="text-xs text-coral-600">Could not load countries: {countriesError}</p>
            </div>
          )}

          {/* World SVG */}
          {view === 'world' && worldFeatures && (
            <WorldMap
              features={worldFeatures}
              path={worldPath}
              countryIsoCodes={countryIsoCodes}
              isoToName={isoToName}
              journalCounts={journalCounts.byCountry}
              heatmapCounts={heatmapCounts.byCountry}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onLeave={() => setHoveredId(null)}
              onShowTooltip={showTooltip}
              onHideTooltip={hideTooltip}
              onCountryClick={handleCountryClick}
            />
          )}

          {/* US States SVG */}
          {view === 'us' && usFeatures && usPath && (
            <USMap
              features={usFeatures}
              path={usPath}
              stateNames={stateNames}
              stateCapitals={stateCapitals}
              stateNameToCode={stateNameToCode}
              journalCounts={journalCounts.byState}
              heatmapCounts={heatmapCounts.byState}
              selectedStateNames={geoFilterStateNames}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onLeave={() => setHoveredId(null)}
              onShowTooltip={showTooltip}
              onHideTooltip={hideTooltip}
              onStateClick={handleStateClick}
            />
          )}

          {view === 'us' && (!usFeatures || !usPath) && !statesLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-xl border border-sand-200 px-5 py-3 shadow-sm">
                <p className="text-sm text-ocean-600 font-medium">Loading US map…</p>
              </div>
            </div>
          )}

          {tooltip.visible && (
            <div
              className="fixed z-50 bg-ocean-900 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none shadow-lg whitespace-nowrap"
              style={{ left: tooltip.x + 14, top: tooltip.y - 40 }}
            >
              {tooltip.text}
            </div>
          )}
        </div>

        {/* ── State sidebar ────────────────────────────────────────────── */}
        {view === 'us' && selectedStates.length > 0 && (
          <StateSidebar
            selectedStates={selectedStates}
            cities={cities}
            citiesLoading={citiesLoading}
            citiesError={citiesError}
            journalCounts={journalCounts.byCity}
            onClose={() => {
              setGeoFilterStateNames(new Set());
              setGeoFilterCities(new Set());
              setSelectedStates([]);
              setSelectedCity(null);
              setCities([]);
              setCityStateCode({});
            }}
            onCityClick={handleCityClick}
          />
        )}

        {/* ── Journal panel (appears when a city is clicked) ───────────── */}
        {view === 'us' && selectedCity && (
          <JournalPanel
            city={selectedCity}
            stateCode={cityStateCode[selectedCity] || selectedStates[0]?.code || ''}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onClose={() => {
              setSelectedCity(null);
            }}
            onJournalAdded={refreshJournalCounts}
          />
        )}
      </div>

      {/* ── Legend footer ──────────────────────────────────────────────── */}
      <div className="px-6 py-2.5 border-t border-sand-200 bg-white flex items-center gap-5 flex-wrap text-xs shrink-0">
        {view === 'world' ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-sand-200" />
              <span className="text-neutral-600">Not in database</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: COLOR.countryUSA }} />
              <span className="text-neutral-600">USA — click to drill in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-3.5 rounded-sm overflow-hidden">
                {COUNTRY_HEAT.map((c) => (
                  <div key={c} className="w-3.5" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-neutral-600">
                In database ({totalCountries}) — darker = more journals
              </span>
            </div>
            {isLoggedIn && totalJournals > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLOR.badge }} />
                <span className="text-neutral-600">
                  My journals ({totalJournals})
                  {filterHint && ` · ${filterHint}`}
                </span>
              </div>
            )}
            <span className="ml-auto text-xs bg-ocean-50 text-ocean-600 px-3 py-1 rounded-full font-medium">
              Endpoint: GET /countries
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: COLOR.stateOut }} />
              <span className="text-neutral-600">Not in database</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-3.5 rounded-sm overflow-hidden">
                {STATE_HEAT.map((c, i) => (
                  <div key={i} className="w-3.5" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-neutral-600">
                0 → many journals ({totalStates} states)
              </span>
            </div>
            {geoFilterStateNames.size > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: STATE_SELECTED }} />
                <span className="text-neutral-600">Selected state</span>
              </div>
            )}
            {isLoggedIn && totalJournals > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLOR.badge }} />
                <span className="text-neutral-600">
                  My journals ({totalJournals})
                  {filterHint && ` · ${filterHint}`}
                </span>
              </div>
            )}
            <span className="ml-auto text-xs bg-forest-50 text-forest-600 px-3 py-1 rounded-full font-medium">
              Endpoint: GET /states · GET /cities/search · GET /journals
            </span>
          </>
        )}
      </div>
    </div>
  );
}
