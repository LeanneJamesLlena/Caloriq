import s from './History.module.css';
// Header component displaying the title and range selector
export default function HistoryHeader({ rangeLabel, onPreset }) {
  return (
    <div className={s.headerRow}>
      <div>
        <h2 className={s.h2}>Weekly Progress</h2>
        <div className={s.rangeText} aria-live="polite">{rangeLabel}</div>
      </div>

      <div className={s.rightRow}>
        <label className="sr-only" htmlFor="range-select">Select range</label>
        <select
          id="range-select"
          className={s.select}
          onChange={(e) => onPreset(e.target.value)}
          defaultValue="this"
          aria-label="Select date range"
        >
          <option value="this">This week</option>
          <option value="last">Last week</option>
          <option value="last2">Last 2 weeks</option>
        </select>
      </div>
    </div>
  );
}
