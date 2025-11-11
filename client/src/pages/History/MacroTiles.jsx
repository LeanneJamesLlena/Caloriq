import s from './MacroTiles.module.css';

// Define the rows (macronutrients) to be displayed
const ROWS = [
    { key: 'protein', label: 'Protein' },
    { key: 'carbs',   label: 'Carbs'   },
    { key: 'fat',     label: 'Fat'     },
    { key: 'fiber',   label: 'Fiber'   },
];
// Helper function: determines the status mark and tooltip for each cell
function cellMark(actual, target) {
    if (!target) return { char: '–', cls: s.neutral, tip: `${actual} / 0g` };
    if (actual >= target * 1.05) return { char: '↑', cls: s.over,  tip: `${actual}g / ${target}g (over)` };
    if (actual >= target * 0.95) return { char: '✓', cls: s.ok,    tip: `${actual}g / ${target}g (ok)` };
    return { char: '↓', cls: s.under, tip: `${actual}g / ${target}g (under)` };
}

// Main component for rendering macro, adherence, and tiles
export default function MacroTiles({ days, targets }) {
    // Prevents undefined access if no targets provided
    const safe = targets || {};
    // Rounded target values for consistency
    const t = {
        protein: Math.round(safe.protein || 0),
        carbs:   Math.round(safe.carbs   || 0),
        fat:     Math.round(safe.fat     || 0),
        fiber:   Math.round(safe.fiber   || 0),
    };
    // Fixed weekday headers
    const weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className={s.tilesCard}>
      <div className={s.tilesHeader}><h3>Weekly macros</h3></div>
      <div className={s.tilesGrid}>
        <div className={s.corner}/>
        {weekdays.map(d => <div key={d} className={s.colHead}>{d}</div>)}

        {ROWS.map(row => (
          <Fragment key={row.key}>
            <div className={s.rowHead}>{row.label}</div>
            {days.map((day, i) => {
              const a = Math.round(day[row.key] || 0);
              const { char, cls, tip } = cellMark(a, t[row.key]);
              return (

                <div
                    key={i}
                    className={`${s.cell} ${cls}`}
                    title={tip}
                    data-tip={tip}   
                    tabIndex={0}     
                    aria-label={`${row.label} ${tip}`}
                >
                    {char}
                </div>
                );
            })}
          </Fragment>
        ))}
      </div>
      <div className={s.note}>✓ within ~5% of target · ↑ over · ↓ under</div>
    </div>
  );
}
import { Fragment } from 'react';
