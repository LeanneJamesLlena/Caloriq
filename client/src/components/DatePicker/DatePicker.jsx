import s from './DatePicker.module.css';

export default function DatePicker({ value, onChange }) {
    // Move selection by N days
    const addDays = (n) => {
        const d = new Date(value);
        d.setDate(d.getDate() + n);
        onChange(d);
    };
    // Handle manual <input type="date"> edits
    const onInputChange = (e) => {
        const [yyyy, mm, dd] = e.target.value.split('-').map(Number);
        if (!yyyy || !mm || !dd) return;
        onChange(new Date(yyyy, mm - 1, dd));
    };

    // dynamic title ("Today" / "Yesterday" / "Tomorrow" / weekday) 
    const titleLabel = (() => {
        const today = new Date();
        const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const d0 = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        const diff = Math.round((d0 - t0) / 86400000); // day difference
        if (diff === 0) return 'Today';
        if (diff === -1) return 'Yesterday';
        if (diff === 1) return 'Tomorrow';
        return d0.toLocaleDateString(undefined, { weekday: 'long' });
    })();
    // Subtitle under the title (e.g., "Wednesday, 5 Nov")
    const subLabel = value.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    });
    // Value for the native date input (YYYY-MM-DD)
    const inputValue = [
        value.getFullYear(),
        String(value.getMonth() + 1).padStart(2, '0'),
        String(value.getDate()).padStart(2, '0'),
    ].join('-');

  return (
    <div className={s.wrap}>
      <button type="button" className={s.arrow} onClick={() => addDays(-1)}>
        ← Yesterday
      </button>

      <div className={s.center}>
        <div className={s.title}>{titleLabel}</div>
        <div className={s.sub}>{subLabel}</div>
        <input
          className={s.inputDate}
          type="date"
          value={inputValue}
          onChange={onInputChange}
        />
      </div>

      <button type="button" className={s.arrow} onClick={() => addDays(1)}>
        Tomorrow →
      </button>
    </div>
  );
}
