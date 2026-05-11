  import axiosClient from './axiosClient';

export const camerasApi = {
  getCameras: async () => {
    const { data } = await axiosClient.get('/api/cameras/');
    return data;
  },
  getCamera: async (id: number | string) => {
    const { data } = await axiosClient.get(`/api/cameras/${id}`);
    return data;
  },
  createCamera: async (cameraData: any) => {
    const { data } = await axiosClient.post('/api/cameras/', cameraData);
    return data;
  },
  updateCamera: async (id: number | string, cameraData: any) => {
    const { data } = await axiosClient.put(`/api/cameras/${id}`, cameraData);
    return data;
  },
  deleteCamera: async (id: number | string) => {
    const { data } = await axiosClient.delete(`/api/cameras/${id}`);
    return data;
  },
};
