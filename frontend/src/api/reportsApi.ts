import axiosClient from './axiosClient';

export const reportsApi = {
  getSummary: async () => {
    const { data } = await axiosClient.get('/api/reports/summary');
    return data;
  },
  getDaily: async () => {
    const { data } = await axiosClient.get('/api/reports/daily');
    return data;
  },
  getByCamera: async (cameraId: number | string) => {
    const { data } = await axiosClient.get(`/api/reports/by-camera/${cameraId}`);
    return data;
  },
  getByStatus: async (status: string) => {
    const { data } = await axiosClient.get(`/api/reports/by-status/${status}`);
    return data;
  },
};
