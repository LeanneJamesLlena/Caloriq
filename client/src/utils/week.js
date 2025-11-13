
// Converts a Date object → "YYYY-MM-DD" string
export function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

// Returns a new Date for the Monday of the given date’s week
export function startOfWeek(d) {
    const x = new Date(d);                     
    const day = (x.getDay() + 6) % 7;         
    x.setDate(x.getDate() - day);              
    x.setHours(0, 0, 0, 0);

    return x;
}

// Adds or subtracts N days from a Date and returns a new Date
export function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);

    return x;
}

// Returns { from, to } for the current week (Mon–Sun)
export function thisWeekRange() {
    const from = startOfWeek(new Date());
    const to = addDays(from, 6);

    return { from, to };
}

// Returns { from, to } for the previous week (Mon–Sun)
export function lastWeekRange() {
    const end = addDays(startOfWeek(new Date()), -1); 
    const from = addDays(end, -6);

    return { from, to: end };
}

// Converts a { from: Date, to: Date } → { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
export function ymdRange({ from, to }) {
    return { from: toYMD(from), to: toYMD(to) };
}

// Generates an array of 7 day strings ("YYYY-MM-DD") starting from given Monday
export function listWeekDays(from) {
    return Array.from({ length: 7 }, (_, i) => toYMD(addDays(from, i)));
}
