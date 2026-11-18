import type { ReactNode } from "react";
import { SOURCE_2D } from "../knapsack";
import { Code, Formula, LinkButton, Panel, PageHeader } from "../ui";

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <Panel className="p-6">
      <p className="font-mono text-xs font-semibold text-primary">0{n}</p>
      <h2 className="mt-1 text-lg font-bold tracking-tight">{title}</h2>
      <div className="mt-3 text-muted leading-relaxed space-y-3">{children}</div>
    </Panel>
  );
}

export default function Algorithm() {
  return (
    <div>
      <PageHeader
        title="Algorithm"
        description="How SmartMeal DP turns a food budget into the best meal plan, explained step by step."
        action={<LinkButton to="/visualization">Step through it</LinkButton>}
      />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-6">
          <Section n={1} title="What is Dynamic Programming?">
            <p>
              Dynamic Programming (DP) solves a big problem by splitting it into smaller subproblems, solving each one
              only once, and saving the answers in a table. When the same subproblem appears again, DP looks up the saved
              answer instead of solving it again.
            </p>
            <p>It works when a problem has two properties: overlapping subproblems and optimal substructure.</p>
          </Section>

          <Section n={2} title="What is the 0/1 Knapsack Problem?">
            <p>
              You have a knapsack that can carry a limited weight and a set of items, each with a weight and a value.
              Choose items to get the highest total value without going over the weight limit.
            </p>
            <p>
              “0/1” means each item is either left out (0) or taken once (1). You can't take part of an item or the same
              item twice.
            </p>
          </Section>

          <Section n={3} title="Why a meal budget is a Knapsack problem">
            <p>Your wallet is the knapsack. Every food item has a cost and a benefit, and you can only spend so much.</p>
            <table className="w-full text-sm text-foreground">
              <thead>
                <tr className="text-muted border-b border-border">
                  <th className="text-left font-semibold py-2">Knapsack</th>
                  <th className="text-left font-semibold py-2">SmartMeal DP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="py-2.5">Capacity</td><td className="py-2.5 font-semibold">Food budget B (₱)</td></tr>
                <tr><td className="py-2.5">Item weight</td><td className="py-2.5 font-semibold">Food price</td></tr>
                <tr><td className="py-2.5">Item value</td><td className="py-2.5 font-semibold">Nutrition/value score</td></tr>
                <tr><td className="py-2.5">Take once or not</td><td className="py-2.5 font-semibold">Buy the food item once or skip it</td></tr>
              </tbody>
            </table>
          </Section>

          <Section n={4} title="Overlapping subproblems">
            <p>
              While planning ₱150, you keep asking the same smaller questions, like “what's the best I can get with ₱60
              using the first 2 items?”. Different choices lead back to the same question many times.
            </p>
            <p>DP answers each of these once and stores it in a cell of the table.</p>
          </Section>

          <Section n={5} title="Optimal substructure">
            <p>
              The best plan for a budget is built from the best plan for a smaller budget. If the best ₱150 plan includes
              Sandwich (₱60), then the rest of that plan must be the best possible plan for the remaining ₱90.
            </p>
          </Section>
        </div>

        <div className="space-y-6">
          <Section n={6} title="How the DP table works">
            <p>
              Each row is a food item and each column is a budget. Cell dp[i][b] holds the best score using the first i
              items with budget b. Row 0 and column ₱0 start at 0. Every other cell compares two choices:
            </p>
            <div className="space-y-2">
              <Formula>Skip: dp[i−1][b]</Formula>
              <Formula>Take: value<sub>i</sub> + dp[i−1][b − price<sub>i</sub>] &nbsp;(only if price<sub>i</sub> ≤ b)</Formula>
              <Formula>dp[i][b] = max( skip, take )</Formula>
            </div>
            <p>The table is filled row by row, left to right. The bottom-right cell dp[n][B] is the best score for the full budget.</p>
          </Section>

          <Section n={7} title="Reconstructing the optimal solution">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Start at the bottom-right cell dp[n][B].</li>
              <li>Compare it with the cell directly above, dp[n−1][B].</li>
              <li>If they're different, item n was taken: add it to the plan and subtract its price from the budget.</li>
              <li>If they're the same, item n was skipped: keep the same budget.</li>
              <li>Move up one row and repeat until row 0.</li>
            </ol>
            <p>The DP Visualization highlights this path when the table is complete.</p>
          </Section>

          <Panel className="p-6">
            <h2 className="text-lg font-bold tracking-tight">Why not just pick the best value per peso?</h2>
            <p className="mt-2 text-muted leading-relaxed">
              That greedy approach can miss the optimum. With ₱150, picking by value per peso takes Vegetable Meal,
              Rice + Egg and Fruit (₱120, score 170), and nothing else fits. DP finds Rice + Egg, Vegetable Meal and
              Sandwich (₱150, score 195).
            </p>
          </Panel>

          <Panel className="p-6">
            <h2 className="text-lg font-bold tracking-tight mb-4">JavaScript implementation</h2>
            <Code>{SOURCE_2D}</Code>
          </Panel>
        </div>
      </div>
    </div>
  );
}
