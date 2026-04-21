import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Map from './Map';

/** Minimal valid Topology for topojson-client `feature` (single polygon, id 840 = USA in mapConstants). */
const minimalWorldTopo = {
  type: 'Topology',
  arcs: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
  ],
  objects: {
    countries: {
      type: 'GeometryCollection',
      geometries: [{ type: 'Polygon', id: 840, arcs: [[0]] }],
    },
  },
};

const minimalUsTopo = {
  type: 'Topology',
  arcs: [
    [
      [0, 0],
      [5, 0],
      [5, 5],
      [0, 5],
      [0, 0],
    ],
  ],
  objects: {
    states: {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Polygon', properties: { name: 'Texas' }, arcs: [[0]] },
      ],
    },
  },
};

vi.mock('../../services/api', () => ({
  getCountries: vi.fn(() =>
    Promise.resolve({
      countries: {
        ut: { name: 'Utopia', iso_code: 'UT' },
        us: { name: 'United States', iso_code: 'US' },
      },
    }),
  ),
  getStates: vi.fn(() =>
    Promise.resolve({
      states: {
        Texas: { state_code: 'TX', capital: 'Austin' },
      },
    }),
  ),
  searchCities: vi.fn(() =>
    Promise.resolve({
      cities: {
        Austin: { name: 'Austin', state_code: 'TX' },
        Dallas: { name: 'Dallas', state_code: 'TX' },
      },
    }),
  ),
  getJournals: vi.fn(() => Promise.resolve({ journals: [] })),
  getStoredToken: vi.fn(() => null),
}));

describe('Map — location filter UI', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        const u = String(url);
        if (u.includes('world-atlas')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(minimalWorldTopo),
          });
        }
        if (u.includes('us-atlas')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(minimalUsTopo),
          });
        }
        return Promise.reject(new Error(`unexpected fetch: ${url}`));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders the location filter row with country, state, and city selects', async () => {
    render(<Map />);

    await waitFor(() => {
      expect(screen.getByText('Filter by location')).toBeInTheDocument();
    });

    const filterRow = screen.getByText('Filter by location').closest('div');
    expect(filterRow.querySelectorAll('select')).toHaveLength(3);
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('States')).toBeInTheDocument();
    expect(screen.getByText('Cities')).toBeInTheDocument();
  });

  it('lists countries from GET /countries in the country select', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select');
    expect(countrySelect).toBeTruthy();
    const options = [...countrySelect.options].map((o) => o.textContent);
    expect(options.some((t) => t.includes('United States'))).toBe(true);
    expect(options.some((t) => t.includes('Utopia'))).toBe(true);
  });

  it('switches to the US map when United States is chosen in the country filter', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select');
    fireEvent.change(countrySelect, { target: { value: 'US' } });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /United States/i })).toBeInTheDocument();
    });
  });

  it('enables state select after US is selected and lists states', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    const stateSelect = screen.getByText('States').closest('div').querySelector('select');
    expect(stateSelect.disabled).toBe(true);

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select');
    fireEvent.change(countrySelect, { target: { value: 'US' } });

    await waitFor(() => {
      expect(stateSelect.disabled).toBe(false);
      expect([...stateSelect.options].some((o) => o.value === 'Texas')).toBe(true);
    });
  });

  it('adds a state chip when a state is selected from the dropdown', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select');
    fireEvent.change(countrySelect, { target: { value: 'US' } });

    await waitFor(() => {
      const stateSelect = screen.getByText('States').closest('div').querySelector('select');
      expect(stateSelect.disabled).toBe(false);
    });

    const stateSelect = screen.getByText('States').closest('div').querySelector('select');
    fireEvent.change(stateSelect, { target: { value: 'Texas' } });

    await waitFor(() => {
      const matches = screen.getAllByText('Texas');
      expect(matches.length).toBeGreaterThanOrEqual(1);
      const chip = matches.find((el) => el.closest('.inline-flex'));
      expect(chip).toBeTruthy();
    });
  });

  it('shows Clear location after applying a country filter', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select');
    fireEvent.change(countrySelect, { target: { value: 'UT' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Clear location/i })).toBeInTheDocument();
    });
  });
});

describe('Map — Reset all filters button', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        const u = String(url);
        if (u.includes('world-atlas')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(minimalWorldTopo),
          });
        }
        if (u.includes('us-atlas')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(minimalUsTopo),
          });
        }
        return Promise.reject(new Error(`unexpected fetch: ${url}`));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const getDateInputs = () => {
    const fromInput = screen.getByText('From').parentElement.querySelector('input[type="date"]');
    const toInput = screen.getByText('To').parentElement.querySelector('input[type="date"]');
    return { fromInput, toInput };
  };

  it('is hidden when no date or location filter is active', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    expect(
      screen.queryByRole('button', { name: /Reset all filters/i }),
    ).not.toBeInTheDocument();
  });

  it('appears when only a visit-date filter is active', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    const { fromInput } = getDateInputs();
    fireEvent.change(fromInput, { target: { value: '2024-01-01' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Reset all filters/i }),
      ).toBeInTheDocument();
    });
  });

  it('appears when only a location filter is active', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select');
    fireEvent.change(countrySelect, { target: { value: 'UT' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Reset all filters/i }),
      ).toBeInTheDocument();
    });
  });

  it('clears both date and location filters when clicked', async () => {
    render(<Map />);

    await waitFor(() => expect(screen.getByText('Filter by location')).toBeInTheDocument());

    const { fromInput, toInput } = getDateInputs();
    fireEvent.change(fromInput, { target: { value: '2024-01-01' } });
    fireEvent.change(toInput, { target: { value: '2024-12-31' } });

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select');
    fireEvent.change(countrySelect, { target: { value: 'US' } });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /United States/i })).toBeInTheDocument();
    });

    await waitFor(() => {
      const stateSelect = screen.getByText('States').closest('div').querySelector('select');
      expect(stateSelect.disabled).toBe(false);
    });
    const stateSelect = screen.getByText('States').closest('div').querySelector('select');
    fireEvent.change(stateSelect, { target: { value: 'Texas' } });

    await waitFor(() => {
      const chip = screen
        .getAllByText('Texas')
        .find((el) => el.closest('.inline-flex'));
      expect(chip).toBeTruthy();
    });

    const resetBtn = screen.getByRole('button', { name: /Reset all filters/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /Reset all filters/i }),
      ).not.toBeInTheDocument();
    });

    const { fromInput: fromAfter, toInput: toAfter } = getDateInputs();
    expect(fromAfter.value).toBe('');
    expect(toAfter.value).toBe('');

    const countryAfter = screen.getByText('Country').parentElement.querySelector('select');
    expect(countryAfter.value).toBe('');

    expect(
      screen.getByRole('heading', { name: /Geographic Explorer/i }),
    ).toBeInTheDocument();

    const texasMatches = screen.queryAllByText('Texas');
    const chipAfter = texasMatches.find((el) => el.closest('.inline-flex'));
    expect(chipAfter).toBeFalsy();
  });
});
