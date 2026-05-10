import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Attempt to refresh
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, null, {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          });
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) {
              localStorage.setItem('refresh_token', data.refresh_token);
            }
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
            return axiosClient(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
