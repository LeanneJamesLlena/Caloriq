//History controller's helper functions
import mongoose from 'mongoose';
import { DiaryEntry } from '../models/DiaryEntry.model.js';
import { toYMD } from '../utils/dates.js';

// Returns FULL macros per day (date, kcal, protein, carbs, sugars, fiber, fat, satFat, sodium)
// for a user in [from, to] inclusive.
export async function getHistoryRange({ userId, from, to }) {
    if (!userId) {
        const err = new Error('Missing userId');
        err.status = 400;
        throw err;
    }

    const fromY = toYMD(from);
    const toY = toYMD(to);
    if (!fromY || !toY) {
        const err = new Error('from and to are required (YYYY-MM-DD)');
        err.status = 400;
        throw err;
    }

    if (fromY > toY) {
        const err = new Error('Invalid range: from > to');
        err.status = 400;
        throw err;
    }

    const uid = new mongoose.Types.ObjectId(String(userId));

    const rows = await DiaryEntry.aggregate([
        { $match: { userId: uid, date: { $gte: fromY, $lte: toY } } },
        {
        $group: {
            _id: '$date',
            kcal:     { $sum: '$nutrients.kcal' },
            protein:  { $sum: '$nutrients.protein' },
            carbs:    { $sum: '$nutrients.carbs' },
            sugars:   { $sum: '$nutrients.sugars' },
            fiber:    { $sum: '$nutrients.fiber' },
            fat:      { $sum: '$nutrients.fat' },
            satFat:   { $sum: '$nutrients.satFat' },
            sodium:   { $sum: '$nutrients.sodium' },

        },
        },
        {
        $project: {
            _id: 0,
            date: '$_id',
            // Rounding to match your display rules
            kcal:     { $round: ['$kcal', 0] },
            protein:  { $round: ['$protein', 1] },
            carbs:    { $round: ['$carbs', 1] },
            sugars:   { $round: ['$sugars', 2] },
            fiber:    { $round: ['$fiber', 1] },
            fat:      { $round: ['$fat', 1] },
            satFat:   { $round: ['$satFat', 2] },
            sodium:   { $round: ['$sodium', 0] },
        },
        },
        { $sort: { date: 1 } },
    ]);

    return rows; // sparse: only dates that have entries
}
