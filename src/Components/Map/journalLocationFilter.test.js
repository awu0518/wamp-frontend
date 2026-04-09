import { describe, it, expect } from 'vitest';
import { hasLocationFilter, filterJournalsByLocation } from './journalLocationFilter';

const journals = [
  {
    title: 'NYC',
    iso_code: 'US',
    state_code: 'NY',
    location_name: 'New York',
  },
  {
    title: 'Paris',
    iso_code: 'FR',
    state_code: '',
    location_name: 'Paris',
  },
  {
    title: 'Austin',
    iso_code: 'US',
    state_code: 'TX',
    location_name: 'Austin',
  },
];

const stateNameToCode = { Texas: 'TX', 'New York': 'NY' };

describe('hasLocationFilter', () => {
  it('is false when all empty', () => {
    expect(hasLocationFilter('', '', '')).toBe(false);
  });

  it('is true when country is set', () => {
    expect(hasLocationFilter('US', '', '')).toBe(true);
  });

  it('is true when state is set', () => {
    expect(hasLocationFilter('', 'Texas', '')).toBe(true);
  });

  it('is true when city is set', () => {
    expect(hasLocationFilter('', '', 'Austin')).toBe(true);
  });

  it('is false for whitespace-only values', () => {
    expect(hasLocationFilter('  ', '\t', '')).toBe(false);
  });
});

describe('filterJournalsByLocation', () => {
  it('returns the same list when no geo filters', () => {
    expect(
      filterJournalsByLocation(journals, { countryIso: '', stateName: '', cityName: '' }, {}),
    ).toEqual(journals);
  });

  it('filters by country ISO', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: 'FR', stateName: '', cityName: '' },
      stateNameToCode,
    );
    expect(out).toHaveLength(1);
    expect(out[0].location_name).toBe('Paris');
  });

  it('filters by state name using stateNameToCode', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '', stateName: 'Texas', cityName: '' },
      stateNameToCode,
    );
    expect(out).toHaveLength(1);
    expect(out[0].location_name).toBe('Austin');
  });

  it('does not filter by state when state name is missing from map', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '', stateName: 'Unknown State', cityName: '' },
      stateNameToCode,
    );
    expect(out).toEqual(journals);
  });

  it('filters by city name', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '', stateName: '', cityName: 'New York' },
      stateNameToCode,
    );
    expect(out).toHaveLength(1);
    expect(out[0].state_code).toBe('NY');
  });

  it('chains country then state then city', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: 'US', stateName: 'Texas', cityName: 'Austin' },
      stateNameToCode,
    );
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Austin');
  });

  it('returns empty when country excludes all', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: 'DE', stateName: '', cityName: '' },
      stateNameToCode,
    );
    expect(out).toEqual([]);
  });

  it('trims geo string values', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '  US  ', stateName: '', cityName: '' },
      stateNameToCode,
    );
    expect(out).toHaveLength(2);
    expect(out.every((j) => j.iso_code === 'US')).toBe(true);
  });
});
