import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30s — prevents requests hanging forever on slow networks
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Bypass ngrok warning page
  }
});

// Cache store for GET requests (TTL in ms)
const CACHE_TTL_MS = 3000; // 3 seconds short-lived cache for rapid navigations
const responseCache = new Map();
const inFlightRequests = new Map();

export const clearApiCache = () => {
  responseCache.clear();
  inFlightRequests.clear();
};

API.clearCache = clearApiCache;

// Request interceptor to attach bearer token automatically
API.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Mutations invalidate all cached GET responses so data is always fresh
    const method = (config.method || 'get').toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      responseCache.clear();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Custom wrapper around API.get to provide in-flight deduplication and short-lived cache
const originalGet = API.get.bind(API);

API.get = function (url, config = {}) {
  const method = 'get';
  const shouldSkipCache = Boolean(config.skipCache || config.force || config.headers?.['Cache-Control'] === 'no-cache');
  const cacheKey = `${url}?${JSON.stringify(config.params || {})}`;

  // 1. Return cached response if valid and not explicitly bypassed
  if (!shouldSkipCache && responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return Promise.resolve(cached.response);
    }
    responseCache.delete(cacheKey);
  }

  // 2. Reuse in-flight request to avoid duplicate parallel requests
  if (!shouldSkipCache && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Dispatch fresh request
  const requestPromise = originalGet(url, config)
    .then((response) => {
      // Store clone of response with timestamp
      responseCache.set(cacheKey, {
        timestamp: Date.now(),
        response: { ...response, data: response.data },
      });
      return response;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  if (!shouldSkipCache) {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
};

// Response interceptor to catch unauthorized responses (like expired tokens)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user storage upon token invalidation/expiry
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
      responseCache.clear();
      inFlightRequests.clear();
    }
    return Promise.reject(error);
  }
);

export default API;