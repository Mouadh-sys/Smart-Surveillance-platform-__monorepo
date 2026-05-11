import axiosClient from './axiosClient';

export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const { data } = await axiosClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return data;
  },
  refresh: async (refreshToken?: string) => {
    const token = refreshToken || localStorage.getItem('refresh_token');
    const { data } = await axiosClient.post('/api/auth/refresh', {
      refresh_token: token
    });
    return data;
  },
  logout: async () => {
    const { data } = await axiosClient.post('/api/auth/logout');
    return data;
  },
  me: async () => {
    const { data } = await axiosClient.get('/api/auth/me');
    return data;
  },
};
