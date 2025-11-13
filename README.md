# Calorie Tracker App
## Built § Design by Leanne James Llena

### Overview
Calorie Tracker is a modern MERN app for everyday nutrition tracking. It combines a fast, mobile-friendly UI with a practical feature set: add foods, track your daily calorie § macro intake, set targets, and review weekly progress — all secured with JWT auth and refresh cookies.


LIVE DEMO INSTRUCTIONS:
ADD INSTRUCTION HOW TO USE THE APP, REGISTER -> LOGIN -> go to settings to set target macros either manually
OR using The inbuilt TDEE calculator, options maintain-lose-gain -> ALSO explain that Use calculator value btn will not apply the calculator given macros as well as save targets wont it will just fill the Targets but wont be saved yet to save actual targets press the button "Save targets"

Livedemo link:
Here


What you can do(Features)

Sign up & log in securely
Access tokens (in memory) + HTTP-only refresh cookies. Automatic token refresh and safe logout.

Track your day (Diary)
Left arrow navigates previous day and right arrow navigates next, also built in small calendar 
Four meal cards: Breakfast / Lunch / Dinner / Snack
Add foods (USDA FDC search), enter grams, see live kcal & macros.
Edit, move, or delete entries with immediate totals.
Daily header shows Remaining, eaten vs. targets with macro bars.

Set & calculate targets (Settings)
Manually set daily Calories, Protein, Carbs, Fat, Fiber.
Built-in TDEE calculator (Mifflin–St Jeor + activity) with goal presets (Lose / Maintain / Gain).
One click: Apply to targets.

Review your week (Weekly Progress)
Clickable Weekly calories chart with a blue Target line; bars show exact kcal + date on hover; clicking a bar opens that day in Diary.
Weekly macros grid with per-day ✓/↑/↓ indicators (within ~5%, over, under).
Range presets: This week / Last week / Last 2 weeks (your last selection is remembered).

Thoughtful UX
Responsive & keyboard friendly UI with soft cards, focus rings, and readable typography.
Smart persistence:
Diary remembers your last viewed date across refreshes, but resets to Today on login/logout (per current user).
Weekly Progress remembers your last range selection, also reset on login/logout.
Tooltips & affordances: smooth kcal/date tooltips over bars; segmented goal control; clean selects with custom chevrons.

Screenshots
Add your images here (or keep these placeholders):
Diary: client/public/screens/diary.png
Weekly Progress: client/public/screens/history.png
Settings: client/public/screens/settings.png


Built with
Frontend: React + Vite, CSS Modules, Zustand store
Backend: Node + Express + MongoDB (Mongoose)
Auth: JWT access token (in memory) + HTTP-only refresh cookie
APItesting: Thunderclient
Data: USDA FDC integration for foods (normalized per 100g; entries snapshot nutrients)


Security & privacy
Access token is kept in memory only; long-lived refresh cookie is HTTP-only.
On logout: server clears the cookie; client clears access token and local UI prefs (last diary date, weekly range).
Basic input validation and per-user authorization for Diary CRUD.

Project structure
-here

Installation
-here