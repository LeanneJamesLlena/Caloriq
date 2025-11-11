import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { toYMD, parseYMDLocal } from '../../utils/date'; 
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import DatePicker from '../../components/DatePicker/DatePicker';
import MacroBar from '../../components/MacroBar/MacroBar';
import MealCard from '../../components/MealCard/MealCard';
import AddFoodSheet from '../../components/AddFoodSheet/AddFoodSheet';
import useDiaryStore from '../../store/diaryStore';
import { deleteItem } from '../../services/diary.api';
import DaySummary from '../../components/DaySummary/DaySummary';
import s from './Diary.module.css';

// Converts a raw API item into javascript object
function normalizeItem(it) {
  const n = it?.nutrients || {};

  return {
    _id: it._id,
    name: it.label || it.name || 'Food',
    grams: it.grams ?? 0,
    kcal: Math.round(n.kcal ?? 0),
    protein: Number(n.protein ?? 0),
    carbs: Number(n.carbs ?? 0),
    fat: Number(n.fat ?? 0),
    fiber: Number(n.fiber ?? 0),
    mealType: it.mealType,   // "breakfast" | "lunch" | "dinner" | "snack"
    fdcId: it.fdcId,
  };
}
// Groups API meal data into Breakfast/Lunch/Dinner/Snack arrays
function normalizeMeals(apiData) {
  const empty = { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
  const m = apiData?.meals;
  if (!m) return empty;

  const pick = (sec) => (Array.isArray(sec?.items) ? sec.items.map(normalizeItem) : []);
  return {
    Breakfast: pick(m.breakfast),
    Lunch: pick(m.lunch),
    Dinner: pick(m.dinner),
    Snack: pick(m.snack), 
  };
}

// Turns "breakfast" → "Breakfast"
const capMeal = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);


export default function Diary() {
  const location = useLocation(); 
  const navigate = useNavigate(); 

  // get actions from useDiaryStore
  const { date, setDate, targets, data, loading, error, fetchAll } = useDiaryStore();
  //Local UI state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMeal, setSheetMeal] = useState('Breakfast');
  const [editItem, setEditItem] = useState(null);

  // update the Diary date accordingly, then clear the query.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qd = params.get('date');
    if (!qd) return;

    const next = parseYMDLocal(qd);
    if (next && toYMD(next) !== toYMD(date)) {
      setDate(next); 
    }

    navigate(location.pathname, { replace: true });
  }, [location.search, date, setDate, navigate, location.pathname]);


 // Fetch diary data when date changes
  useEffect(() => { fetchAll(); }, [date]);
  // Fallbacks to avoid undefined values in UI
  const t = targets || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const day = data?.dayTotals || { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const meals = normalizeMeals(data);

  // Open sheet to add a new meal
  const openAdd = (meal) => { setEditItem(null); setSheetMeal(meal); setSheetOpen(true); };
  // Open sheet to edit a meal
  const openEdit = (item) => {
    setEditItem(item);
    setSheetMeal(capMeal(item.mealType));
    setSheetOpen(true);
  };
  // Delete a food item and refresh data
  const onDelete = async (item) => {
    try {
      await deleteItem(item._id);
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  // Compute totals for the summary bar
  const remaining = Math.max(0, (t.calories || 0) - (day.kcal || 0));
  const eaten = day.kcal || 0;

  return (
    <>
      <Header />

      <main className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <DatePicker value={date} onChange={setDate} />

        {loading && <div className="card" style={{ padding: 16 }}>Loading…</div>}
        {error && !loading && <div className="alert" style={{ marginBottom: 16 }}>{error}</div>}


        <DaySummary eaten={day.kcal || 0} targets={t} macros={day} />

        {/* Meals */}
        <div className={s.meals}>
          <MealCard title="Breakfast" items={meals.Breakfast}
            onAddClick={() => openAdd('Breakfast')}
            onEditClick={openEdit}
            onDeleteClick={onDelete}
          />
          <MealCard title="Lunch" items={meals.Lunch}
            onAddClick={() => openAdd('Lunch')}
            onEditClick={openEdit}
            onDeleteClick={onDelete}
          />
          <MealCard title="Dinner" items={meals.Dinner}
            onAddClick={() => openAdd('Dinner')}
            onEditClick={openEdit}
            onDeleteClick={onDelete}
          />
          <MealCard title="Snack" items={meals.Snack}
            onAddClick={() => openAdd('Snack')}
            onEditClick={openEdit}
            onDeleteClick={onDelete}
          />
        </div>
      </main>

      <Footer/>
      
      {/* Add/Edit Sheet */}
      <AddFoodSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        date={date}
        defaultMeal={sheetMeal}
        editItem={editItem}
      />
    </>
  );
}
