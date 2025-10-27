import express from 'express';
import rateLimit from 'express-rate-limit';
import { searchFoods, getFoodById } from '../controllers/foods.controller.js';

const router = express.Router();

// Lighter rate limit specifically for search endpoints
// this will limit the clients request
const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

router.get('/search', searchLimiter, searchFoods);
router.get('/:fdcId', getFoodById);

export default router;
