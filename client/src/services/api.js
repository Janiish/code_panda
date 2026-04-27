import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('agri_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    window.location.href = '/auth';
  }
  return Promise.reject(err);
});

// Auth
export const sendOTP = (data) => API.post('/auth/send-otp', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const getMe = () => API.get('/auth/me');
export const getUsers = (role) => API.get('/auth/users', { params: { role } });

// Batches
export const getBatches = (params) => API.get('/batches', { params });
export const getAllBatches = () => API.get('/batches/all');
export const getAvailableBatches = () => API.get('/batches/available');
export const getBatchTrace = (batchId) => API.get(`/batches/${batchId}`);
export const createBatch = (data) => API.post('/batches', data);
export const buyBatch = (batchId) => API.put(`/batches/${batchId}/buy`);
export const shipBatch = (batchId, retailerId) => API.put(`/batches/${batchId}/ship`, { retailerId });
export const sellBatch = (batchId) => API.put(`/batches/${batchId}/sell`);

// Blockchain
export const getRecentBlocks = (count) => API.get('/blockchain/recent', { params: { count } });
export const getBatchBlocks = (batchId) => API.get(`/blockchain/batch/${batchId}`);
export const getChainStats = () => API.get('/blockchain/stats');
export const verifyChain = () => API.get('/blockchain/verify');

export default API;
