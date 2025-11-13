import s from './MacroBar.module.css';

/* Macro progress bar component */
export default function MacroBar({ label, value = 0, target = 0 }) {
    // --- Normalize and calculate progress ---
    const v = Math.max(0, Number(value) || 0);
    const t = Math.max(0, Number(target) || 0);
    const pct = t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0;
  // --- Render single macro bar row ---
  return (
    <div className={s.row} aria-label={`${label} ${v} of ${t} grams`}>
      {/* Header: label + numeric values */}
      <div className={s.top}>
        <div className={s.label}>{label}</div>
        <div className={s.right}>{v}g / {t}g</div>
      </div>
      
      {/* Progress bar (filled according to % of target) */}
      <div className={s.bar}>
        <div className={s.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
