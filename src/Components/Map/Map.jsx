import { useState, useEffect, useMemo } from 'react';
import { geoEqualEarth, geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { getCountries, getStates, searchCities } from '../../services/api';

const WORLD_GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const US_GEO_URL =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// World map SVG viewport
const W_W = 800;
const W_H = 460;

// US map SVG viewport
const US_W = 960;
const US_H = 600;

// ISO 3166-1 numeric → alpha-2 mapping.
// World-atlas encodes each country feature with a numeric id (e.g. 840 = US).
// We compare these against the iso_code values returned by GET /countries.
const NUMERIC_TO_ALPHA2 = {
  4:'AF',8:'AL',12:'DZ',20:'AD',24:'AO',28:'AG',31:'AZ',32:'AR',
  36:'AU',40:'AT',44:'BS',48:'BH',50:'BD',51:'AM',52:'BB',56:'BE',
  64:'BT',68:'BO',70:'BA',72:'BW',76:'BR',84:'BZ',90:'SB',96:'BN',
  100:'BG',104:'MM',108:'BI',112:'BY',116:'KH',120:'CM',124:'CA',
  132:'CV',140:'CF',144:'LK',148:'TD',152:'CL',156:'CN',170:'CO',
  174:'KM',178:'CG',180:'CD',188:'CR',191:'HR',192:'CU',196:'CY',
  203:'CZ',204:'BJ',208:'DK',212:'DM',214:'DO',218:'EC',222:'SV',
  226:'GQ',231:'ET',232:'ER',233:'EE',238:'FK',242:'FJ',246:'FI',
  250:'FR',262:'DJ',266:'GA',268:'GE',270:'GM',276:'DE',288:'GH',
  296:'KI',300:'GR',304:'GL',308:'GD',320:'GT',324:'GN',328:'GY',
  332:'HT',340:'HN',344:'HK',348:'HU',352:'IS',356:'IN',360:'ID',
  364:'IR',368:'IQ',372:'IE',376:'IL',380:'IT',384:'CI',388:'JM',
  392:'JP',398:'KZ',400:'JO',404:'KE',408:'KP',410:'KR',414:'KW',
  417:'KG',418:'LA',422:'LB',426:'LS',428:'LV',430:'LR',434:'LY',
  438:'LI',440:'LT',442:'LU',446:'MO',450:'MG',454:'MW',458:'MY',
  462:'MV',466:'ML',470:'MT',478:'MR',480:'MU',484:'MX',492:'MC',
  496:'MN',498:'MD',499:'ME',504:'MA',508:'MZ',512:'OM',516:'NA',
  520:'NR',524:'NP',528:'NL',531:'CW',534:'SX',540:'NC',548:'VU',
  554:'NZ',558:'NI',562:'NE',566:'NG',578:'NO',583:'FM',584:'MH',
  585:'PW',586:'PK',591:'PA',598:'PG',600:'PY',604:'PE',608:'PH',
  616:'PL',620:'PT',624:'GW',626:'TL',634:'QA',642:'RO',643:'RU',
  646:'RW',659:'KN',662:'LC',670:'VC',674:'SM',678:'ST',682:'SA',
  686:'SN',688:'RS',690:'SC',694:'SL',702:'SG',703:'SK',704:'VN',
  705:'SI',706:'SO',710:'ZA',716:'ZW',724:'ES',728:'SS',729:'SD',
  740:'SR',748:'SZ',752:'SE',756:'CH',760:'SY',762:'TJ',764:'TH',
  768:'TG',776:'TO',780:'TT',784:'AE',788:'TN',792:'TR',795:'TM',
  800:'UG',804:'UA',807:'MK',818:'EG',826:'GB',840:'US',854:'BF',
  858:'UY',860:'UZ',862:'VE',882:'WS',887:'YE',894:'ZM',
};

// ─── Color tokens (matching index.css design system) ───────────────────────
const COLOR = {
  countryIn:     '#2478A0', // ocean-600
  countryInHov:  '#0B3345', // ocean-900
  countryUSA:    '#14506E', // ocean-800  (USA stands out to invite click)
  countryUSAHov: '#0B3345', // ocean-900
  countryOut:    '#E8D9C0', // sand-200
  countryOutHov: '#D4BF9A', // sand-300
  stateIn:       '#3D7A50', // forest-600
  stateInHov:    '#2A5738', // forest-800
  stateOut:      '#D4E8D9', // forest-100
  stateOutHov:   '#B09468', // sand-500
  stroke:        '#FFFFFF',
};

export default function Map() {
  const [view, setView] = useState('world');

  // ── TopoJSON feature arrays (fetched once from CDN) ──────────────────────
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

  // ── d3-geo projections + path generators (memoized) ──────────────────────
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

  // ── Endpoint 1: GET /countries ───────────────────────────────────────────
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

  // ── Endpoint 2: GET /states ──────────────────────────────────────────────
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

  // ── Endpoint 3: GET /cities/search?state_code=XX ─────────────────────────
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

  // ── Tooltip ──────────────────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  const showTooltip = (text, e) =>
    setTooltip({ visible: true, text, x: e.clientX, y: e.clientY });
  const moveTooltip = (e) =>
    setTooltip((prev) => (prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev));
  const hideTooltip = () =>
    setTooltip({ visible: false, text: '', x: 0, y: 0 });

  // ── Hover state (for per-path fill changes without re-fetching) ───────────
  const [hoveredId, setHoveredId] = useState(null);

  // ── Click handlers ────────────────────────────────────────────────────────
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

  // ── Fill helpers ─────────────────────────────────────────────────────────
  const getCountryFill = (geo) => {
    const alpha2 = NUMERIC_TO_ALPHA2[geo.id];
    const hovered = hoveredId === geo.id;
    if (!alpha2) return hovered ? COLOR.countryOutHov : COLOR.countryOut;
    if (alpha2 === 'US') return hovered ? COLOR.countryUSAHov : COLOR.countryUSA;
    if (countryIsoCodes.has(alpha2))
      return hovered ? COLOR.countryInHov : COLOR.countryIn;
    return hovered ? COLOR.countryOutHov : COLOR.countryOut;
  };

  const getStateFill = (geo) => {
    const inDB = stateNames.has(geo.properties.name);
    const hovered = hoveredId === geo.id;
    if (inDB) return hovered ? COLOR.stateInHov : COLOR.stateIn;
    return hovered ? COLOR.stateOutHov : COLOR.stateOut;
  };

  const isLoading = geoLoading || countriesLoading || statesLoading;

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
            onClick={() => { setView('world'); setSelectedState(null); }}
            className="border-2 border-earth-600 text-earth-600 hover:bg-earth-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-1.5 shrink-0"
          >
            ← World Map
          </button>
        )}
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>

        {/* Map canvas */}
        <div
          className="flex-1 relative bg-ocean-50 overflow-hidden"
          onMouseMove={moveTooltip}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-ocean-50/80 z-10">
              <div className="bg-white rounded-xl border border-sand-200 px-5 py-3 shadow-sm">
                <p className="text-sm text-ocean-600 font-medium">
                  {countriesLoading || geoLoading ? 'Loading countries…' : 'Loading states…'}
                </p>
              </div>
            </div>
          )}

          {/* Error banner */}
          {countriesError && !countriesLoading && (
            <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-2 bg-coral-400/10 border border-coral-400/20 rounded-lg p-3">
              <span className="text-coral-600">✕</span>
              <p className="text-xs text-coral-600">Could not load countries: {countriesError}</p>
            </div>
          )}

          {/* ── World SVG map (Endpoint 1) ───────────────────────────── */}
          {view === 'world' && worldFeatures && (
            <svg
              viewBox={`0 0 ${W_W} ${W_H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              {/* Ocean background */}
              <rect width={W_W} height={W_H} fill="#EBF5FB" />
              {worldFeatures.map((geo) => {
                const alpha2 = NUMERIC_TO_ALPHA2[geo.id];
                const inDB = alpha2 && countryIsoCodes.has(alpha2);
                const isUSA = alpha2 === 'US';
                return (
                  <path
                    key={geo.id}
                    d={worldPath(geo)}
                    fill={getCountryFill(geo)}
                    stroke={COLOR.stroke}
                    strokeWidth={0.4}
                    style={{ cursor: (inDB || isUSA) ? 'pointer' : 'default' }}
                    onMouseEnter={(e) => {
                      setHoveredId(geo.id);
                      if (!alpha2) return;
                      const name = isoToName[alpha2] || alpha2;
                      showTooltip(
                        isUSA ? `${name} — click to explore states` : name,
                        e
                      );
                    }}
                    onMouseLeave={() => { setHoveredId(null); hideTooltip(); }}
                    onClick={() => handleCountryClick(geo)}
                  />
                );
              })}
            </svg>
          )}

          {/* ── US States SVG map (Endpoint 2) ──────────────────────── */}
          {view === 'us' && usFeatures && usPath && (
            <svg
              viewBox={`0 0 ${US_W} ${US_H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <rect width={US_W} height={US_H} fill="#EBF5FB" />
              {usFeatures.map((geo) => {
                const inDB = stateNames.has(geo.properties.name);
                return (
                  <path
                    key={geo.id}
                    d={usPath(geo)}
                    fill={getStateFill(geo)}
                    stroke={COLOR.stroke}
                    strokeWidth={0.8}
                    style={{ cursor: inDB ? 'pointer' : 'default' }}
                    onMouseEnter={(e) => {
                      setHoveredId(geo.id);
                      const capital = stateCapitals[geo.properties.name];
                      const label = capital
                        ? `${geo.properties.name} · Capital: ${capital}`
                        : geo.properties.name;
                      showTooltip(
                        inDB ? label : `${geo.properties.name} (not in DB)`,
                        e
                      );
                    }}
                    onMouseLeave={() => { setHoveredId(null); hideTooltip(); }}
                    onClick={() => handleStateClick(geo)}
                  />
                );
              })}
            </svg>
          )}

          {/* US loading state (before geo arrives) */}
          {view === 'us' && (!usFeatures || !usPath) && !statesLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-xl border border-sand-200 px-5 py-3 shadow-sm">
                <p className="text-sm text-ocean-600 font-medium">Loading US map…</p>
              </div>
            </div>
          )}

          {/* Floating tooltip */}
          {tooltip.visible && (
            <div
              className="fixed z-50 bg-ocean-900 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none shadow-lg whitespace-nowrap"
              style={{ left: tooltip.x + 14, top: tooltip.y - 40 }}
            >
              {tooltip.text}
            </div>
          )}
        </div>

        {/* ── Cities sidebar (Endpoint 3) ──────────────────────────────── */}
        {view === 'us' && selectedState && (
          <div className="w-72 border-l border-sand-200 bg-white flex flex-col shrink-0 overflow-hidden">
            <div className="p-5 border-b border-sand-200 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs bg-forest-100 text-forest-800 px-2.5 py-1 rounded-full font-medium">
                    State
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-ocean-900">
                    {selectedState.name}
                  </h3>
                  {selectedState.capital && (
                    <p className="text-sm text-neutral-500 mt-0.5">
                      Capital: {selectedState.capital}
                    </p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    {selectedState.code}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedState(null)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors text-lg leading-none shrink-0 mt-1"
                  aria-label="Close panel"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5" style={{ minHeight: 0 }}>
              <h4 className="text-sm font-semibold text-neutral-800 mb-3">
                Cities in database
                {!citiesLoading && (
                  <span className="ml-1.5 text-xs bg-ocean-50 text-ocean-600 px-2 py-0.5 rounded-full font-medium">
                    {cities.length}
                  </span>
                )}
              </h4>

              {citiesLoading && (
                <div className="flex items-center gap-2 text-sm text-ocean-600">
                  <div className="w-3 h-3 rounded-full border-2 border-ocean-400 border-t-transparent animate-spin" />
                  Loading…
                </div>
              )}

              {citiesError && (
                <div className="flex items-start gap-2 bg-coral-400/10 border border-coral-400/20 rounded-lg p-3">
                  <span className="text-coral-600 text-sm leading-none mt-0.5">✕</span>
                  <p className="text-xs text-coral-600">{citiesError}</p>
                </div>
              )}

              {!citiesLoading && !citiesError && cities.length === 0 && (
                <div className="flex items-start gap-2 bg-sand-100 border border-sand-200 rounded-lg p-3">
                  <span className="text-sand-500 text-sm leading-none mt-0.5">ℹ</span>
                  <p className="text-xs text-sand-500">
                    No cities found for {selectedState.name}.
                  </p>
                </div>
              )}

              {!citiesLoading && cities.length > 0 && (
                <ul className="space-y-1.5">
                  {cities.map((city) => (
                    <li key={city}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sand-50 border border-sand-200 hover:bg-ocean-50 hover:border-ocean-200 transition-colors">
                        <span className="text-xs bg-sand-100 text-earth-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                          City
                        </span>
                        <span className="text-sm text-neutral-800 truncate">{city}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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
            <span className="ml-auto text-xs bg-forest-50 text-forest-600 px-3 py-1 rounded-full font-medium">
              Endpoint: GET /states · GET /cities/search
            </span>
          </>
        )}
      </div>
    </div>
  );
}
