/**
 * Map journal list filtering by visit date (visited_at).
 * dateFrom / dateTo are values from <input type="date"> (YYYY-MM-DD) or empty string.
 */

function localDayStartMs(yyyyMmDd) {
  const parts = yyyyMmDd.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function localDayEndMs(yyyyMmDd) {
  const parts = yyyyMmDd.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

function visitTimeMs(journal) {
  if (!journal?.visited_at) return null;
  const t = Date.parse(String(journal.visited_at));
  return Number.isNaN(t) ? null : t;
}

export function hasJournalDateFilter(dateFrom, dateTo) {
  return Boolean((dateFrom && dateFrom.trim()) || (dateTo && dateTo.trim()));
}

export function journalMatchesDateRange(journal, dateFrom, dateTo) {
  if (!hasJournalDateFilter(dateFrom, dateTo)) return true;
  const t = visitTimeMs(journal);
  if (t == null) return false;
  const from = dateFrom?.trim();
  const to = dateTo?.trim();
  if (from) {
    const start = localDayStartMs(from);
    if (start == null || t < start) return false;
  }
  if (to) {
    const end = localDayEndMs(to);
    if (end == null || t > end) return false;
  }
  return true;
}
