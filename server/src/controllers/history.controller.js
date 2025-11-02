// define the logics of the routes inside history.routes.js
import { getHistoryRange } from '../services/history.service.js';


// returns each macro's total of a certain date
export async function getHistory(req, res) {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({ error: 'from and to are required (YYYY-MM-DD)' });
        };
        const data = await getHistoryRange({
        userId: req.user.id,
        from,
        to,
        });
        res.json({ items: data });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Failed to get history' });
    }
}
