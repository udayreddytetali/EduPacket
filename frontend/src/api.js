import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

// Configure default axios base URL so existing axios calls with '/api/...' work
axios.defaults.baseURL = API_BASE;

// Expose for fetch callers that still use fetch()
if (typeof window !== 'undefined') window.REACT_APP_API_URL = API_BASE;

export { axios, API_BASE };
