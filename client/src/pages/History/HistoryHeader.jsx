import s from './History.module.css';

export default function HistoryHeader({ rangeLabel, onPreset, selected = 'this' }) {
  return (
    <div className={s.headerBar}>
      {/* Left: title + date range */}
      <div className={s.headerLeft}>
        <h2 className={s.h2}>Weekly progress</h2>
        <div className={s.rangeTextStrong}>{rangeLabel}</div>
      </div>

      {/* Right: range selection dropdown */}
      <div className={s.headerRight}>
        <label htmlFor="range-select" className={s.rangeLabelSmall}>
          Select range
        </label>
        <select
          id="range-select"
          className={s.rangeSelect}
          value={selected}
          onChange={(e) => onPreset(e.target.value)}
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
