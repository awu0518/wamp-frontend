import { useState, useEffect, useMemo, useCallback } from 'react';
import { geoEqualEarth, geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { getCountries, getStates, searchCities, getJournals } from '../../services/api';
import { COLOR, NUMERIC_TO_ALPHA2 } from './mapConstants';
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
  const [selectedState, setSelectedState] = useState(null);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState(null);

  const loadCities = (stateName) => {
    const code = stateNameToCode[stateName];
    if (!code) return;
    setSelectedState({
      name: stateName,
      code,
      capital: stateCapitals[stateName] || '',
    });
    setSelectedCity(null);
    setCities([]);
    setCitiesError(null);
    setCitiesLoading(true);
    searchCities({ state_code: code })
      .then((data) => {
        const raw = data.cities || {};
        setCities(Object.keys(raw).sort());
      })
      .catch((err) => setCitiesError(err.message))
      .finally(() => setCitiesLoading(false));
  };

  // ── Journal counts (GET /journals) — multi-level aggregation ───────────
  const [journalCounts, setJournalCounts] = useState({
    byCity: {},
    byState: {},
    byCountry: {},
  });
  const [selectedCity, setSelectedCity] = useState(null);

  const refreshJournalCounts = useCallback(() => {
    if (!localStorage.getItem('token')) return;
    getJournals()
      .then((data) => {
        const byCity = {};
        const byState = {};
        const byCountry = {};
        (data.journals || []).forEach((j) => {
          if (j.location_name) byCity[j.location_name] = (byCity[j.location_name] || 0) + 1;
          if (j.state_code) byState[j.state_code] = (byState[j.state_code] || 0) + 1;
          if (j.iso_code) byCountry[j.iso_code] = (byCountry[j.iso_code] || 0) + 1;
        });
        setJournalCounts({ byCity, byState, byCountry });
      })
      .catch((err) => {
        if (err.status === 401) localStorage.removeItem('token');
      });
  }, []);

  useEffect(() => {
    refreshJournalCounts();
  }, [refreshJournalCounts]);

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
      setView('us');
      loadStates();
      loadUsGeo();
    }
  };

  const handleStateClick = (geo) => {
    if (stateNames.has(geo.properties.name)) loadCities(geo.properties.name);
  };

  const handleCityClick = (cityName) => {
    setSelectedCity(cityName);
  };

  const isLoading = geoLoading || countriesLoading || statesLoading;

  // ── Total journal count for the legend ─────────────────────────────────
  const totalJournals = Object.values(journalCounts.byCity).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full flex flex-col" style={{ height: 'calc(100vh - 72px)' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-sand-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-ocean-900">
            {view === 'world' ? 'Geographic Explorer' : 'United States'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {view === 'world'
              ? 'Countries highlighted in blue exist in the database. Click the USA to explore states.'
              : 'Green states exist in the database. Click any green state to see its cities.'}
          </p>
        </div>
        {view === 'us' && (
          <button
            onClick={() => { setView('world'); setSelectedState(null); setSelectedCity(null); }}
            className="border-2 border-earth-600 text-earth-600 hover:bg-earth-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-1.5 shrink-0"
          >
            ← World Map
          </button>
        )}
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
        {view === 'us' && selectedState && (
          <StateSidebar
            selectedState={selectedState}
            cities={cities}
            citiesLoading={citiesLoading}
            citiesError={citiesError}
            journalCounts={journalCounts.byCity}
            onClose={() => { setSelectedState(null); setSelectedCity(null); }}
            onCityClick={handleCityClick}
          />
        )}

        {/* ── Journal panel (appears when a city is clicked) ───────────── */}
        {view === 'us' && selectedState && selectedCity && (
          <JournalPanel
            city={selectedCity}
            stateCode={selectedState.code}
            onClose={() => setSelectedCity(null)}
            onJournalAdded={refreshJournalCounts}
          />
        )}
      </div>

      {/* ── Legend footer ──────────────────────────────────────────────── */}
      <div className="px-6 py-2.5 border-t border-sand-200 bg-white flex items-center gap-5 flex-wrap text-xs shrink-0">
        {view === 'world' ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: COLOR.countryIn }} />
              <span className="text-neutral-600">In database ({totalCountries})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: COLOR.countryUSA }} />
              <span className="text-neutral-600">USA — click to drill in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-sand-200" />
              <span className="text-neutral-600">Not in database</span>
            </div>
            {totalJournals > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLOR.badge }} />
                <span className="text-neutral-600">My journals ({totalJournals})</span>
              </div>
            )}
            <span className="ml-auto text-xs bg-ocean-50 text-ocean-600 px-3 py-1 rounded-full font-medium">
              Endpoint: GET /countries
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: COLOR.stateIn }} />
              <span className="text-neutral-600">In database ({totalStates})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: COLOR.stateOut }} />
              <span className="text-neutral-600">Not in database</span>
            </div>
            {totalJournals > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLOR.badge }} />
                <span className="text-neutral-600">My journals ({totalJournals})</span>
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
