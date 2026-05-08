import axiosClient from './axiosClient';

const VERIFICATION_PATH = '/verification';

export const verifyPerson = (payload) => axiosClient.post(`${VERIFICATION_PATH}/verify`, { data: payload });
export const getVerificationHistory = (params = {}) => axiosClient.get(`${VERIFICATION_PATH}/history`, { params });
export const submitVerificationReview = (id, payload) =>
  axiosClient.post(`${VERIFICATION_PATH}/reviews/${id}`, { data: payload });

