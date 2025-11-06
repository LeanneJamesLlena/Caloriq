import api from './api';

//Performs a GET request to /foods/search with a query string.
// Returns an array of food items from the API response.
export async function searchFoods(q, { signal } = {}) {
    const res = await api.get('/foods/search', { params: { q }, signal });
    return Array.isArray(res.data?.items) ? res.data.items : [];
}
// Fetches detailed information about a specific food by its FDC ID.
export async function getFood(fdcId, { signal } = {}) {
    const res = await api.get(`/foods/${fdcId}`, { signal });
    return res.data; 
}

//