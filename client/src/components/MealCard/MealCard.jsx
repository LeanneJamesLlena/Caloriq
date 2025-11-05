import { useState, useMemo, useId } from 'react';
import s from './MealCard.module.css';

export default function MealCard({ title, items = [], onAddClick, onEditClick, onDeleteClick }) {

    const [open, setOpen] = useState(false);
    const panelId = useId();

    // Compute per-meal nutrient totals (cached with useMemo)
    // useMemo avoids recalculating on every render unless items changes
    const totals = useMemo(() => {
        const acc = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        for (const it of items) {
        acc.kcal += Math.round(it?.kcal || 0);
        acc.protein += it?.protein || 0;
        acc.carbs += it?.carbs || 0;
        acc.fat += it?.fat || 0;
        acc.fiber += it?.fiber || 0;
        }
        return acc;
    }, [items]);

    const toggle = () => setOpen((v) => !v);
     //Keyboard accessibility for header
    const onHeaderKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            toggle();
        }
    };

  return (
    <div className={`card ${s.card}`}>
      {/* Header as accessible button-like div */}
      <div
        className={s.header}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        onKeyDown={onHeaderKeyDown}
      >
        <div className={s.hLeft}>{title}</div>
        <div className={s.hRight}>
          <span className={s.kcal}>{totals.kcal} Cal</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            aria-label={`Add item to ${title}`}
            title={`Add item to ${title}`}
          >
            +
          </button>
        </div>
      </div>

      {open && (
        <div id={panelId} className={s.body}>
          {items.length === 0 ? (
            <div className={s.empty}>No foods yet — tap + to add.</div>
          ) : (
            <ul className={s.list}>
              {items.map((it) => (
                <li key={it._id || `${it.name}-${it.grams}`} className={s.item}>
                  <div className={s.lineTop}>
                    <span className={s.name}>{it.name}</span>
                    <span className={s.muted}>
                      {Math.round(it.grams || 0)} g · {Math.round(it.kcal || 0)} Cal
                    </span>
                  </div>
                  <div className={s.lineSub}>
                    P {Math.round(it.protein || 0)}g ·&nbsp;
                    C {Math.round(it.carbs || 0)}g ·&nbsp;
                    F {Math.round(it.fat || 0)}g ·&nbsp;
                    Fiber {Math.round(it.fiber || 0)}g
                  </div>
                  <div className={s.actions}>
                    <button type="button" className="btn btn-outline" onClick={() => onEditClick?.(it)}>Edit</button>
                    <button type="button" className="btn btn-outline" onClick={() => onDeleteClick?.(it)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className={s.sticky}>
            <div className={s.subtotal}>
              <span>Subtotal</span>
              <strong>{totals.kcal} Cal</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
