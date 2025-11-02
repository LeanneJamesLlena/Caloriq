import express from 'express';
import rateLimit from 'express-rate-limit';
import { searchFoods, getFoodById } from '../controllers/foods.controller.js';

const router = express.Router();

// Lighter rate limit specifically for search endpoints
// this will limit the clients request
const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
// GET /api/foods/search
router.get('/search', searchLimiter, searchFoods); //tested and working
// GET /api/foods/:fcId
router.get('/:fdcId', getFoodById); //tested and working, ONE PROBLEM: SOME ITEM's SUGAR MACRO IS INACCURATE

export default router;
