import { describe, it, expect } from 'vitest'
import { hasJournalDateFilter, journalMatchesDateRange } from './journalDateFilter'

describe('hasJournalDateFilter', () => {
  it('returns false when both bounds are empty', () => {
    expect(hasJournalDateFilter('', '')).toBe(false)
  })

  it('returns false when both are whitespace only', () => {
    expect(hasJournalDateFilter('  ', '\t')).toBe(false)
  })

  it('returns true when from has a value', () => {
    expect(hasJournalDateFilter('2024-01-01', '')).toBe(true)
  })

  it('returns true when to has a value', () => {
    expect(hasJournalDateFilter('', '2024-12-31')).toBe(true)
  })

  it('returns true when both have values', () => {
    expect(hasJournalDateFilter('2024-01-01', '2024-12-31')).toBe(true)
  })
})

describe('journalMatchesDateRange', () => {
  it('returns true when no filter is active, even without visited_at', () => {
    expect(journalMatchesDateRange({}, '', '')).toBe(true)
    expect(journalMatchesDateRange({ visited_at: null }, '', '')).toBe(true)
  })

  it('returns false when filter is active but visited_at is missing', () => {
    expect(journalMatchesDateRange({}, '2024-01-01', '')).toBe(false)
    expect(journalMatchesDateRange({ visited_at: '' }, '2024-01-01', '')).toBe(false)
  })

  it('returns false when filter is active but visited_at is invalid', () => {
    expect(journalMatchesDateRange({ visited_at: 'not-a-date' }, '2024-01-01', '')).toBe(
      false,
    )
  })

  it('excludes journals before dateFrom (year boundary, stable across timezones)', () => {
    expect(
      journalMatchesDateRange({ visited_at: '2018-01-15' }, '2019-01-01', ''),
    ).toBe(false)
  })

  it('includes journals after dateFrom', () => {
    expect(
      journalMatchesDateRange({ visited_at: '2025-06-15' }, '2019-01-01', ''),
    ).toBe(true)
  })

  it('excludes journals after dateTo', () => {
    expect(
      journalMatchesDateRange({ visited_at: '2030-01-01' }, '', '2020-12-31'),
    ).toBe(false)
  })

  it('includes journals before dateTo', () => {
    expect(
      journalMatchesDateRange({ visited_at: '2015-06-01' }, '', '2020-12-31'),
    ).toBe(true)
  })

  it('includes journals inside both bounds', () => {
    expect(
      journalMatchesDateRange(
        { visited_at: '2020-06-15T12:00:00.000Z' },
        '2020-01-01',
        '2020-12-31',
      ),
    ).toBe(true)
  })

  it('excludes journals outside both bounds (too early)', () => {
    expect(
      journalMatchesDateRange({ visited_at: '2019-06-15' }, '2020-01-01', '2020-12-31'),
    ).toBe(false)
  })

  it('excludes journals outside both bounds (too late)', () => {
    expect(
      journalMatchesDateRange({ visited_at: '2021-06-15' }, '2020-01-01', '2020-12-31'),
    ).toBe(false)
  })

  it('trims whitespace on dateFrom and dateTo', () => {
    expect(
      journalMatchesDateRange({ visited_at: '2018-01-01' }, '  2019-01-01  ', ''),
    ).toBe(false)
  })
})
