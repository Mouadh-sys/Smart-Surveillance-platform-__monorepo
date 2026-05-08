import axiosClient from './axiosClient';

const EVENTS_PATH = '/events';

export const getEvents = (params = {}) => axiosClient.get(EVENTS_PATH, { params });
export const getEventById = (id) => axiosClient.get(`${EVENTS_PATH}/${id}`);
export const createEvent = (event) => axiosClient.post(EVENTS_PATH, { data: event });
export const updateEvent = (id, event) => axiosClient.put(`${EVENTS_PATH}/${id}`, { data: event });
export const deleteEvent = (id) => axiosClient.delete(`${EVENTS_PATH}/${id}`);

