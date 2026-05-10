import axiosClient from './axiosClient';

export const eventsApi = {
  getEvents: async (params?: any) => {
    const { data } = await axiosClient.get('/api/events/', { params });
    return data;
  },
  getEvent: async (id: number | string) => {
    const { data } = await axiosClient.get(`/api/events/${id}`);
    return data;
  },
  createEvent: async (eventData: any) => {
    const { data } = await axiosClient.post('/api/events/', eventData);
    return data;
  },
  updateEvent: async (id: number | string, eventData: any) => {
    const { data } = await axiosClient.put(`/api/events/${id}`, eventData);
    return data;
  },
  deleteEvent: async (id: number | string) => {
    const { data } = await axiosClient.delete(`/api/events/${id}`);
    return data;
  },
};
