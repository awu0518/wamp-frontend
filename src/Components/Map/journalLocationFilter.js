/**
 * Map journal list filtering by country ISO, US state names (Set), and city names (Set).
 * stateNameToCode maps API state display names to state_code (e.g. "Texas" -> "TX").
 */

export function hasLocationFilter(countryIso, stateNames, cityNames) {
  return Boolean(
    (countryIso && String(countryIso).trim()) ||
      (stateNames instanceof Set ? stateNames.size > 0 : stateNames && String(stateNames).trim()) ||
      (cityNames instanceof Set ? cityNames.size > 0 : cityNames && String(cityNames).trim()),
  );
}

/**
 * @param {Array<object>} journals
 * @param {{ countryIso?: string, stateNames?: Set<string>, cityNames?: Set<string> }} geo
 * @param {Record<string, string>} stateNameToCode
 */
export function filterJournalsByLocation(journals, geo, stateNameToCode) {
  const countryIso = geo.countryIso?.trim() || '';
  const stateNames = geo.stateNames || new Set();
  const cityNames = geo.cityNames || new Set();

  let list = journals;
  if (countryIso) {
    list = list.filter((j) => j.iso_code === countryIso);
  }
  if (stateNames.size > 0) {
    const codes = new Set();
    stateNames.forEach((n) => {
      const c = stateNameToCode[n];
      if (c) codes.add(c);
    });
    list = list.filter((j) => codes.has(j.state_code));
  }
  if (cityNames.size > 0) {
    list = list.filter((j) => cityNames.has(j.location_name));
  }
  return list;
}
