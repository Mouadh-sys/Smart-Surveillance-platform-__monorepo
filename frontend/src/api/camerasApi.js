import axiosClient from './axiosClient';

const CAMERAS_PATH = '/cameras';

export const getCameras = (params = {}) => axiosClient.get(CAMERAS_PATH, { params });
export const getCameraById = (id) => axiosClient.get(`${CAMERAS_PATH}/${id}`);
export const createCamera = (camera) => axiosClient.post(CAMERAS_PATH, { data: camera });
export const updateCamera = (id, camera) => axiosClient.put(`${CAMERAS_PATH}/${id}`, { data: camera });
export const deleteCamera = (id) => axiosClient.delete(`${CAMERAS_PATH}/${id}`);

