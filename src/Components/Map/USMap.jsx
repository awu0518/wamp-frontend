import { useMemo } from 'react';
import { US_W, US_H, COLOR, STATE_HEAT, STATE_HEAT_HOV, STATE_SELECTED, STATE_SELECTED_HOV, heatColor } from './mapConstants';

export default function USMap({
  features,
  path,
  stateNames,
  stateCapitals,
  stateNameToCode,
  journalCounts,
  heatmapCounts,
  selectedStateName,
  hoveredId,
  onHover,
  onLeave,
  onShowTooltip,
  onHideTooltip,
  onStateClick,
}) {
  const centroids = useMemo(() => {
    if (!features || !path) return {};
    const map = {};
    features.forEach((geo) => {
      const c = path.centroid(geo);
      if (c && isFinite(c[0]) && isFinite(c[1])) map[geo.id] = c;
    });
    return map;
  }, [features, path]);

  const heat = heatmapCounts || journalCounts;
  const maxJournals = useMemo(() => {
    const vals = Object.values(heat);
    return vals.length ? Math.max(...vals) : 0;
  }, [heat]);

  const getFill = (geo) => {
    const name = geo.properties.name;
    const inDB = stateNames.has(name);
    const hovered = hoveredId === geo.id;
    if (!inDB) return hovered ? COLOR.stateOutHov : COLOR.stateOut;
    if (selectedStateName === name) return hovered ? STATE_SELECTED_HOV : STATE_SELECTED;
    const code = stateNameToCode[name];
    const count = code ? (heat[code] || 0) : 0;
    const scale = hovered ? STATE_HEAT_HOV : STATE_HEAT;
    return heatColor(scale, count, maxJournals);
  };

  if (!features || !path) return null;

  return (
    <svg
      viewBox={`0 0 ${US_W} ${US_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect width={US_W} height={US_H} fill="#EBF5FB" />

      {features.map((geo) => {
        const name = geo.properties.name;
        const inDB = stateNames.has(name);
        const code = stateNameToCode[name];
        const capital = stateCapitals[name];
        const count = code ? (journalCounts[code] || 0) : 0;

        const tipParts = [name];
        if (capital) tipParts.push(`Capital: ${capital}`);
        if (count > 0) tipParts.push(`${count} journal${count > 1 ? 's' : ''}`);
        if (!inDB) tipParts.push('(not in DB)');

        return (
          <path
            key={geo.id}
            d={path(geo)}
            fill={getFill(geo)}
            stroke={COLOR.stroke}
            strokeWidth={0.8}
            style={{ cursor: inDB ? 'pointer' : 'default' }}
            onMouseEnter={(e) => {
              onHover(geo.id);
              onShowTooltip(tipParts.join(' · '), e);
            }}
            onMouseLeave={() => { onLeave(); onHideTooltip(); }}
            onClick={() => onStateClick(geo)}
          />
        );
      })}

      {/* Journal count badges at state centroids */}
      {features.map((geo) => {
        const code = stateNameToCode[geo.properties.name];
        const count = code ? (journalCounts[code] || 0) : 0;
        if (!count) return null;
        const c = centroids[geo.id];
        if (!c) return null;
        const r = count > 99 ? 12 : 10;
        return (
          <g key={`jb-${geo.id}`} transform={`translate(${c[0]},${c[1]})`} style={{ pointerEvents: 'none' }}>
            <circle r={r} fill={COLOR.badge} stroke={COLOR.badgeStroke} strokeWidth={1.5} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={count > 99 ? 9 : 10}
              fontWeight="700"
              fill={COLOR.badgeText}
            >
              {count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
