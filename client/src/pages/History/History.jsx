import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useDiaryStore from '../../store/diaryStore';
import { thisWeekRange, lastWeekRange, ymdRange } from '../../utils/week';
import useHistoryData from './useHistoryData';
import HistoryHeader from './HistoryHeader';
import KcalBars from './KcalBars';
import MacroTiles from './MacroTiles';
import Footer from '../../components/Footer/Footer';
import s from './History.module.css';

// Tiny date helper for presenting dates to the user in a friendlier D-M-Y form
function toDMY(ymd) {
    const [y, m, d] = ymd.split('-');
    return `${d}-${m}-${y}`;
}

// helpers to map preset -> date range and load/save
function makeRangeFor(key) {
    if (key === 'last') return lastWeekRange();
    if (key === 'last2') {
        const a = lastWeekRange();
        const b = lastWeekRange();
        b.from.setDate(b.from.getDate() - 7);
        return { from: b.from, to: a.to };
    }
    return thisWeekRange();
}

function loadPreset() {

    return localStorage.getItem('ct:historyRange') || 'this';
}

function savePreset(key) {
    localStorage.setItem('ct:historyRange', key);
}

// Shows average cals, adherence(5%), week's calorie state(deficit or surplus)
function computeMetrics(days, targets) {

    const kcalTarget = Number(targets?.calories || 0);
    const total = days.reduce((sum, d) => sum + (d.kcal || 0), 0);
    const avg = days.length ? Math.round(total / days.length) : 0;

    // Count how many days fall within ±5% of daily kcal target
    const within = days.filter(d => {
        if (!kcalTarget) return false;
        const low = kcalTarget * 0.95, high = kcalTarget * 1.05;
        return d.kcal >= low && d.kcal <= high;
    }).length;

    const adherence = days.length ? Math.round((within / days.length) * 100) : 0;
    const weeklyTarget = kcalTarget * days.length;
    const delta = total - weeklyTarget; // + surplus, − deficit
    return { avg, adherence, delta, weeklyTarget, total, kcalTarget };
}

export default function History() {

    const navigate = useNavigate();
    // pull targets and the store's fetch/loading/error
    const { targets, fetchAll, loading: storeLoading, error: storeError } = useDiaryStore();

    // controlled preset + persisted value
    const initialPreset = loadPreset();
    const [preset, setPreset] = useState(initialPreset);
    const [range, setRange] = useState(makeRangeFor(initialPreset));

    const { days, loading, error, fetchWeek } = useHistoryData();

    // ensure targets are loaded on first mount (prevents flash of 0 target after refresh)
    useEffect(() => {
        if (targets == null) fetchAll().catch(() => {});
    }, []); 
    
    // fetch week data when range changes
    useEffect(() => {
        fetchWeek(range.from, range.to);
    }, [range.from, range.to]); 

    const metrics = useMemo(() => computeMetrics(days, targets || {}), [days, targets]);
    const { from, to } = ymdRange(range);
    const rangeLabel = `${toDMY(from)} - ${toDMY(to)}`;

    // Preset range buttons handler (this week / last week / last 2 weeks)
    const onPreset = (key) => {
        setPreset(key);
        savePreset(key);
        setRange(makeRangeFor(key));
    };

    // Clicking a bar navigates to the specific day’s diary 
    const handleBarClick = useCallback((date) => {
        navigate(`/diary?date=${encodeURIComponent(date)}`);
    }, [navigate]);

    const ready = targets != null; 
    const anyLoading = loading || storeLoading;
    const anyError = error || storeError;

  return (
    <>
      <main className="container" style={{ paddingTop: 24, paddingBottom: 100 }}>

        {/* ---------- Weekly Summary Card ---------- */}
        <section className={`card ${s.card}`}>

           <HistoryHeader rangeLabel={rangeLabel} onPreset={onPreset} selected={preset} />

          {!ready && <div className="text-muted">Loading your targets…</div>}

          {ready && (
            <>
              <div className={s.chips}>
                {/* Avg stays neutral */}
                <div className={`${s.chip} ${s.chipNeutral}`}>
                  <strong>{metrics.avg}</strong><span> avg kcal</span>
                </div>

                {/* Adherence: ≥80% green, 50–79% amber, else red */}
                {(() => {
                  const cls =
                    metrics.adherence >= 80 ? s.chipOk :
                    metrics.adherence >= 50 ? s.chipWarn : s.chipBad;
                  return (
                    <div className={`${s.chip} ${cls}`}>
                      <strong>{metrics.adherence}%</strong><span> adherence</span>
                    </div>
                  );
                })()}

                {/* Delta: within ±5% of weekly target = green; surplus = red; deficit = amber */}
                {(() => {
                  const weeklyTarget = metrics.weeklyTarget || 0;
                  const deltaAbsPct = weeklyTarget ? Math.abs(metrics.delta) / weeklyTarget : 1;
                  let cls = s.chipNeutral;
                  if (weeklyTarget && deltaAbsPct <= 0.05) cls = s.chipOk;     // close to target
                  else if (metrics.delta >= 0)               cls = s.chipBad;   // surplus -> red
                  else                                       cls = s.chipWarn;  // deficit -> amber

                  return (
                    <div className={`${s.chip} ${cls}`}>
                      <strong>{metrics.delta >= 0 ? '+' : ''}{metrics.delta}</strong>
                      <span> {metrics.delta >= 0 ? 'surplus' : 'deficit'}</span>
                    </div>
                  );
                })()}
              </div>

              {anyLoading && <div className="text-muted">Loading…</div>}
              {anyError && !anyLoading && <div className="alert">{anyError}</div>}

              {/* --- Calorie bars --- */}
              {!anyLoading && !anyError && (
                <KcalBars
                  days={days}
                  target={targets?.calories ?? 0}
                  onBarClick={handleBarClick}
                />
              )}
            </>
          )}
        </section>

        {/* ---------- Macro Breakdown Card ---------- */}
        <section className={`card ${s.card}`}>
          <MacroTiles
            key={`mt-${days.length}-${targets?.protein||0}-${targets?.carbs||0}-${targets?.fat||0}-${targets?.fiber||0}`}
            days={days}
            targets={targets || {}}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
