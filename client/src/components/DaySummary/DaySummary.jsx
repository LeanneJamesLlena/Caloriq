import MacroBar from '../MacroBar/MacroBar';
import s from './DaySummary.module.css';

export default function DaySummary({ eaten = 0, targets = {}, macros = {} }) {
    const kcalTarget = Math.max(0, Number(targets.calories) || 0);
    const kcalEaten  = Math.max(0, Number(eaten) || 0);
    const remaining  = Math.max(0, kcalTarget - kcalEaten);
    // Progress 0–100%
    const pct = kcalTarget > 0 ? Math.min(1, kcalEaten / kcalTarget) : 0;
    // Simple ring setup
    const size = 160;
    const stroke = 14;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = c * pct;

  return (
    <section className={`card ${s.card}`}>
      <div className={s.grid}>
        {/* Ring */}
        <div className={s.ringWrap}>
          <svg width={size} height={size} className={s.svg} aria-label="calories progress">
            <circle cx={size/2} cy={size/2} r={r} stroke="#e8eef5" strokeWidth={stroke} fill="none" />
            <circle
              cx={size/2}
              cy={size/2}
              r={r}
              stroke="#0ea5e9"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${size/2} ${size/2})`}
              className={s.ring}
            />
          </svg>
          <div className={s.center}>
            <div className={s.big}>{remaining}</div>
            <div className={s.sub}>Remaining</div>
          </div>

        <div className={s.meta}>
            <div>{kcalEaten}<span> Eaten</span></div>
            <div>{kcalTarget}<span> Target</span></div>
        </div>

        </div>

        {/* Macro bars */}
        <div className={s.right}>
          <div style={{fontWeight:700, marginBottom:4}}>Macros</div>
          <MacroBar label="Protein" value={Math.round(macros.protein || 0)} target={Math.round(targets.protein || 0)} />
          <MacroBar label="Carbs"   value={Math.round(macros.carbs   || 0)} target={Math.round(targets.carbs   || 0)} />
          <MacroBar label="Fat"     value={Math.round(macros.fat     || 0)} target={Math.round(targets.fat     || 0)} />
          <MacroBar label="Fiber"   value={Math.round(macros.fiber   || 0)} target={Math.round(targets.fiber   || 0)} />
        </div>
      </div>
    </section>
  );
}
