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
    expect(hasLocationFilter('', new Set(), new Set())).toBe(false);
  });

  it('is true when country is set', () => {
    expect(hasLocationFilter('US', new Set(), new Set())).toBe(true);
  });

  it('is true when stateNames Set has entries', () => {
    expect(hasLocationFilter('', new Set(['Texas']), new Set())).toBe(true);
  });

  it('is true when cityNames Set has entries', () => {
    expect(hasLocationFilter('', new Set(), new Set(['Austin']))).toBe(true);
  });

  it('is false for whitespace-only country and empty Sets', () => {
    expect(hasLocationFilter('  ', new Set(), new Set())).toBe(false);
  });
});

describe('filterJournalsByLocation', () => {
  it('returns the same list when no geo filters', () => {
    expect(
      filterJournalsByLocation(
        journals,
        { countryIso: '', stateNames: new Set(), cityNames: new Set() },
        stateNameToCode,
      ),
    ).toEqual(journals);
  });

  it('filters by country ISO', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: 'FR', stateNames: new Set(), cityNames: new Set() },
      stateNameToCode,
    );
    expect(out).toHaveLength(1);
    expect(out[0].location_name).toBe('Paris');
  });

  it('filters by a single state name using stateNameToCode', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '', stateNames: new Set(['Texas']), cityNames: new Set() },
      stateNameToCode,
    );
    expect(out).toHaveLength(1);
    expect(out[0].location_name).toBe('Austin');
  });

  it('filters by multiple state names', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '', stateNames: new Set(['Texas', 'New York']), cityNames: new Set() },
      stateNameToCode,
    );
    expect(out).toHaveLength(2);
    expect(out.map((j) => j.location_name).sort()).toEqual(['Austin', 'New York']);
  });

  it('returns empty when state name is missing from stateNameToCode map', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '', stateNames: new Set(['Unknown State']), cityNames: new Set() },
      stateNameToCode,
    );
    expect(out).toEqual([]);
  });

  it('filters by a single city name', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '', stateNames: new Set(), cityNames: new Set(['New York']) },
      stateNameToCode,
    );
    expect(out).toHaveLength(1);
    expect(out[0].state_code).toBe('NY');
  });

  it('filters by multiple city names', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '', stateNames: new Set(), cityNames: new Set(['New York', 'Austin']) },
      stateNameToCode,
    );
    expect(out).toHaveLength(2);
    expect(out.map((j) => j.location_name).sort()).toEqual(['Austin', 'New York']);
  });

  it('chains country then state then city', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: 'US', stateNames: new Set(['Texas']), cityNames: new Set(['Austin']) },
      stateNameToCode,
    );
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Austin');
  });

  it('returns empty when country excludes all', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: 'DE', stateNames: new Set(), cityNames: new Set() },
      stateNameToCode,
    );
    expect(out).toEqual([]);
  });

  it('trims geo string values', () => {
    const out = filterJournalsByLocation(
      journals,
      { countryIso: '  US  ', stateNames: new Set(), cityNames: new Set() },
      stateNameToCode,
    );
    expect(out).toHaveLength(2);
    expect(out.every((j) => j.iso_code === 'US')).toBe(true);
  });
});
