const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getAuthHeaders = () => {
  const tokens = JSON.parse(localStorage.getItem('tokens'));
  if (tokens && tokens.access) {
    return {
      'Authorization': `Bearer ${tokens.access}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: getAuthHeaders(),
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    }
  };

  // If using FormData, remove Content-Type so browser sets boundary automatically
  if (options.body instanceof FormData) {
    delete finalOptions.headers['Content-Type'];
  }

  const response = await fetch(url, finalOptions);

  if (response.status === 401) {
    // Basic unauthorized handle: clear token and reload to force login
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    window.location.href = '/auth';
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(data.error || data.detail || 'An error occurred fetching data');
  }

  return data;
};
