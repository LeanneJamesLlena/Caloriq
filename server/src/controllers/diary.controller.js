// define the logics of the routes inside diary.routes.js
import { addEntry, getDay, updateEntry, deleteEntry } from '../services/diary.service.js';

// send Diary logs of the user(filtered by date)
export async function getDiaryDay(req, res) {
    try {
        const data = await getDay({ userId: req.user.id, date: req.query.date });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Failed to get diary' });
    }
}

// add new meal to the user's diary(filtered by date)
export async function postDiaryEntry(req, res) {
    try {
        const { date, mealType, fdcId, grams, label } = req.body;
        const entry = await addEntry({ userId: req.user.id, date, mealType, fdcId, grams, label });
        res.status(201).json(entry);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Failed to add entry' });
    }
}
// update an existing meal entry
// allows changing the portion size and moving a meal from one category to another
// for instance move a certain meal from breakfast to lunch category
export async function putDiaryEntry(req, res) {
    try {
        const entry = await updateEntry({
        userId: req.user.id,
        entryId: req.params.id,
        grams: req.body.grams,
        mealType: req.body.mealType,
        });
        res.json(entry);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Failed to update entry' });
    }
}
// deletes a certain meal
export async function deleteDiaryEntry(req, res) {
    try {
        const result = await deleteEntry({ userId: req.user.id, entryId: req.params.id });
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Failed to delete entry' });
    }
}
