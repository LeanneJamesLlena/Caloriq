import { useEffect, useMemo, useRef, useState } from 'react';
import { searchFoods, getFood } from '../../services/foods.api';
import { addItem, updateItem } from '../../services/diary.api';
import { toYMD } from '../../utils/date';
import useDiaryStore from '../../store/diaryStore';
import useDebounce from '../../hooks/useDebounce';
import s from './AddFoodSheet.module.css';

// Meal names for display vs. backend values
const MEAL_OPTIONS = [
    { label: 'Breakfast', value: 'breakfast' },
    { label: 'Lunch',     value: 'lunch' },
    { label: 'Dinner',    value: 'dinner' },
    { label: 'Snack',     value: 'snack' },
];

export default function AddFoodSheet({ open, onClose, date, defaultMeal, editItem = null }) {

    const { fetchAll } = useDiaryStore();

    // --- search state ---
    const [formQ, setFormQ] = useState('');
    const debouncedQ = useDebounce(formQ.trim(), 500);

    const [results, setResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const abortRef = useRef(null);

    // --- item being built ---
    const [food, setFood] = useState(null);
    const [grams, setGrams] = useState(100);

    // store meal internally as backend value (lowercase)
    const defaultMealValue =
    MEAL_OPTIONS.find(m => m.label === defaultMeal)?.value ||
    MEAL_OPTIONS[0].value;

    const [meal, setMeal] = useState(defaultMealValue);

    const [portionIndex, setPortionIndex] = useState(-1);

    // --- submit state ---
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Reset form each time modal opens or switches between add/edit mode
    useEffect(() => {

        if (!open) return;

        if (editItem) {
            // Editing existing entry
            setMeal(editItem.mealType || defaultMealValue);

            setGrams(Math.max(1, Math.round(editItem.grams)));

            setFormQ(editItem.name || '');
            setResults([]);
            setSearchError('');
            setFood({
                fdcId: editItem.fdcId,
                name: editItem.name,
                per100g: editItem.per100g || {
                kcal: 0, protein: 0, carbs: 0, sugars: 0, fat: 0, satFat: 0, sodium: 0,
                },
                portions: editItem.portions || [],
            });

            setPortionIndex(-1);
            setSubmitError('');
            setSubmitLoading(false);
        } else {
            // Adding a new item
            setMeal(defaultMealValue);
            setGrams(100);
            // clear temporary states
            setFormQ('');
            setResults([]);
            setSearchError('');
            setFood(null);
            setPortionIndex(-1);
            setSubmitError('');
            setSubmitLoading(false);
        }
    }, [open, editItem, defaultMealValue]);

    // Run food search when user stops typing
    useEffect(() => {
 
        if (!open) return;

        // cancel previous request if still active
        if (abortRef.current) {

            abortRef.current.abort();
            abortRef.current = null;
        }

        const q = debouncedQ;
        if (q.length < 2) {

            setResults([]);
            setSearchError('');
            setSearchLoading(false);
            return;
        }

        const ac = new AbortController();
        abortRef.current = ac;

        const run = async () => {
            try {
    
                setSearchError('');
                setSearchLoading(true);

                const data = await searchFoods(q, { signal: ac.signal });
                setResults(Array.isArray(data) ? data : []);
            } catch (e) {

                if (e.name === 'CanceledError' || e.name === 'AbortError') return;

                const msg =
                e?.response?.status === 429
                    ? 'You’re searching fast; please wait a moment and try again.'
                    : e?.response?.data?.message || 'Couldn’t load foods. Check your connection.';
                setResults([]);
                setSearchError(msg);
            } finally {

                if (!ac.signal.aborted) setSearchLoading(false);
            }
        };

        run();
        return () => ac.abort();
    }, [debouncedQ, open]);

    // select a result -> fetch full details (for portions + per100g)
    const onPick = async (fdcId) => {

        setResults([]);
        try {

            const detail = await getFood(fdcId);
            setFood(detail);
            setFormQ(`${detail.name}${detail.variant ? ` (${detail.variant})` : ''}`);
            setPortionIndex(-1);
        } catch (e) {
            setSearchError('Failed to load food details. Try again.');
        }
    };

    // portion -> grams
    useEffect(() => {
        if (!food?.portions || portionIndex < 0) return;
        const p = food.portions[portionIndex];
        if (p?.grams) setGrams(Math.max(1, Math.round(p.grams)));
    }, [portionIndex, food]);

    // nutrition preview
    const scaled = useMemo(() => {

        if (!food?.per100g) return null;
        const g = Math.max(0, Number(grams) || 0);
        const f = food.per100g;
        const k = g / 100;

        return {
            kcal: Math.round(f.kcal * k),
            protein: +(f.protein * k).toFixed(1),
            carbs: +(f.carbs * k).toFixed(1),
            sugars: +(f.sugars * k).toFixed(1),
            fat: +(f.fat * k).toFixed(1),
            satFat: +(f.satFat * k).toFixed(1),
            fiber: +(f.fiber * k).toFixed(1),
            sodium: Math.round(f.sodium * k),
        };
    }, [food, grams]);

    // allowed to submit?
    const canSubmit = !!food && grams > 0;

    // submit to backend
    const onSubmit = async () => {

        if (!canSubmit || submitLoading) return;

        const payload = {
            date: toYMD(date),
            mealType: meal, // already lowercase, e.g. "lunch"
            fdcId: food.fdcId,
            grams: Math.round(grams),
        };

        try {
            setSubmitError('');
            setSubmitLoading(true);

            if (editItem?._id) {
                await updateItem(editItem._id, {
                grams: payload.grams,
                mealType: payload.mealType,
                });
            } else {

                await addItem(payload);
            }

            await fetchAll();
            onClose?.();
        } catch (e) {

        const msg =
            
            e?.response?.data?.message ||
            (e?.response?.status === 401
            ? 'Your session expired. Please log in again.'
            : e.message || 'Could not save entry. Please try again.');

        setSubmitError(msg);

        } finally {

            setSubmitLoading(false);
        }
    };

  if (!open) return null;

  return (
    
    <div className={s.backdrop} onClick={onClose}>
      <div className={`card ${s.sheet}`} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={s.header}>
          <strong>{editItem ? 'Edit Entry' : 'Add Food'}</strong>
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>

        {/* Search */}
        <div className={s.field}>
          <label className={s.label}>Search food</label>
          <input
            className="input"
            placeholder="e.g. chicken breast"
            value={formQ}
            onChange={(e) => setFormQ(e.target.value)}
          />

          {formQ.trim().length >= 2 && searchLoading && (
            <div className="text-muted" style={{ fontSize: 14, marginTop: 6 }}>Searching…</div>
          )}

          {!searchLoading &&
            formQ.trim().length >= 2 &&
            !results.length &&
            !searchError && (
              <div className="text-muted" style={{ fontSize: 14, marginTop: 6 }}>
                No results. Try a different term.
              </div>
            )}

          {searchError && (
            <div className="alert" style={{ marginTop: 8 }}>{searchError}</div>
          )}

          {!!results.length && (
            <ul className={s.results}>
              {results.map((r) => (
                <li key={r.fdcId}>
                  <button
                    type="button"
                    className={s.resultBtn}
                    onClick={() => onPick(r.fdcId)}
                  >
                    <div className={s.resultName}>{r.name}</div>
                    <div className={s.resultSub}>
                      {r.variant ?? 'generic'}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quantity */}
        <div className={s.field}>
          <label className={s.label}>Quantity (grams)</label>
          <div className={s.gramsRow}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setGrams((g) => Math.max(1, g - 10))}
            >
              −10
            </button>

            <input
              className="input"
              type="number"
              min={1}
              value={grams}
              onChange={(e) => setGrams(Math.max(1, Number(e.target.value) || 1))}
            />

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setGrams((g) => g + 10)}
            >
              +10
            </button>
          </div>
        </div>

        {/* Meal */}
        <div className={s.field}>
          <label className={s.label}>Meal</label>
          <select
            className="input"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
          >
            {MEAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className={s.preview}>
          {food && scaled ? (
            <>
              <div className={s.previewRow}>
                <strong>{scaled.kcal} kcal</strong>
                <span className="text-muted">{Math.round(grams)} g</span>
              </div>
              <div className={s.previewGrid}>
                <span>P {scaled?.protein} g</span>
                <span>C {scaled?.carbs} g</span>
                <span>F {scaled?.fat} g</span>
                <span>Fiber {scaled?.fiber} g</span>
              </div>
            </>
          ) : (
            <div className="text-muted" style={{ fontSize: 14 }}>
              Pick a food to see nutrition.
            </div>
          )}
        </div>

        {/* Submit error (auth/validation/etc) */}
        {submitError && (
          <div className="alert" style={{ marginTop: 8 }}>{submitError}</div>
        )}

        {/* Actions */}
        <div className={s.actions}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canSubmit || submitLoading}
            onClick={onSubmit}
          >
            {submitLoading
              ? (editItem ? 'Saving…' : 'Adding…')
              : (editItem ? 'Save changes' : 'Add to diary')}
          </button>
        </div>
      </div>
    </div>
  );
}
