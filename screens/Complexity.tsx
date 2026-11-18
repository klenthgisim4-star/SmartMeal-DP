import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2 } from "lucide-react";
import { bruteForce, solveKnapsack1D, SOURCE_1D } from "../knapsack";
import { peso, useStore } from "../store";
import { Code, Panel, PageHeader } from "../ui";

const fmt = (n: number) => n.toLocaleString("en-PH");

export default function Complexity() {
  const { meals, budget, solution } = useStore();
  const n = meals.length;
  const B = budget;

  const oneD = useMemo(() => solveKnapsack1D(meals, budget), [meals, budget]);
  const brute = useMemo(() => bruteForce(meals, budget), [meals, budget]);
  const cells2D = (n + 1) * (B + 1);

  const chart = useMemo(
    () =>
      Array.from({ length: 20 }, (_, k) => {
        const items = k + 1;
        return { n: items, brute: 2 ** items, dp: items * (B + 1) };
      }),
    [B],
  );

  const agree = n > 0 && brute !== null && brute.best === oneD.best && oneD.best === solution.totalValue;

  return (
    <div>
      <PageHeader
        title="Complexity"
        description="How the running time and memory of 0/1 Knapsack DP grow with the number of meals (n) and the budget (B)."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Panel className="p-6">
          <p className="text-sm font-semibold text-muted">Time complexity</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight font-mono">O(n × B)</p>
          <p className="mt-3 text-muted leading-relaxed">
            Two nested loops: n meals times B + 1 budgets. Each cell does constant work, one comparison of skip vs take.
          </p>
          <p className="mt-4 pt-4 border-t border-border text-sm">
            Your input: n = {n}, B = {fmt(B)} → <b className="tabular-nums">{fmt(oneD.ops)}</b> cell updates
          </p>
        </Panel>
        <Panel className="p-6">
          <p className="text-sm font-semibold text-muted">Space complexity</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight font-mono">O(B)</p>
          <p className="mt-3 text-muted leading-relaxed">
            Row i only reads row i − 1, so one array of B + 1 values is enough when we loop budgets from high to low.
            The full 2D table, O(n × B), is kept only to draw the visualization and trace back the chosen meals.
          </p>
          <p className="mt-4 pt-4 border-t border-border text-sm">
            Your input: 1D array of <b className="tabular-nums">{fmt(oneD.arraySize)}</b> values vs 2D table of{" "}
            <b className="tabular-nums">{fmt(cells2D)}</b>
          </p>
        </Panel>
      </div>

      <Panel className="mt-6 p-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-base font-bold tracking-tight">What n and B mean</h2>
          <dl className="mt-3 divide-y divide-border">
            <div className="py-3 grid grid-cols-[48px_1fr] gap-3">
              <dt className="font-mono text-xl font-bold">n</dt>
              <dd><span className="font-semibold">Number of food items.</span> <span className="text-muted">Each one adds a row to the DP table.</span></dd>
            </div>
            <div className="py-3 grid grid-cols-[48px_1fr] gap-3">
              <dt className="font-mono text-xl font-bold">B</dt>
              <dd><span className="font-semibold">Available budget (capacity) in pesos.</span> <span className="text-muted">Each peso adds a column.</span></dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Work grows in a straight line with both: twice the food choices or twice the budget means about twice the
            calculations. Brute force instead doubles with every single item added.
          </p>
        </div>
        <div className="overflow-x-auto">
          <h2 className="text-base font-bold tracking-tight">How growth changes the work</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="text-left font-semibold py-2">Scenario</th>
                <th className="text-right font-semibold py-2">n</th>
                <th className="text-right font-semibold py-2">B</th>
                <th className="text-right font-semibold py-2">DP, n × (B + 1)</th>
                <th className="text-right font-semibold py-2">Brute force, 2ⁿ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {[
                { s: "Your input", n: n, b: B },
                { s: "Twice the food items", n: n * 2, b: B },
                { s: "Twice the budget", n: n, b: B * 2 },
                { s: "Both doubled", n: n * 2, b: B * 2 },
              ].map((r) => (
                <tr key={r.s} className={r.s === "Your input" ? "font-semibold" : ""}>
                  <td className="py-2.5">{r.s}</td>
                  <td className="py-2.5 text-right font-mono">{r.n}</td>
                  <td className="py-2.5 text-right font-mono">{peso(r.b)}</td>
                  <td className="py-2.5 text-right font-mono">{fmt(r.n * (r.b + 1))}</td>
                  <td className="py-2.5 text-right font-mono">{fmt(2 ** r.n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr] items-start">
        <Panel className="p-6">
          <h2 className="text-base font-bold tracking-tight">Operations vs number of meals</h2>
          <p className="text-sm text-muted mt-1">Budget fixed at {peso(B)}. Log scale.</p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="#e7ece4" vertical={false} />
                <XAxis dataKey="n" tick={{ fontSize: 12, fill: "#56645c" }} label={{ value: "Meals (n)", position: "insideBottom", offset: -4, fontSize: 12, fill: "#56645c" }} />
                <YAxis
                  scale="log" domain={[1, 2 ** 21]} ticks={[1, 10, 100, 1e3, 1e4, 1e5, 1e6]}
                  tickFormatter={(v: number) => (v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}k` : `${v}`)}
                  tick={{ fontSize: 12, fill: "#56645c" }} width={52}
                  label={{ value: "Operations", angle: -90, position: "insideLeft", fontSize: 12, fill: "#56645c" }}
                />
                <Tooltip formatter={(v) => fmt(Number(v))} labelFormatter={(l) => `n = ${l}`} />
                <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="brute" name="Brute force, 2ⁿ subsets" stroke="#b93c2a" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                <Line type="monotone" dataKey="dp" name="DP, n × (B + 1) cells" stroke="#2d7a4c" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-muted">
            O(n × B) is pseudo-polynomial: it grows with the budget's numeric value, not just the input size. For small
            budgets like daily food money, it is far faster than checking every subset.
          </p>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="text-base font-bold tracking-tight">Check on your meals</h2>
            {n === 0 ? (
              <p className="mt-2 text-sm text-muted">Add meals in the Meal Planner to compare methods.</p>
            ) : (
              <>
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="text-muted border-b border-border">
                      <th className="text-left font-semibold py-2">Method</th>
                      <th className="text-right font-semibold py-2">Work</th>
                      <th className="text-right font-semibold py-2">Best value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono tabular-nums">
                    <tr>
                      <td className="py-2.5 font-sans">DP table (2D)</td>
                      <td className="py-2.5 text-right">{fmt(solution.steps.length)} cells</td>
                      <td className="py-2.5 text-right font-semibold">{solution.totalValue}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans">DP array (1D)</td>
                      <td className="py-2.5 text-right">{fmt(oneD.ops)} updates</td>
                      <td className="py-2.5 text-right font-semibold">{oneD.best}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans">Brute force</td>
                      <td className="py-2.5 text-right">{brute ? `${fmt(brute.combos)} subsets` : "too many"}</td>
                      <td className="py-2.5 text-right font-semibold">{brute ? brute.best : "–"}</td>
                    </tr>
                  </tbody>
                </table>
                {agree && (
                  <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary-ink">
                    <CheckCircle2 className="size-4 text-primary" strokeWidth={2} /> All three methods agree
                  </p>
                )}
                {solution.unit > 1 && (
                  <p className="mt-2 text-sm text-muted">
                    The 2D table groups budgets in {peso(solution.unit)} steps (the common factor of all prices), so it needs fewer cells.
                  </p>
                )}
              </>
            )}
          </Panel>

          <Panel className="p-6">
            <h2 className="text-base font-bold tracking-tight mb-4">O(B) space version</h2>
            <Code>{SOURCE_1D}</Code>
          </Panel>
        </div>
      </div>
    </div>
  );
}
