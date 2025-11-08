import s from './MacroBar.module.css';

export default function MacroBar({ label, value = 0, target = 0 }) {
    const v = Math.max(0, Number(value) || 0);
    const t = Math.max(0, Number(target) || 0);
    const pct = t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0;

  return (
    <div className={s.row} aria-label={`${label} ${v} of ${t} grams`}>
      <div className={s.top}>
        <div className={s.label}>{label}</div>
        <div className={s.right}>{v}g / {t}g</div>
      </div>
      <div className={s.bar}>
        <div className={s.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
