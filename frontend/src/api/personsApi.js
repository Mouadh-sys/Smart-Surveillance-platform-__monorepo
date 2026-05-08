import axiosClient from './axiosClient';

const PERSONS_PATH = '/persons';

export const getPersons = (params = {}) => axiosClient.get(PERSONS_PATH, { params });
export const getPersonById = (id) => axiosClient.get(`${PERSONS_PATH}/${id}`);
export const createPerson = (person) => axiosClient.post(PERSONS_PATH, { data: person });
export const updatePerson = (id, person) => axiosClient.put(`${PERSONS_PATH}/${id}`, { data: person });
export const deletePerson = (id) => axiosClient.delete(`${PERSONS_PATH}/${id}`);

