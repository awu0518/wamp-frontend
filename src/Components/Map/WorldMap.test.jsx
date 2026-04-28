import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { geoEqualEarth, geoPath } from 'd3-geo';
import WorldMap from './WorldMap';

const features = [
  {
    type: 'Feature',
    id: 840,
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-20, -10],
        [20, -10],
        [20, 10],
        [-20, 10],
        [-20, -10],
      ]],
    },
  },
];

const path = geoPath(
  geoEqualEarth()
    .scale(153)
    .translate([800 / 2, 460 / 2 + 20]),
);

const baseProps = {
  features,
  path,
  countryIsoCodes: new Set(['US']),
  isoToName: { US: 'United States' },
  journalCounts: {},
  heatmapCounts: {},
  hoveredId: null,
  onHover: vi.fn(),
  onLeave: vi.fn(),
  onShowTooltip: vi.fn(),
  onHideTooltip: vi.fn(),
  onCountryClick: vi.fn(),
};

describe('WorldMap city marker clusters', () => {
  it('renders world map paths normally without city markers', () => {
    const { container } = render(<WorldMap {...baseProps} cityMarkers={[]} />);
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('clusters nearby city markers and shows aggregated count', () => {
    render(
      <WorldMap
        {...baseProps}
        cityMarkers={[
          { id: 'a', name: 'Austin', lat: 30.2672, lon: -97.7431, count: 1 },
          { id: 'b', name: 'Round Rock', lat: 30.5083, lon: -97.6789, count: 2 },
        ]}
      />,
    );

    // Two nearby markers should land in one grid cluster (1 + 2).
    const clusterCount = screen.getByText('3');
    expect(clusterCount).toBeInTheDocument();
  });

  it('fires tooltip callback on cluster hover', () => {
    const onShowTooltip = vi.fn();
    render(
      <WorldMap
        {...baseProps}
        onShowTooltip={onShowTooltip}
        cityMarkers={[
          { id: 'a', name: 'Austin', lat: 30.2672, lon: -97.7431, count: 1 },
        ]}
      />,
    );

    const clusterLabel = screen.getByText('1');
    const clusterGroup = clusterLabel.closest('g');
    expect(clusterGroup).toBeTruthy();
    fireEvent.mouseEnter(clusterGroup);

    expect(onShowTooltip).toHaveBeenCalledTimes(1);
    expect(onShowTooltip.mock.calls[0][0]).toContain('1 journal');
  });
});
