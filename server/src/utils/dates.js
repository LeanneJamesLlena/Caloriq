//   date helpers (timezones, YYYY-MM-DD)
import { DateTime } from 'luxon';
import { config } from '../config/env.js';

//Guarantees all diary entrees use consistent YYYY-MM-DD format
export function toYMD(d = new Date(), tz = config.DEFAULT_TZ || 'Europe/Helsinki') {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    return DateTime.fromJSDate(new Date(d), { zone: tz }).toFormat('yyyy-LL-dd');
}
