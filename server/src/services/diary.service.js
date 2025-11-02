//Diary controller's helper functions
import { DiaryEntry } from '../models/DiaryEntry.model.js';
import { getFoodByIdService } from './foods.service.js';
import { toYMD } from '../utils/dates.js';
import { scalePer100g, addN, normalizeN } from '../utils/nutrition.js';

// Add a diary entry: fetch normalized food (from cache/FDC), snapshot per100g, scale by grams
export async function addEntry({ userId, date, mealType, fdcId, grams, label }) {
    const ymd = toYMD(date);
    const g = Number(grams);
    if (!Number.isFinite(g) || g <= 0) {
        const err = new Error('Invalid grams');
        err.status = 400;
        throw err;
    }

    const food = await getFoodByIdService(Number(fdcId)); // throws 422 for non-generic/zero-block
    const per100g = food.per100g;

    const entry = await DiaryEntry.create({
        userId,
        date: ymd,
        mealType,
        fdcId: Number(fdcId),
        label: label || food.name,
        grams: g,
        per100gSnapshot: per100g,
        nutrients: scalePer100g(per100g, g),
    });

    return entry;
}

// Get one day's entries grouped by meal + totals
export async function getDay({ userId, date }) {
    const ymd = toYMD(date);

    const entries = await DiaryEntry.find({ userId, date: ymd })
        .sort({ createdAt: 1 })
        .lean();

    const meals = {
        breakfast: { items: [], total: blankTotals() },
        lunch:     { items: [], total: blankTotals() },
        dinner:    { items: [], total: blankTotals() },
        snack:     { items: [], total: blankTotals() },
    };
    let dayTotals = blankTotals();

    for (const e of entries) {
        meals[e.mealType].items.push(e);
        meals[e.mealType].total = addN(meals[e.mealType].total, e.nutrients);
        dayTotals = addN(dayTotals, e.nutrients);
    }
    
    for (const key of Object.keys(meals)) {
        meals[key].total = normalizeN(meals[key].total);
    }
    dayTotals = normalizeN(dayTotals);

    return { date: ymd, meals, dayTotals };
}

// Update grams and/or mealType; recompute nutrients if grams changed
export async function updateEntry({ userId, entryId, grams, mealType }) {
    const entry = await DiaryEntry.findOne({ _id: entryId, userId });
    if (!entry) {
        const err = new Error('Entry not found');
        err.status = 404;
        throw err;
    }

    let changed = false;
    if (grams !== undefined) {
        const g = Number(grams);
        if (!Number.isFinite(g) || g <= 0) {
        const err = new Error('Invalid grams');
        err.status = 400;
        throw err;
        }
        entry.grams = g;
        entry.nutrients = scalePer100g(entry.per100gSnapshot, g);
        changed = true;
    }
    if (mealType && ['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
        entry.mealType = mealType;
        changed = true;
    }

    if (changed) await entry.save();
    return entry.toObject();
}
// Delete a certain meal entry
export async function deleteEntry({ userId, entryId }) {
    const res = await DiaryEntry.deleteOne({ _id: entryId, userId });
    if (res.deletedCount === 0) {
        const err = new Error('Entry not found');
        err.status = 404;
        throw err;
    }
    return { ok: true };
}
// returns template object of the nutrients set all to 0
function blankTotals() {
    return { kcal: 0, protein: 0, carbs: 0, sugars: 0, fiber: 0, fat: 0, satFat: 0, sodium: 0 };
}
