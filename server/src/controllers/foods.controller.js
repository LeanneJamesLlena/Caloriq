//define the logics of the routes inside foods.routes.js
import { searchFoodsService, getFoodByIdService } from '../services/foods.service.js';

//this function returns a list that contains different variants of a specific food
export async function searchFoods(req, res) {
    try {
        const q = String(req.query.q || '');
        const results = await searchFoodsService(q);
        res.json({ items: results });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Search failed' });
    }
};

//This function returns informations of a specific food
export async function getFoodById(req, res) {
    try {
        const id = Number(req.params.fdcId);
        if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid fdcId' });

        const result = await getFoodByIdService(id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Fetch failed' });
    }
};
