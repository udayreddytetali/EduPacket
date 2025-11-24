import axios from 'axios';

// Runtime-friendly API base selection:
// 1. Use the build-time env (REACT_APP_API_URL) if provided by Vercel
// 2. Otherwise use any runtime-injected window.REACT_APP_API_URL
// 3. Fallback to the known Render backend URL (safe for production)
const RUNTIME_FALLBACK = 'https://edupacket-backend.onrender.com';
const API_BASE = process.env.REACT_APP_API_URL || (typeof window !== 'undefined' && window.REACT_APP_API_URL) || RUNTIME_FALLBACK;

// Configure default axios base URL so existing axios calls with '/api/...' work
axios.defaults.baseURL = API_BASE;

// Expose for fetch callers that still use fetch() and expose axios for debugging
if (typeof window !== 'undefined') {
	// Always expose the runtime API base for non-production (helps local dev)
	if (process.env.NODE_ENV !== 'production') {
		window.REACT_APP_API_URL = API_BASE;
		// Expose axios on window for quick debugging in development only
		window.axios = axios;
	}
}

export { axios, API_BASE };
