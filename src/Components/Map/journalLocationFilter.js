/**
 * Map journal list filtering by country ISO, US state name, and city name.
 * stateNameToCode maps API state display names to state_code (e.g. "Texas" -> "TX").
 */

export function hasLocationFilter(countryIso, stateName, cityName) {
  return Boolean(
    (countryIso && String(countryIso).trim()) ||
      (stateName && String(stateName).trim()) ||
      (cityName && String(cityName).trim()),
  );
}

/**
 * @param {Array<object>} journals
 * @param {{ countryIso?: string, stateName?: string, cityName?: string }} geo
 * @param {Record<string, string>} stateNameToCode
 */
export function filterJournalsByLocation(journals, geo, stateNameToCode) {
  const countryIso = geo.countryIso?.trim() || '';
  const stateName = geo.stateName?.trim() || '';
  const cityName = geo.cityName?.trim() || '';

  let list = journals;
  if (countryIso) {
    list = list.filter((j) => j.iso_code === countryIso);
  }
  if (stateName) {
    const code = stateNameToCode[stateName];
    if (code) list = list.filter((j) => j.state_code === code);
  }
  if (cityName) {
    list = list.filter((j) => j.location_name === cityName);
  }
  return list;
}
