import axiosClient from './axiosClient';

const MONITORING_PATH = '/monitoring';

export const getMonitoringStatus = () => axiosClient.get(`${MONITORING_PATH}/status`);
export const getLiveStreams = (params = {}) => axiosClient.get(`${MONITORING_PATH}/streams`, { params });
export const getStreamDetails = (streamId) => axiosClient.get(`${MONITORING_PATH}/streams/${streamId}`);
export const startMonitoring = (payload = {}) => axiosClient.post(`${MONITORING_PATH}/start`, { data: payload });
export const stopMonitoring = () => axiosClient.post(`${MONITORING_PATH}/stop`);

