import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { peso, useStore } from "../store";
import { LinkButton, Panel, Formula } from "../ui";

export default function Home() {
  const { budget, meals, solution } = useStore();
  const rows = meals.length + 1;
  const cols = solution.cols.length;

  const pipeline = [
    { title: "Problem", to: "/algorithm", detail: "Best meals for a limited budget" },
    {
      title: "Input", to: "/planner",
      detail: `${meals.length} ${meals.length === 1 ? "meal" : "meals"} · ${peso(budget)} budget`,
    },
    { title: "DP Algorithm", to: "/algorithm", detail: "Skip or take each meal" },
    { title: "DP Table", to: "/visualization", detail: `${rows} × ${cols} cells` },
    { title: "Step-by-Step", to: "/visualization", detail: `${solution.steps.length} calculations` },
    {
      title: "Optimal Solution", to: "/results",
      detail: meals.length ? `${solution.selected.length} meals · value ${solution.totalValue}` : "Add meals first",
    },
    { title: "Complexity", to: "/complexity", detail: "O(n × B) time · O(B) space" },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">Algorithm and Complexity project</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight">SmartMeal DP</h1>
          <p className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-muted">
            A Dynamic Programming-Based Meal & Food Budget Planner
          </p>
          <p className="mt-5 text-muted text-lg leading-relaxed max-w-xl">
            Enter your food budget and the meals you can buy. SmartMeal DP uses Dynamic Programming, the 0/1 Knapsack
            algorithm, to pick the combination with the highest nutrition value without going over your budget.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <LinkButton to="/planner" variant="primary" className="h-12 px-6 text-base">
              Start Planning <ArrowRight className="size-5" strokeWidth={2} />
            </LinkButton>
            <LinkButton to="/visualization" className="h-12 px-5 text-base">Watch the DP table</LinkButton>
          </div>
        </div>

        <Panel className="p-5">
          <p className="text-sm font-semibold text-muted">Current best plan</p>
          {meals.length ? (
            <>
              <ul className="mt-3 divide-y divide-border">
                {solution.selected.map((m) => (
                  <li key={m.id} className="flex justify-between py-2.5 text-sm">
                    <span className="font-medium">{m.name}</span>
                    <span className="font-mono tabular-nums text-muted">{peso(m.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-dashed border-border-strong flex justify-between items-baseline">
                <span className="text-sm text-muted">{peso(solution.totalCost)} of {peso(budget)}</span>
                <span className="text-2xl font-extrabold tabular-nums text-primary">
                  {solution.totalValue}
                  <span className="ml-1 text-sm font-semibold text-muted">value</span>
                </span>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No meals yet. <Link to="/planner" className="text-primary font-semibold underline">Add meals</Link> to see a plan.
            </p>
          )}
        </Panel>
      </section>

      <section aria-labelledby="pipeline">
        <h2 id="pipeline" className="text-lg font-bold tracking-tight mb-4">From problem to answer</h2>
        <ol className="grid gap-px rounded-xl overflow-hidden border border-border bg-border sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {pipeline.map((p, i) => (
            <li key={p.title} className="bg-surface">
              <Link to={p.to} className="group block h-full p-4 hover:bg-subtle">
                <span className="font-mono text-xs font-semibold text-primary">0{i + 1}</span>
                <p className="mt-1 font-bold group-hover:text-primary-ink group-hover:underline">{p.title}</p>
                <p className="mt-1 text-sm text-muted">{p.detail}</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <Panel className="p-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight">How Dynamic Programming helps</h2>
          <p className="mt-3 text-muted leading-relaxed">
            Trying every combination of meals doubles the work with each meal you add. Dynamic Programming instead
            answers small questions first, like “what's the best I can get with ₱40?”, stores each answer in a table,
            and reuses them to answer the full budget. Each meal is either bought once or skipped, which makes this a
            0/1 Knapsack problem.
          </p>
          <div className="mt-4">
            <LinkButton to="/algorithm" variant="ghost" className="-ml-4">Read the algorithm explanation <ArrowRight className="size-4" strokeWidth={2} /></LinkButton>
          </div>
        </div>
        <div className="space-y-4">
          <Formula>dp[i][b] = max( dp[i−1][b], value<sub>i</sub> + dp[i−1][b − price<sub>i</sub>] )</Formula>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted">Knapsack capacity</p>
              <p className="font-semibold">Budget (₱)</p>
            </div>
            <div>
              <p className="text-muted">Item weight</p>
              <p className="font-semibold">Food price</p>
            </div>
            <div>
              <p className="text-muted">Item value</p>
              <p className="font-semibold">Nutrition score</p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
