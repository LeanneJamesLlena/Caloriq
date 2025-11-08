import { useEffect, useMemo, useState } from 'react';
import { getTargets, updateTargets } from '../../services/profile.api';
import useDiaryStore from '../../store/diaryStore';
import Footer from '../../components/Footer/Footer';
import s from './Settings.module.css';
// Activity level options with multipliers for TDEE
const ACTIVITY = [
  { key: 'sedentary', label: 'Sedentary (little/no exercise)', factor: 1.2 },
  { key: 'light',     label: 'Light (1–3x/week)',              factor: 1.375 },
  { key: 'moderate',  label: 'Moderate (3–5x/week)',           factor: 1.55 },
  { key: 'active',    label: 'Active (6–7x/week)',             factor: 1.725 },
  { key: 'athlete',   label: 'Very active (2x/day+)',          factor: 1.9 },
];

// Goal presets with calorie adjustments
const GOAL = [
  { key: 'lose',     label: 'Lose (−300 kcal)',   delta: -300 },
  { key: 'maintain', label: 'Maintain',           delta: 0 },
  { key: 'gain',     label: 'Gain (+300 kcal)',   delta: 300 },
];

// Mifflin–St Jeor BMR (metric)
function calcBmr({ sex, weightKg, heightCm, age }) {
  const s = sex === 'male' ? 5 : -161;
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);
}

// Macro suggestion (grams)
// Protein: 1.8 g/kg, Fat: 0.8 g/kg, Carbs: remainder from calories.
function proposeMacros({ kcal, weightKg }) {
  const protein = Math.round(1.8 * weightKg);
  const fat = Math.round(0.8 * weightKg);
  const pcals = protein * 4;
  const fcals = fat * 9;
  const carbCals = Math.max(0, kcal - pcals - fcals);
  const carbs = Math.max(0, Math.round(carbCals / 4));
  const fiber = 25; 
  return { protein, fat, carbs, fiber };
}

export default function Settings() {
  // refresh targets in Diary after save
  const { fetchAll } = useDiaryStore(); 
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);

  // Targets form state (what we PUT)
  const [form, setForm] = useState({
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
  });

  // Calculator inputs

  const [calc, setCalc] = useState({
    sex: 'female',
    age: 25,
    weightKg: 60,
    heightCm: 165,
    activity: 'sedentary',
    goal: 'maintain',
  });

  // Load current targets
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setFetchErr('');
 
        const t = await getTargets();     // now already flat
        if (!alive) return;
        setForm({
          calories: Number(t.calories || 0),
          protein : Number(t.protein  || 0),
          carbs   : Number(t.carbs    || 0),
          fat     : Number(t.fat      || 0),
          fiber   : Number(t.fiber    || 0),
        });
      } catch (e) {
        if (!alive) return;
        setFetchErr(e?.response?.data?.error || e?.message || 'Failed to load targets');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Calculate proposal when inputs change
  const proposal = useMemo(() => {
    const bmr = calcBmr(calc);
    const factor = ACTIVITY.find(a => a.key === calc.activity)?.factor || 1.2;
    const tdee = Math.round(bmr * factor);
    const delta = GOAL.find(g => g.key === calc.goal)?.delta ?? 0;
    const kcal = Math.max(0, tdee + delta);
    const macros = proposeMacros({ kcal, weightKg: calc.weightKg });
    return { bmr, tdee, kcal, ...macros };
  }, [calc]);
  // Copy calculator numbers into the form
  const applyProposalToForm = () => {
    setForm(f => ({
      ...f,
      calories: proposal.kcal,
      protein : proposal.protein,
      carbs   : proposal.carbs,
      fat     : proposal.fat,
      fiber   : proposal.fiber,
    }));
  };
  // Safe numeric parsing (non-negative)
  const onNumber = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };
  // Persist targets and refresh diary data
  const onSave = async () => {
    try {
      setSaveErr('');
      setSaving(true);
      const payload = {
        calories: onNumber(form.calories),
        protein : onNumber(form.protein),
        carbs   : onNumber(form.carbs),
        fat     : onNumber(form.fat),
        fiber   : onNumber(form.fiber),
      };
      await updateTargets(payload);
      await fetchAll(); // refresh diary totals with new targets
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to save targets';
      setSaveErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <main className={`${s.page} container`} style={{ paddingBottom: 100 }}>

      <h1 className={s.h1}>Settings</h1>

      {/* Targets card */}
      <section className={`card ${s.card}`}>
        <div className={s.cardHeader}>
          <h2 className={s.h2}>Targets</h2>
          <p className="text-muted">Daily goals used in your Diary totals.</p>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : fetchErr ? (
          <div className="alert">{fetchErr}</div>
        ) : (
          <>
            <div className={s.grid2}>
              <div className={s.field}>
                <label className={s.label}>Calories (kcal)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: onNumber(e.target.value) })}
                />
              </div>
              <div />
            </div>

            <div className={s.grid4}>
              <div className={s.field}>
                <label className={s.label}>Protein (g)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: onNumber(e.target.value) })}
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Carbs (g)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.carbs}
                  onChange={(e) => setForm({ ...form, carbs: onNumber(e.target.value) })}
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Fat (g)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.fat}
                  onChange={(e) => setForm({ ...form, fat: onNumber(e.target.value) })}
                />
              </div>
              <div className={s.field}>
                <label className={s.label}>Fiber (g)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.fiber}
                  onChange={(e) => setForm({ ...form, fiber: onNumber(e.target.value) })}
                />
              </div>
            </div>

            {saveErr && <div className="alert" style={{ marginTop: 8 }}>{saveErr}</div>}

            <div className={s.actions}>
              <button className="btn btn-outline" type="button" onClick={applyProposalToForm}>
                Use calculator result
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save targets'}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Calculator card */}
      <section className={`card ${s.card}`}>
        <div className={s.cardHeader}>
          <h2 className={s.h2}>TDEE Calculator</h2>
          <p className="text-muted">Estimate daily calories using Mifflin–St Jeor. Macros are suggested and can be tweaked.</p>
        </div>

        <div className={s.grid4}>
          <div className={s.field}>
            <label className={s.label}>Sex</label>
            <select
              className="input"
              value={calc.sex}
              onChange={(e) => setCalc({ ...calc, sex: e.target.value })}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div className={s.field}>
            <label className={s.label}>Age</label>
            <input
              className="input"
              type="number"
              min={10}
              value={calc.age}
              onChange={(e) => setCalc({ ...calc, age: onNumber(e.target.value) })}
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>Weight (kg)</label>
            <input
              className="input"
              type="number"
              min={20}
              value={calc.weightKg}
              onChange={(e) => setCalc({ ...calc, weightKg: onNumber(e.target.value) })}
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>Height (cm)</label>
            <input
              className="input"
              type="number"
              min={100}
              value={calc.heightCm}
              onChange={(e) => setCalc({ ...calc, heightCm: onNumber(e.target.value) })}
            />
          </div>

          <div className={s.fieldFull}>
            <label className={s.label}>Activity</label>
            <select
              className="input"
              value={calc.activity}
              onChange={(e) => setCalc({ ...calc, activity: e.target.value })}
            >
              {ACTIVITY.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </div>

          <div className={s.fieldFull}>
            <label className={s.label}>Goal</label>
            <div className={s.seg}>
              {GOAL.map(g => (
                <button
                  key={g.key}
                  type="button"
                  className={`${s.segBtn} ${calc.goal === g.key ? s.segActive : ''}`}
                  onClick={() => setCalc({ ...calc, goal: g.key })}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={s.preview}>
          <div className={s.previewRow}>
            <div>BMR</div>
            <strong>{proposal.bmr} kcal</strong>
          </div>
          <div className={s.previewRow}>
            <div>TDEE</div>
            <strong>{proposal.tdee} kcal</strong>
          </div>
          <div className={s.previewRow}>
            <div>Target calories</div>
            <strong>{proposal.kcal} kcal</strong>
          </div>
          <div className={s.previewGrid}>
            <span>P {proposal.protein} g</span>
            <span>C {proposal.carbs} g</span>
            <span>F {proposal.fat} g</span>
            <span>Fiber {proposal.fiber} g</span>
          </div>
        </div>

        <div className={s.actions}>
          <button className="btn btn-primary" type="button" onClick={applyProposalToForm}>
            Apply to targets
          </button>
        </div>
      </section>
    </main>
    <Footer/>
    </>
  );
}
