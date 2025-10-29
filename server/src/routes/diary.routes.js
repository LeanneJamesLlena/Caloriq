import express from 'express';
import { verifyAccess } from '../middleware/auth.js';
import { getDiaryDay, postDiaryEntry, putDiaryEntry, deleteDiaryEntry } from '../controllers/diary.controller.js';

const router = express.Router();

// GET /api/diary?date=YYYY-MM-DD
router.get('/', verifyAccess, getDiaryDay); //tested and working

// POST /api/diary  { date, mealType, fdcId, grams, label? }
router.post('/', verifyAccess, postDiaryEntry);  //tested and working

// PUT /api/diary/:id  { grams?, mealType? }
router.put('/:id', verifyAccess, putDiaryEntry);  //tested and working

// DELETE /api/diary/:id
router.delete('/:id', verifyAccess, deleteDiaryEntry);  //tested and working
//sign
export default router;
