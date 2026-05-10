import axiosClient from './axiosClient';

export const personsApi = {
  getPersons: async () => {
    const { data } = await axiosClient.get('/api/persons/');
    return data;
  },
  getPerson: async (id: number | string) => {
    const { data } = await axiosClient.get(`/api/persons/${id}`);
    return data;
  },
  createPerson: async (personData: any) => {
    const { data } = await axiosClient.post('/api/persons/', personData);
    return data;
  },
  updatePerson: async (id: number | string, personData: any) => {
    const { data } = await axiosClient.put(`/api/persons/${id}`, personData);
    return data;
  },
  deletePerson: async (id: number | string) => {
    const { data } = await axiosClient.delete(`/api/persons/${id}`);
    return data;
  },
};
