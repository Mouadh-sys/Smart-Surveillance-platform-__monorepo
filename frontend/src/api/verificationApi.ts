import axiosClient from './axiosClient';

export const verificationApi = {
  recognizeImage: async (formData: FormData) => {
    const { data } = await axiosClient.post('/api/verification/recognize-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  verifyAuthenticity: async (eventCode: string) => {
    const { data } = await axiosClient.post(`/api/verification/verify-authenticity/${eventCode}`);
    return data;
  },
  getModelStatus: async () => {
    const { data } = await axiosClient.get('/api/verification/model-status');
    return data;
  },
  reloadModel: async () => {
    const { data } = await axiosClient.post('/api/verification/reload-model');
    return data;
  },
};
