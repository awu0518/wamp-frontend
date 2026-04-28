import { useMemo } from 'react';
import { W_W, W_H, COLOR, NUMERIC_TO_ALPHA2, COUNTRY_HEAT, COUNTRY_HEAT_HOV, heatColor } from './mapConstants';

export default function WorldMap({
  features,
  path,
  countryIsoCodes,
  isoToName,
  journalCounts,
  heatmapCounts,
  cityMarkers = [],
  hoveredId,
  onHover,
  onLeave,
  onShowTooltip,
  onHideTooltip,
  onCountryClick,
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

  const clusteredMarkers = useMemo(() => {
    if (!path || !cityMarkers.length) return [];
    const projection = path.projection && path.projection();
    if (!projection) return [];

    const gridSize = 26;
    const clusters = new Map();

    cityMarkers.forEach((marker) => {
      const p = projection([marker.lon, marker.lat]);
      if (!p || !isFinite(p[0]) || !isFinite(p[1])) return;
      const [x, y] = p;
      if (x < 0 || x > W_W || y < 0 || y > W_H) return;
      const cellX = Math.floor(x / gridSize);
      const cellY = Math.floor(y / gridSize);
      const key = `${cellX}|${cellY}`;
      const existing = clusters.get(key);
      if (existing) {
        existing.points += 1;
        existing.count += marker.count;
        existing.x = (existing.x * (existing.points - 1) + x) / existing.points;
        existing.y = (existing.y * (existing.points - 1) + y) / existing.points;
        if (existing.samples.length < 3) existing.samples.push(marker.name);
        return;
      }
      clusters.set(key, {
        id: key,
        x,
        y,
        points: 1,
        count: marker.count,
        samples: [marker.name],
      });
    });

    return [...clusters.values()].sort((a, b) => b.count - a.count);
  }, [cityMarkers, path]);

  const getFill = (geo) => {
    const alpha2 = NUMERIC_TO_ALPHA2[geo.id];
    const hovered = hoveredId === geo.id;
    if (!alpha2) return hovered ? COLOR.countryOutHov : COLOR.countryOut;
    if (alpha2 === 'US') return hovered ? COLOR.countryUSAHov : COLOR.countryUSA;
    if (!countryIsoCodes.has(alpha2))
      return hovered ? COLOR.countryOutHov : COLOR.countryOut;
    const count = heat[alpha2] || 0;
    const scale = hovered ? COUNTRY_HEAT_HOV : COUNTRY_HEAT;
    return heatColor(scale, count, maxJournals);
  };

  if (!features) return null;

  return (
    <svg
      viewBox={`0 0 ${W_W} ${W_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect width={W_W} height={W_H} fill="#EBF5FB" />

      {features.map((geo, idx) => {
        const alpha2 = NUMERIC_TO_ALPHA2[geo.id];
        const inDB = alpha2 && countryIsoCodes.has(alpha2);
        const isUSA = alpha2 === 'US';
        const count = journalCounts[alpha2] || 0;
        const tooltipParts = [];
        if (alpha2) tooltipParts.push(isoToName[alpha2] || alpha2);
        if (isUSA) tooltipParts.push('click to explore states');
        if (count > 0) tooltipParts.push(`${count} journal${count > 1 ? 's' : ''}`);
        const tip = tooltipParts.join(' · ');

        return (
          <path
            key={geo.id ?? `${alpha2 ?? 'na'}-${idx}`}
            d={path(geo)}
            fill={getFill(geo)}
            stroke={COLOR.stroke}
            strokeWidth={0.4}
            style={{ cursor: (inDB || isUSA) ? 'pointer' : 'default' }}
            onMouseEnter={(e) => {
              onHover(geo.id);
              if (tip) onShowTooltip(tip, e);
            }}
            onMouseLeave={() => { onLeave(); onHideTooltip(); }}
            onClick={() => onCountryClick(geo)}
          />
        );
      })}

      {/* Clustered city markers from journal coordinates (if available) */}
      {clusteredMarkers.map((cluster) => {
        const markerScale = Math.min(Math.max(cluster.count, 1), 40);
        const r = 4 + Math.log(markerScale + 1) * 2.2;
        const sampleText = cluster.samples.join(', ');
        const tooltip =
          `${cluster.count} journal${cluster.count > 1 ? 's' : ''} · ` +
          `${cluster.points} cit${cluster.points > 1 ? 'ies' : 'y'} · ${sampleText}`;
        return (
          <g
            key={`cm-${cluster.id}`}
            transform={`translate(${cluster.x},${cluster.y})`}
            style={{ cursor: 'default' }}
            onMouseEnter={(e) => onShowTooltip(tooltip, e)}
            onMouseLeave={onHideTooltip}
          >
            <circle r={r + 1.2} fill="#FFFFFF" fillOpacity={0.9} />
            <circle r={r} fill="#14506E" fillOpacity={0.82} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={cluster.count > 99 ? 7 : 8}
              fontWeight="700"
              fill="#FFFFFF"
            >
              {cluster.count > 999 ? '999+' : cluster.count}
            </text>
          </g>
        );
      })}

      {/* Journal count badges at country centroids */}
      {features.map((geo, idx) => {
        const alpha2 = NUMERIC_TO_ALPHA2[geo.id];
        const count = alpha2 ? (journalCounts[alpha2] || 0) : 0;
        if (!count) return null;
        const c = centroids[geo.id];
        if (!c) return null;
        const r = count > 99 ? 10 : 8;
        return (
          <g
            key={`jb-${geo.id ?? `${alpha2 ?? 'na'}-${idx}`}`}
            transform={`translate(${c[0]},${c[1]})`}
            style={{ pointerEvents: 'none' }}
          >
            <circle r={r} fill={COLOR.badge} stroke={COLOR.badgeStroke} strokeWidth={1.2} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={count > 99 ? 7 : 8}
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
