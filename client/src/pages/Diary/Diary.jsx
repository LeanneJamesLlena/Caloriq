import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import DatePicker from '../../components/DatePicker/DatePicker';
import MacroBar from '../../components/MacroBar/MacroBar';
import MealCard from '../../components/MealCard/MealCard';
import AddFoodSheet from '../../components/AddFoodSheet/AddFoodSheet';
import useDiaryStore from '../../store/diaryStore';
import { deleteItem } from '../../services/diary.api';
import s from './Diary.module.css';

// Normalize a food item from API into the internal shape used in the app
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
// Normalize meal sections from API data into Breakfast/Lunch/Dinner/Snack arrays
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
// Capitalize the first letter of a meal string ("breakfast" → "Breakfast")
const capMeal = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);


export default function Diary() {
  // get actions from useDiaryStore
  const { date, setDate, targets, data, loading, error, fetchAll } = useDiaryStore();
   //Local UI state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMeal, setSheetMeal] = useState('Breakfast');
  const [editItem, setEditItem] = useState(null);

 // Fetch diary data when date changes
  useEffect(() => { fetchAll(); }, [date]);

  const t = targets || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const day = data?.dayTotals || { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const meals = normalizeMeals(data);
  // Open sheet to add a new item
  const openAdd = (meal) => { setEditItem(null); setSheetMeal(meal); setSheetOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    // item.mealType is lowercase from API; capitalize for the sheet select
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
 // Totals 
  const remaining = Math.max(0, (t.calories || 0) - (day.kcal || 0));
  const eaten = day.kcal || 0;

  return (
    <>
      <Header />

      <main className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <DatePicker value={date} onChange={setDate} />

        {loading && <div className="card" style={{ padding: 16 }}>Loading…</div>}
        {error && !loading && <div className="alert" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Totals Card */}
        <section className={`card ${s.totals}`}>
          <div className={s.ringWrap}>
            <div
              className={s.ring}
              style={{
                background: `conic-gradient(var(--color-accent) ${Math.min(100, (t.calories>0? (eaten/t.calories)*100:0))}%,
                              #e2e8f0 0)`,
              }}
            >
              <div className={s.ringInner}>
                <div className={s.big}>{remaining}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Remaining</div>
              </div>
            </div>
            <div className={s.sideNums}>
              <div><strong>{eaten}</strong><span className="text-muted"> Eaten</span></div>
              <div><strong>{t.calories || 0}</strong><span className="text-muted"> Target</span></div>
            </div>
          </div>

          <div className={s.macros}>
            <MacroBar label="Protein" value={Math.round(day.protein||0)} target={t.protein||0} />
            <MacroBar label="Carbs"   value={Math.round(day.carbs||0)}   target={t.carbs||0} />
            <MacroBar label="Fat"     value={Math.round(day.fat||0)}     target={t.fat||0} />
            <MacroBar label="Fiber"   value={Math.round(day.fiber||0)}   target={t.fiber||0} />
          </div>
        </section>

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
