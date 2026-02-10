// API Service Layer
// Centralizes all HTTP requests to the Flask backend.
// Every component should import from here instead of calling fetch() directly.

// Usage:
//   import { getCountries, searchCities } from '../services/api';
//   const countries = await getCountries();

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://wamp-limjiannn.pythonanywhere.com';

// Helper
// Core request function. Attaches JSON headers and auth token (if present).
// Returns parsed JSON on success; throws on HTTP errors.
async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // If the server returns 204 No Content, there's no body to parse
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Convenience wrappers for HTTP methods
function get(path) {
  return request(path, { method: 'GET' });
}

function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

function put(path, body) {
  return request(path, { method: 'PUT', body: JSON.stringify(body) });
}

function del(path, body) {
  const options = { method: 'DELETE' };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return request(path, options);
}

// Utility / Health

export function hello() {
  return get('/hello');
}

export function getEndpoints() {
  return get('/endpoints');
}

export function getTimestamp() {
  return get('/timestamp');
}

export function getHealth() {
  return get('/health');
}

// Countries

// List all countries.
// params: page, limit, sort_by, order, iso_code
export function getCountries(params = {}) {
  const query = new URLSearchParams(params).toString();
  return get(`/countries${query ? `?${query}` : ''}`);
}

// Get a single country by ID (name).
export function getCountry(countryId) {
  return get(`/countries/${encodeURIComponent(countryId)}`);
}

// Create a new country.
export function createCountry(country) {
  return post('/countries', country);
}

// Update a country by ID.
export function updateCountry(countryId, country) {
  return put(`/countries/${encodeURIComponent(countryId)}`, country);
}

// Delete a country by ID.
export function deleteCountry(countryId) {
  return del(`/countries/${encodeURIComponent(countryId)}`);
}

// Search countries.
// params: name (substring), iso_code (exact)
export function searchCountries(params = {}) {
  const query = new URLSearchParams(params).toString();
  return get(`/countries/search${query ? `?${query}` : ''}`);
}

// Bulk create countries.
export function bulkCreateCountries(countries) {
  return post('/countries/bulk', countries);
}

// Bulk update countries.
export function bulkUpdateCountries(countries) {
  return put('/countries/bulk', countries);
}

// Bulk delete countries.
export function bulkDeleteCountries(countries) {
  return del('/countries/bulk', countries);
}
