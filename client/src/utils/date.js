
// Convert a Date object to YYYY-MM-DD format (in local time)
export function toYMD(date) {
  // Format YYYY-MM-DD in *local* time (avoids UTC shift)
    const tzOff = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOff).toISOString().slice(0, 10);
}
// Return a new Date object with n days added (or subtracted if n is negative)
export function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}
// Format a Date into a string (e.g., "Monday, Oct 14")
export function prettyDate(date) {
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}

// Parse "YYYY-MM-DD" into a Date at local midnight (no UTC shift)
export function parseYMDLocal(ymd) {
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}
