import api from './api';
// Fetch user's current nutrition targets from the backend
export async function getTargets() {
    const { data } = await api.get('/profile/targets');
    return data.targets;            
}
// Update user's nutrition targetss
export async function updateTargets(payload) {
    const { data } = await api.put('/profile/targets', payload);
    return data.targets ?? data;      
}
