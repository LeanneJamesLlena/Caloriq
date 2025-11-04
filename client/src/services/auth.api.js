import api, { setAccessToken } from './api';

// Register a new user and store the received access token
export async function registerApi({ email, password }) {
    const { data } = await api.post('/auth/register', { email, password });
    setAccessToken(data.accessToken);
    
    return data.user;
}
// Log in an existing user and save the new access token
export async function loginApi({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    
    return data.user;
}
// Log out the user and clear tokens from client + server
export async function logoutApi() {
    try {
        await api.post('/auth/logout'); // clears refresh cookie server-side
    } finally {
        setAccessToken(null); // remove local access token
    }
}
