import axiosClient from './axiosClient';
import { API_BASE_URL } from '../utils/constants';

export const monitoringApi = {
  getStatus: async () => {
    const { data } = await axiosClient.get('/api/monitoring/status');
    return data;
  },
  getCamerasStatus: async () => {
    const { data } = await axiosClient.get('/api/monitoring/cameras');
    return data;
  },
  getCameraStatus: async (id: number | string) => {
    const { data } = await axiosClient.get(`/api/monitoring/cameras/${id}/status`);
    return data;
  },
  startCamera: async (id: number | string) => {
    const { data } = await axiosClient.post(`/api/monitoring/cameras/${id}/start`);
    return data;
  },
  stopCamera: async (id: number | string) => {
    const { data } = await axiosClient.post(`/api/monitoring/cameras/${id}/stop`);
    return data;
  },
  startAll: async () => {
    const { data } = await axiosClient.post('/api/monitoring/start-all');
    return data;
  },
  stopAll: async () => {
    const { data } = await axiosClient.post('/api/monitoring/stop-all');
    return data;
  },
  getStreamUrl: (cameraId: number | string) => {
    // Returns the MJPEG stream URL - no auth needed as token is in header
    return `${API_BASE_URL}/api/monitoring/stream/${cameraId}`;
  },
};
