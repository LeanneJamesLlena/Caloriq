// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: true, // send/receive cookies
});

// Attach access token on each request
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem('accessToken');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export default api;
