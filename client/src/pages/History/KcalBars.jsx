import s from './KcalBars.module.css';

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Days of the week used for labeling bars
function toDMY(ymd) {
    const [y, m, d] = ymd.split('-');
    return `${d}-${m}-${y}`;
}
// Converts YYYY-MM-DD → D-M-Y format for readable display
function weekdayFromYMD(ymd) {
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return WEEKDAYS[dt.getUTCDay()];
}

// Bar chart for displaying daily calorie intake vs target
export default function KcalBars({ days, target = 0, onBarClick }) {
    // Find the largest kcal value for scaling
    const maxKcal = Math.max(target, ...days.map(d => d.kcal || 0));
    // Display max is slightly higher to create visual headroom
    const displayMax = Math.max(1, Math.ceil(maxKcal * 1.1), Math.ceil(target * 1.25));
    // Target line position (percentage from bottom)
    const targetPct = Math.min(100, Math.round((target / displayMax) * 100));

  return (
    <div className={s.kcalCard}>
    {/* ---------- Header (title + legend) ---------- */}
      <div className={s.kcalHeader}>
        <div className={s.kcalTitle}>Weekly calories</div>
        <div className={s.legend}>
          <span className={s.swatchLine}/> Target
          <span className={s.swatchBar}/> Calories
        </div>
      </div>

      {/* ---------- Bar chart plot area ---------- */}
      <div className={s.kcalChart} aria-label="Weekly calories chart">
        <div className={s.plot}>
          <div className={s.targetLine} style={{ bottom: `${targetPct}%` }} aria-hidden />
          
          {/* One bar per day (Mon–Sun) */}
          {days.map((d, i) => {
            const pct = Math.min(100, Math.round(((d.kcal || 0) / displayMax) * 100));
            const flip = pct > 80; // flip earlier so tooltip never overflows the top
            const label = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i];

            return (
              <button
                key={d.date}
                className={s.barWrap}
                title={`${d.date}: ${d.kcal} kcal`}
                aria-label={`${d.date}: ${d.kcal} kcal`}
                onClick={() => onBarClick?.(d.date)}
                type="button"
              > 
                {/* Vertical bar */}
                <div className={s.bar} style={{ height: `${pct}%` }} />

                 {/* Label under each bar */}
                <div className={s.barLabel}>{label}</div>

                {/* Tooltip — above by default, flips below when bar is very tall */}
                <div
                  className={`${s.tooltip} ${flip ? s.tooltipBelow : ''}`}
                  style={{
                    bottom: flip
                      ? `calc(${pct}% - 8px)`    
                      : `calc(${pct}% + 26px)`   
                  }}
                  role="tooltip"
                >
                  <div className={s.tooltipInner}>
                    <strong>{d.kcal}</strong> kcal
                    <div className={s.tooltipDate}>
                      {weekdayFromYMD(d.date)} {toDMY(d.date)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
