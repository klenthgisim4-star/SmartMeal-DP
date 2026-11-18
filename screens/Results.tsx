import { useMemo } from "react";
import { Check } from "lucide-react";
import { topPlans } from "../knapsack";
import { peso, useStore } from "../store";
import { EmptyState, LinkButton, Panel, PanelHeader, PageHeader, Progress } from "../ui";

export default function Results() {
  const { meals, budget, solution } = useStore();
  const { selected, selectedIdx, totalCost, totalValue, remaining } = solution;
  const plans = useMemo(() => topPlans(meals, budget, 3), [meals, budget]);

  if (!meals.length) {
    return (
      <div>
        <PageHeader title="Results" />
        <Panel>
          <EmptyState
            title="No meal plan yet"
            body="Add food items and a budget in the Meal Planner to get your optimal plan."
            action={<LinkButton to="/planner" variant="primary">Go to Meal Planner</LinkButton>}
          />
        </Panel>
      </div>
    );
  }

  const skipped = meals.filter((_, i) => !selectedIdx.includes(i));
  const usedPct = budget > 0 ? Math.round((totalCost / budget) * 100) : 0;
  const bestKey = [...selectedIdx].sort((a, b) => a - b).join(",");
  // Alternatives: the top plans that aren't the DP's chosen plan.
  const alternatives = plans.filter((p) => p.idx.join(",") !== bestKey).slice(0, 2);

  const summary = [
    { label: "Total budget", value: peso(budget) },
    { label: "Total cost", value: peso(totalCost) },
    { label: "Remaining budget", value: peso(remaining) },
    { label: "Selected items", value: String(selected.length) },
  ];

  return (
    <div>
      <PageHeader
        title="Results"
        description="Optimization summary from the 0/1 Knapsack DP table."
        action={<LinkButton to="/visualization">See how it was computed</LinkButton>}
      />

      <Panel className="p-6">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="lg:pr-8 lg:border-r lg:border-border">
            <p className="text-sm font-semibold text-muted">Total nutrition score</p>
            <p className="text-6xl font-extrabold tracking-tight tabular-nums text-primary">{totalValue}</p>
          </div>
          <div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {summary.map((s) => (
                <div key={s.label}>
                  <dt className="text-sm text-muted">{s.label}</dt>
                  <dd className="text-xl font-bold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Budget used</span>
                <span className="text-muted tabular-nums">{usedPct}%</span>
              </div>
              <Progress value={totalCost} max={budget} label="Budget used" />
            </div>
          </div>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
        <Panel>
          <PanelHeader title="Selected food items" />
          {selected.length ? (
            <ul className="px-5 pb-2">
              {selected.map((m) => (
                <li key={m.id} className="animate-rise-in flex items-center gap-3 py-3 border-t border-border">
                  <Check className="size-4 text-primary shrink-0" strokeWidth={2.5} aria-hidden />
                  <span className="flex-1">
                    <span className="font-semibold">{m.name}</span>
                    {m.category && <span className="ml-2 text-sm text-muted">{m.category}</span>}
                  </span>
                  <span className="text-sm text-muted tabular-nums">value {m.value}</span>
                  <span className="font-mono tabular-nums w-16 text-right">{peso(m.price)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 pb-5 text-sm text-muted">
              No food item fits a {peso(budget)} budget. The cheapest costs {peso(Math.min(...meals.map((m) => m.price)))}.
            </p>
          )}
        </Panel>

        <Panel>
          <PanelHeader title={<>Not selected <span className="text-muted font-semibold">{skipped.length}</span></>} />
          {skipped.length ? (
            <ul className="px-5 pb-3">
              {skipped.map((m) => (
                <li key={m.id} className="flex justify-between py-2.5 border-t border-border text-sm text-muted">
                  <span>{m.name}</span>
                  <span className="font-mono tabular-nums">{peso(m.price)} · {m.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 pb-5 text-sm text-muted">Every food item fits your budget.</p>
          )}
        </Panel>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold tracking-tight">Compare alternative plans</h2>
        <p className="text-sm text-muted mt-1">
          Close runners-up to the best plan. The DP returns only the best one, so these are found by checking every affordable combination.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[{ name: "Best Plan", idx: selectedIdx, cost: totalCost, value: totalValue, best: true },
            ...alternatives.map((p, i) => ({ name: `Alternative Plan ${i + 1}`, idx: p.idx, cost: p.cost, value: p.value, best: false }))]
            .map((p) => (
              <Panel key={p.name} className={`p-5 flex flex-col ${p.best ? "border-primary ring-1 ring-primary" : ""}`}>
                <div className="flex items-baseline justify-between">
                  <h3 className={`font-bold ${p.best ? "text-primary-ink" : ""}`}>{p.name}</h3>
                  <span className="text-2xl font-extrabold tabular-nums">{p.value}</span>
                </div>
                <ul className="mt-3 text-sm space-y-1 flex-1">
                  {p.idx.map((j) => (
                    <li key={j} className="flex justify-between">
                      <span>{meals[j].name}</span>
                      <span className="font-mono tabular-nums text-muted">{peso(meals[j].price)}</span>
                    </li>
                  ))}
                  {!p.idx.length && <li className="text-muted">No items</li>}
                </ul>
                <dl className="mt-4 pt-3 border-t border-dashed border-border-strong grid grid-cols-3 gap-2 text-sm">
                  <div><dt className="text-muted">Cost</dt><dd className="font-semibold tabular-nums">{peso(p.cost)}</dd></div>
                  <div><dt className="text-muted">Remaining</dt><dd className="font-semibold tabular-nums">{peso(budget - p.cost)}</dd></div>
                  <div><dt className="text-muted">Score</dt><dd className="font-semibold tabular-nums">{p.value}</dd></div>
                </dl>
              </Panel>
            ))}
        </div>
        {alternatives.length === 0 && (
          <p className="mt-3 text-sm text-muted">No other combination fits this budget.</p>
        )}
      </section>
    </div>
  );
}
