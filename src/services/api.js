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

// States

// List all states.
// params: page, limit, sort_by, order, state_code
export function getStates(params = {}) {
  const query = new URLSearchParams(params).toString();
  return get(`/states${query ? `?${query}` : ''}`);
}

// Get a single state by ID (name).
export function getState(stateId) {
  return get(`/states/${encodeURIComponent(stateId)}`);
}

// Create a new state.
export function createState(state) {
  return post('/states', state);
}

// Update a state by ID.
export function updateState(stateId, state) {
  return put(`/states/${encodeURIComponent(stateId)}`, state);
}

// Delete a state by ID.
export function deleteState(stateId) {
  return del(`/states/${encodeURIComponent(stateId)}`);
}

// Search states.
// params: name, state_code, capital
export function searchStates(params = {}) {
  const query = new URLSearchParams(params).toString();
  return get(`/states/search${query ? `?${query}` : ''}`);
}

// Bulk create states.
export function bulkCreateStates(states) {
  return post('/states/bulk', states);
}

// Bulk update states.
export function bulkUpdateStates(states) {
  return put('/states/bulk', states);
}

// Bulk delete states.
export function bulkDeleteStates(states) {
  return del('/states/bulk', states);
}

// Cities

// List all cities.
// params: page, limit, sort_by, order
export function getCities(params = {}) {
  const query = new URLSearchParams(params).toString();
  return get(`/cities${query ? `?${query}` : ''}`);
}

// Create a new city.
export function createCity(city) {
  return post('/cities', city);
}

// Delete a city by name.
// stateCode is a required query param.
export function deleteCity(cityName, stateCode) {
  return del(
    `/cities/${encodeURIComponent(cityName)}?state_code=${encodeURIComponent(stateCode)}`
  );
}

// Search cities.
// params: name (substring), state_code (exact)
export function searchCities(params = {}) {
  const query = new URLSearchParams(params).toString();
  return get(`/cities/search${query ? `?${query}` : ''}`);
}

// Bulk create cities.
export function bulkCreateCities(cities) {
  return post('/cities/bulk', cities);
}

// Bulk update cities.
export function bulkUpdateCities(cities) {
  return put('/cities/bulk', cities);
}

// Bulk delete cities.
export function bulkDeleteCities(cities) {
  return del('/cities/bulk', cities);
}

// Auth (placeholder, will implement once backend auth routes are connected)

// Login with email and password. Returns JWT token.
export async function login(email, password) {
  return post('/login', { email, password });
}

// Register a new user.
export async function register(email, username, password) {
  return post('/register', { email, username, password });
}


