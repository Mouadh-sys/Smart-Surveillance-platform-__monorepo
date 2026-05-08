const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

function normaliseBaseUrl(baseUrl) {
  if (!baseUrl) {
    return '';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function normalisePath(path) {
  if (!path) {
    return '';
  }

  return path.startsWith('/') ? path : `/${path}`;
}

function buildQueryString(params) {
  if (!params || typeof params !== 'object') {
    return '';
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, String(item)));
      return;
    }

    query.append(key, String(value));
  });

  const search = query.toString();
  return search ? `?${search}` : '';
}

function buildUrl(path, params) {
  return `${normaliseBaseUrl(API_BASE_URL)}${normalisePath(path)}${buildQueryString(params)}`;
}

async function request(path, options = {}) {
  const { data, params, headers, ...rest } = options;
  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      (payload && payload.message) || response.statusText || 'Request failed'
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

const axiosClient = {
  get(path, options = {}) {
    return request(path, { ...options, method: 'GET' });
  },
  post(path, options = {}) {
    return request(path, { ...options, method: 'POST' });
  },
  put(path, options = {}) {
    return request(path, { ...options, method: 'PUT' });
  },
  patch(path, options = {}) {
    return request(path, { ...options, method: 'PATCH' });
  },
  delete(path, options = {}) {
    return request(path, { ...options, method: 'DELETE' });
  },
};

export { API_BASE_URL, buildUrl, request };
export default axiosClient;

