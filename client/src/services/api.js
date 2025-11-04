import axios from 'axios';

// Keep access token in memory (mirrors localStorage for speed)
let accessToken = localStorage.getItem('accessToken') || null;

// Any 401s(unauthorized) request that happen during a refresh will wait on this.

let refreshPromise = null;

// Create Axios instance with backend base URL and refresh cookie support
const api = axios.create({
  baseURL: 'http://localhost:4000/api', 
  withCredentials: true,                // send/receive the HTTP-only refresh cookie
});

// Save or clear access token (updates memory + localStorage)
export function setAccessToken(token) {
    accessToken = token || null;
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
}
// Add Authorization header if token exists
function attachAuth(cfg) {
    if (accessToken) {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${accessToken}`;
    }
    return cfg;
}

// Refresh access token using HTTP-only cookie
async function refreshAccessToken() {

    if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh') // cookie is auto-sent
        .then(({ data }) => {
            setAccessToken(data.accessToken);
            return data.accessToken;
        })
        .catch((err) => {
            setAccessToken(null);
            throw err;
        })
        .finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

//  interceptors 

// Attach Authorization header before each request
api.interceptors.request.use(attachAuth);

// On 401(unauthorized) request, try a single refresh then retry the original request
api.interceptors.response.use(

    (res) => res,
    async (error) => {
        const original = error.config;
        if (!error.response || original?._retry) throw error;

        const status = error.response.status;
        const url = original?.url || '';

        // Ignore 401s from auth endpoints (login/register/logout/refresh)
        const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/logout') ||
        url.includes('/auth/refresh');

        if (status !== 401 || isAuthEndpoint) {
            throw error;
        }

        if (!accessToken) throw error;

        try {
            original._retry = true;
            const newToken = await refreshAccessToken();
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
        } catch (e) {
            throw e;
        }

    }

);


export default api;
