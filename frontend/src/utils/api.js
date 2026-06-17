const API_BASE = 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('gaia_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (name, email, password, role) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
  
  // KPIs
  getKPIs: () => request('/kpis'),
  
  // Heatmap
  getHeatmap: () => request('/heatmap'),
  getZone: (zoneId) => request(`/zones/${zoneId}`),
  getTrends: (zoneId) => request(`/trends${zoneId ? `?zone_id=${zoneId}` : ''}`),
  
  // Simulation
  simulate: (params) =>
    request('/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  
  // Recommendations
  getRecommendations: (budget = 500) =>
    request('/recommend', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  
  // Chat
  chat: (messages) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
  
  // Reports
  getReport: () => request('/reports'),
};

export default api;
