import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { peso, useStore } from "../store";
import { useScreenInit } from "../useScreenInit";
import { Button, EmptyState, LinkButton, Panel, PageHeader } from "../ui";

const SPEEDS = [
  { label: "0.5×", ms: 900 },
  { label: "1×", ms: 450 },
  { label: "2×", ms: 220 },
  { label: "4×", ms: 90 },
];

export default function Visualization() {
  const { meals, solution } = useStore();
  const init = useScreenInit();
  const { steps, cols, table, path } = solution;
  const total = steps.length;
  const W = cols.length;

  const [k, setK] = useState(init.step === "end" ? total : 0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(450);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => setK((x) => Math.min(x, total)), [total]);

  useEffect(() => {
    if (!playing) return;
    if (k >= total) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setK((x) => Math.min(total, x + 1)), speed);
    return () => window.clearTimeout(t);
  }, [playing, k, speed, total]);

  const done = total > 0 && k >= total;
  const current = k > 0 && !done ? steps[k - 1] : null;

  const pathSet = useMemo(() => new Set(path.map(([i, c]) => `${i}-${c}`)), [path]);

  // Keep the current cell visible inside the scrollable table.
  useEffect(() => {
    const box = scroller.current;
    if (!box || !current) return;
    const cell = box.querySelector<HTMLElement>(`[data-cell="${current.i}-${current.c}"]`);
    if (!cell) return;
    const left = cell.offsetLeft - 180;
    const right = cell.offsetLeft + cell.offsetWidth - box.clientWidth;
    if (box.scrollLeft > left) box.scrollLeft = Math.max(0, left);
    else if (box.scrollLeft < right) box.scrollLeft = right + 24;
  }, [current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") { setPlaying(false); setK((x) => Math.min(total, x + 1)); }
      if (e.key === "ArrowLeft") { setPlaying(false); setK((x) => Math.max(0, x - 1)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (!meals.length) {
    return (
      <div>
        <PageHeader title="DP Visualization" />
        <Panel>
          <EmptyState
            title="No meals to fill the table with"
            body="Add meals in the Meal Planner to watch the DP table fill step by step."
            action={<LinkButton to="/planner" variant="primary">Go to Meal Planner</LinkButton>}
          />
        </Panel>
      </div>
    );
  }

  const filled = (i: number, c: number) => i === 0 || (i - 1) * W + c < k;
  const isCur = (i: number, c: number) => !!current && current.i === i && current.c === c;
  const isRef = (i: number, c: number) =>
    !!current && i === current.i - 1 && (c === current.c || c === current.takeFrom);

  const meal = current ? meals[current.i - 1] : null;

  return (
    <div>
      <PageHeader
        title="DP Visualization"
        description={
          <>Each cell <span className="font-mono">dp[i][b]</span> holds the best value using the first <em>i</em> meals with budget <em>b</em>.
            {solution.unit > 1 && <> Columns step by {peso(solution.unit)}, the common factor of every price.</>}</>
        }
      />

      <Panel className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => { setPlaying(false); setK((x) => Math.max(0, x - 1)); }} disabled={k === 0} title="Previous Step (←)">
              <ChevronLeft className="size-4" strokeWidth={2} /> Previous Step
            </Button>
            <Button onClick={() => { setPlaying(false); setK((x) => Math.min(total, x + 1)); }} disabled={done} title="Next Step (→)">
              Next Step <ChevronRight className="size-4" strokeWidth={2} />
            </Button>
            <Button
              variant="primary"
              disabled={playing}
              onClick={() => { if (done) setK(0); setPlaying(true); }}
            >
              <Play className="size-4" strokeWidth={2} /> {done ? "Replay" : "Play"}
            </Button>
            <Button disabled={!playing} onClick={() => setPlaying(false)}>
              <Pause className="size-4" strokeWidth={2} /> Pause
            </Button>
            <Button variant="ghost" onClick={() => { setPlaying(false); setK(0); }} disabled={k === 0}>
              <RotateCcw className="size-4" strokeWidth={2} /> Reset
            </Button>
            <label className="flex items-center gap-2 text-sm text-muted ml-1">
              Speed
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-10 rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
              >
                {SPEEDS.map((s) => <option key={s.ms} value={s.ms}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <div className="lg:w-64">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-semibold">Step {k} of {total}</span>
              <span className="text-muted tabular-nums">{Math.round((k / Math.max(1, total)) * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={total} value={k}
              onChange={(e) => { setPlaying(false); setK(Number(e.target.value)); }}
              aria-label="Jump to step"
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-subtle px-4 py-4 min-h-[112px]">{/* ds-ok: keeps height steady between steps */}
          {!current && !done && (
            <div>
              <p className="font-semibold">Row 0 is the base case</p>
              <p className="text-sm text-muted mt-1">
                With no meals, the best value at every budget is 0. Press Play or Next to fill row 1.
              </p>
            </div>
          )}
          {current && meal && !done && (
            <div className="grid gap-4">
              <dl className="grid gap-x-6 gap-y-3 grid-cols-2 md:grid-cols-5 text-sm">
                <div>
                  <dt className="text-muted">Current item</dt>
                  <dd className="font-semibold">{meal.name} <span className="text-muted font-normal">({peso(meal.price)}, {meal.value})</span></dd>
                </div>
                <div>
                  <dt className="text-muted">Current budget</dt>
                  <dd className="font-semibold font-mono">{peso(current.budget)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Current cell</dt>
                  <dd className="font-semibold font-mono">dp[{current.i}][{peso(current.budget)}]</dd>
                </div>
                <div>
                  <dt className="text-muted">Previous value</dt>
                  <dd className="font-semibold font-mono">{current.skip}</dd>
                </div>
                <div>
                  <dt className="text-muted">New value</dt>
                  <dd className={`font-bold font-mono text-lg leading-tight ${current.took ? "text-primary" : ""}`}>{current.value}</dd>
                </div>
              </dl>
              <div className="grid gap-1 text-sm border-t border-border-strong pt-3">
                <p className="font-mono">Skip: dp[{current.i - 1}][{peso(current.budget)}] = <b>{current.skip}</b></p>
                {current.take !== null && current.takeFrom !== null ? (
                  <p className="font-mono">Take: {meal.value} + dp[{current.i - 1}][{peso(cols[current.takeFrom])}] = {meal.value} + {current.take - meal.value} = <b>{current.take}</b></p>
                ) : (
                  <p className="font-mono text-muted">Take: not possible</p>
                )}
                <p className="mt-1">
                  <b className={current.took ? "text-primary-ink" : ""}>{current.took ? "Take it. " : "Skip it. "}</b>
                  {current.take === null
                    ? `${meal.name} costs ${peso(meal.price)}, more than the ${peso(current.budget)} budget, so the value from the row above is kept.`
                    : current.took
                      ? `Taking ${meal.name} gives ${current.take}, which beats ${current.skip} without it.`
                      : current.take === current.skip
                        ? `Taking ${meal.name} gives ${current.take}, the same as skipping it, so the previous value is kept.`
                        : `Taking ${meal.name} gives only ${current.take}, less than ${current.skip} without it.`}
                </p>
              </div>
            </div>
          )}
          {done && (
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">Table complete. Tracing back from dp[{meals.length}][{peso(cols[W - 1])}]</p>
                <p className="text-sm text-muted mt-1">
                  Walking up the rows: where a value changed from the row above, that meal was taken and its price is subtracted.
                  Chosen: {solution.selected.map((m) => m.name).join(", ") || "none"}.
                </p>
              </div>
              <LinkButton to="/results" variant="secondary">View meal plan</LinkButton>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <span className="flex items-center gap-2"><span className="size-3.5 rounded-sm bg-accent" /> Current cell</span>
          <span className="flex items-center gap-2"><span className="size-3.5 rounded-sm bg-accent-soft ring-2 ring-accent-ring" /> Compared cells</span>
          <span className="flex items-center gap-2"><span className="size-3.5 rounded-sm bg-primary-soft ring-2 ring-primary" /> Traceback path</span>
          <span className="flex items-center gap-2"><span className="size-3.5 rounded-sm bg-primary" /> Meal taken</span>
        </div>

        <div ref={scroller} className="mt-4 overflow-x-auto border border-border rounded-lg">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-subtle">
                <th className="sticky left-0 z-10 bg-subtle text-left font-semibold px-3 py-2 min-w-[180px] border-b border-border">{/* ds-ok: sticky label column width */}
                  Meal \ Budget
                </th>
                {cols.map((b, c) => (
                  <th key={c} className={`px-1 py-2 font-mono text-xs font-semibold min-w-12 border-b border-border ${current && current.c === c && !done ? "text-accent-ink bg-accent-soft" : "text-muted"}`}>
                    {peso(b)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => {
                const m = i > 0 ? meals[i - 1] : null;
                const selected = i > 0 && solution.selectedIdx.includes(i - 1);
                return (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <th
                      scope="row"
                      className={`sticky left-0 z-10 text-left font-normal px-3 py-1.5 border-r border-border ${current && current.i === i && !done ? "bg-accent-soft" : done && selected ? "bg-primary-soft" : "bg-surface"}`}
                    >
                      <span className="font-mono text-xs text-muted mr-2">{i}</span>
                      {m ? (
                        <>
                          <span className="font-semibold">{m.name}</span>
                          <span className="block text-xs text-muted pl-5">{peso(m.price)} · value {m.value}</span>
                        </>
                      ) : (
                        <span className="text-muted">No meals</span>
                      )}
                    </th>
                    {row.map((v, c) => {
                      const show = filled(i, c);
                      const cur = isCur(i, c);
                      const ref = isRef(i, c);
                      const onPath = done && pathSet.has(`${i}-${c}`);
                      const takenHere = onPath && i > 0 && solution.took[i][c];
                      let cls = "text-foreground";
                      if (cur) cls = "bg-accent text-accent-ink font-bold";
                      else if (ref) cls = "bg-accent-soft ring-2 ring-inset ring-accent-ring font-semibold";
                      else if (takenHere) cls = "bg-primary text-primary-foreground font-bold";
                      else if (onPath) cls = "bg-primary-soft ring-2 ring-inset ring-primary text-primary-ink font-semibold";
                      else if (!show) cls = "text-transparent";
                      else if (i > 0 && solution.took[i][c]) cls = "text-primary-ink";
                      return (
                        <td
                          key={c}
                          data-cell={`${i}-${c}`}
                          className={`text-center font-mono tabular-nums px-1 py-1.5 ${cls}`}
                        >
                          {show ? v : "·"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {W > 120 && (
          <p className="mt-3 text-sm text-muted">
            This table has {W} budget columns. Prices in multiples of ₱5 or ₱10 make it shorter and easier to follow.
          </p>
        )}
      </Panel>
    </div>
  );
}
