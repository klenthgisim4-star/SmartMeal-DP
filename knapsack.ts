// SmartMeal DP — 0/1 Knapsack solved with Dynamic Programming.
// Budget = knapsack capacity, price = weight, nutrition/value score = value.

export const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Beverage"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Meal = { id: string; name: string; price: number; value: number; category?: Category };

export type Step = {
  i: number; // row (meal index, 1-based)
  c: number; // column index
  budget: number; // budget in pesos for this column
  skip: number; // dp[i-1][b]
  take: number | null; // value + dp[i-1][b - price], or null if it doesn't fit
  takeFrom: number | null; // column index referenced when taking
  value: number; // dp[i][b]
  took: boolean;
};

export type Solution = {
  budget: number;
  unit: number; // column step in pesos (gcd of prices)
  cols: number[]; // budget value of each column, in pesos
  table: number[][]; // (n+1) x cols
  took: boolean[][];
  steps: Step[];
  path: [number, number][]; // traceback cells [row, col]
  selectedIdx: number[]; // indexes into meals
  selected: Meal[];
  totalCost: number;
  totalValue: number;
  remaining: number;
};

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Bottom-up 2D DP table: dp[i][b] = best value using the first i meals with budget b.
 * dp[i][b] = max(dp[i-1][b], value_i + dp[i-1][b - price_i])  (only if price_i <= b)
 * Kept in 2D so we can draw every step and trace back which meals were chosen.
 * Columns are grouped by the gcd of all prices (e.g. ₱10 steps), which keeps the
 * table readable without changing the answer.
 */
export function solveKnapsack(meals: Meal[], budget: number): Solution {
  const n = meals.length;
  const B = Math.max(0, Math.floor(budget));
  const unit = Math.max(1, meals.reduce((g, m) => gcd(g, m.price), 0));
  const W = Math.floor(B / unit);
  const cols = Array.from({ length: W + 1 }, (_, c) => c * unit);
  const weight = meals.map((m) => m.price / unit);

  const table: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const took: boolean[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(false));
  const steps: Step[] = [];

  for (let i = 1; i <= n; i++) {
    const wi = weight[i - 1];
    const vi = meals[i - 1].value;
    for (let c = 0; c <= W; c++) {
      const skip = table[i - 1][c];
      const fits = wi <= c;
      const take = fits ? vi + table[i - 1][c - wi] : null;
      const useTake = take !== null && take > skip;
      table[i][c] = useTake ? (take as number) : skip;
      took[i][c] = useTake;
      steps.push({
        i, c, budget: cols[c], skip, take,
        takeFrom: fits ? c - wi : null,
        value: table[i][c], took: useTake,
      });
    }
  }

  // Traceback from dp[n][W] to recover the chosen meals.
  const path: [number, number][] = [];
  const selectedIdx: number[] = [];
  let c = W;
  for (let i = n; i >= 1; i--) {
    path.push([i, c]);
    if (took[i][c]) {
      selectedIdx.unshift(i - 1);
      c -= weight[i - 1];
    }
  }
  path.push([0, c]);

  const selected = selectedIdx.map((k) => meals[k]);
  const totalCost = selected.reduce((s, m) => s + m.price, 0);
  const totalValue = selected.reduce((s, m) => s + m.value, 0);

  return {
    budget: B, unit, cols, table, took, steps, path, selectedIdx, selected,
    totalCost, totalValue, remaining: B - totalCost,
  };
}

/**
 * Space-optimised version: one array of size B + 1 → O(B) space, O(n × B) time.
 * Budget loops from high to low so each meal is used at most once.
 */
export function solveKnapsack1D(meals: Meal[], budget: number) {
  const B = Math.max(0, Math.floor(budget));
  const dp = new Array(B + 1).fill(0);
  let ops = 0;
  for (const meal of meals) {
    for (let b = B; b >= 0; b--) {
      ops++;
      if (meal.price <= b) dp[b] = Math.max(dp[b], meal.value + dp[b - meal.price]);
    }
  }
  return { best: dp[B], ops, arraySize: B + 1 };
}

/** Brute force: try all 2^n subsets. Used only to verify the DP answer (n ≤ 20). */
export function bruteForce(meals: Meal[], budget: number) {
  const n = meals.length;
  if (n > 20) return null;
  let best = 0;
  const total = 1 << n;
  for (let mask = 0; mask < total; mask++) {
    let cost = 0;
    let value = 0;
    for (let k = 0; k < n; k++) {
      if (mask & (1 << k)) {
        cost += meals[k].price;
        value += meals[k].value;
      }
    }
    if (cost <= budget && value > best) best = value;
  }
  return { best, combos: total };
}

export type Plan = { idx: number[]; cost: number; value: number };

/**
 * Close alternatives to the optimum. DP returns one best plan, so for comparison we
 * list every affordable combination (n ≤ 12 → at most 4,096) and keep the top few.
 * Plans that are a strict subset of a better plan with spare money are still shown,
 * since a student may prefer to keep change.
 */
export function topPlans(meals: Meal[], budget: number, k = 3): Plan[] {
  const n = meals.length;
  if (n === 0 || n > 16) return [];
  const plans: Plan[] = [];
  for (let mask = 1; mask < 1 << n; mask++) {
    let cost = 0;
    let value = 0;
    const idx: number[] = [];
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) {
        cost += meals[j].price;
        value += meals[j].value;
        idx.push(j);
      }
    }
    if (cost <= budget) plans.push({ idx, cost, value });
  }
  plans.sort((a, b) => b.value - a.value || a.cost - b.cost || a.idx.length - b.idx.length);
  return plans.slice(0, k);
}

export const SOURCE_2D = `function knapsack(meals, budget) {
  const n = meals.length;
  // dp[i][b] = best value using the first i meals with budget b
  const dp = Array.from({ length: n + 1 }, () => Array(budget + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { price, value } = meals[i - 1];
    for (let b = 0; b <= budget; b++) {
      dp[i][b] = dp[i - 1][b];                       // skip meal i
      if (price <= b) {
        dp[i][b] = Math.max(dp[i][b],
                            value + dp[i - 1][b - price]); // take meal i
      }
    }
  }

  // Traceback: walk up from dp[n][budget]
  const chosen = [];
  let b = budget;
  for (let i = n; i >= 1; i--) {
    if (dp[i][b] !== dp[i - 1][b]) {
      chosen.push(meals[i - 1]);
      b -= meals[i - 1].price;
    }
  }
  return { best: dp[n][budget], chosen };
}`;

export const SOURCE_1D = `function knapsack1D(meals, budget) {
  const dp = Array(budget + 1).fill(0);   // O(B) space
  for (const { price, value } of meals) { // n meals
    for (let b = budget; b >= price; b--) // B budgets, high → low
      dp[b] = Math.max(dp[b], value + dp[b - price]);
  }
  return dp[budget];
}`;
