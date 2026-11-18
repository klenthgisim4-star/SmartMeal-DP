import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { peso, useStore } from "../store";
import { Button, Panel, PageHeader, Progress } from "../ui";

type Q = { q: string; options: string[]; answer: number; why: string };

const BASE: Q[] = [
  {
    q: "What is the purpose of the DP table?",
    options: [
      "To sort food items by price",
      "To store the best score for every smaller budget and item count, so each is solved once",
      "To list every possible combination of meals",
      "To show the price of each food item",
    ],
    answer: 1,
    why: "Each cell dp[i][b] saves the answer to a subproblem, so later cells can reuse it instead of recomputing.",
  },
  {
    q: "What is the time complexity of the DP solution?",
    options: ["O(n)", "O(2ⁿ)", "O(n log n)", "O(n × B)"],
    answer: 3,
    why: "There are n × (B + 1) cells and each takes constant time to fill.",
  },
  {
    q: "Why is the meal budget planner similar to the Knapsack Problem?",
    options: [
      "Both sort items from cheapest to most expensive",
      "Both always pick every item",
      "Both choose items with a cost and a value to get the most value under a limit",
      "Both use random choices",
    ],
    answer: 2,
    why: "A knapsack has a weight limit; a wallet has a budget. Each food item has a cost (price) and a value (nutrition).",
  },
  {
    q: "In SmartMeal DP, what does the budget represent?",
    options: ["The item's value", "The knapsack capacity", "The number of items", "The item's weight"],
    answer: 1,
    why: "The budget is the limit you can't go over, just like the knapsack's weight capacity.",
  },
  {
    q: "What does the nutrition score represent?",
    options: ["The item's value", "The item's weight", "The knapsack capacity", "The number of steps"],
    answer: 0,
    why: "The algorithm maximizes total nutrition score, the same way knapsack maximizes total item value.",
  },
  {
    q: "Why is it called the 0/1 Knapsack problem?",
    options: [
      "Scores are only 0 or 1",
      "Each food item is either taken once or not taken",
      "The budget starts at 0 and ends at 1",
      "It always picks exactly one item",
    ],
    answer: 1,
    why: "You can't buy a fraction of a meal or the same meal twice, so each choice is 0 or 1.",
  },
  {
    q: "With the one-array version, what is the space complexity?",
    options: ["O(B)", "O(n × B)", "O(n)", "O(1)"],
    answer: 0,
    why: "Each row only needs the previous row, so a single array of size B + 1 is reused.",
  },
  {
    q: "Which property lets dynamic programming reuse stored answers?",
    options: ["Greedy choice", "Divide and conquer", "Overlapping subproblems", "Randomization"],
    answer: 2,
    why: "The same subproblem (best score for budget b) is needed many times, so it's computed once and stored.",
  },
];

export default function Challenge() {
  const { meals, budget, solution } = useStore();

  const questions = useMemo(() => {
    if (!meals.length) return BASE;
    const best = solution.totalValue;
    const sumAll = meals.reduce((s, m) => s + m.value, 0);
    const greedyish = Math.max(0, best - 15);
    const raw = Array.from(new Set([best, best + 20, greedyish, Math.min(sumAll + 10, best + 45)])).slice(0, 4);
    while (raw.length < 4) raw.push(best + 5 * raw.length + 7);
    const options = [...raw].sort((a, b) => a - b);
    const live: Q = {
      q: `Using your ${meals.length} meals and a ${peso(budget)} budget, what is the maximum total value?`,
      options: options.map(String),
      answer: options.indexOf(best),
      why: `dp[${meals.length}][${peso(budget)}] = ${best}: ${solution.selected.map((m) => m.name).join(" + ") || "no meals"} for ${peso(solution.totalCost)}.`,
    };
    return [...BASE, live];
  }, [meals, budget, solution]);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [showMissing, setShowMissing] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);

  function check() {
    if (answeredCount < questions.length) {
      setShowMissing(true);
      const first = questions.findIndex((_, i) => answers[i] === undefined);
      document.getElementById(`q-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setChecked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retry() {
    setAnswers({});
    setChecked(false);
    setShowMissing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Challenge"
        description={`${questions.length} questions on dynamic programming and the 0/1 Knapsack algorithm.`}
      />

      <Panel className="p-5 mb-6">
        {checked ? (
          <div className="animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-3xl font-extrabold tracking-tight tabular-nums">
                {score} / {questions.length}
              </p>
              <p className="text-muted text-sm mt-1">
                {score === questions.length
                  ? "Perfect score. You know your knapsack!"
                  : "Review the explanations below, then try again."}
              </p>
            </div>
            <Button variant="primary" onClick={retry}>Try again</Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Answered</span>
              <span className="text-muted tabular-nums">{answeredCount} of {questions.length}</span>
            </div>
            <Progress value={answeredCount} max={questions.length} label="Questions answered" />
          </div>
        )}
      </Panel>

      <ol className="space-y-4">
        {questions.map((q, qi) => {
          const picked = answers[qi];
          const missing = showMissing && picked === undefined && !checked;
          const correct = checked && picked === q.answer;
          return (
            <li key={qi} id={`q-${qi}`}>
              <Panel className={`p-5 ${missing ? "border-danger" : ""}`}>
                <fieldset>
                  <legend className="font-semibold">
                    <span className="font-mono text-sm text-primary mr-2">{qi + 1}.</span>
                    {q.q}
                    {qi === BASE.length && <span className="ml-2 text-sm font-semibold text-accent-ink">Uses your meals</span>}
                  </legend>
                  <div className="mt-3 grid gap-2">
                    {q.options.map((opt, oi) => {
                      const isPicked = picked === oi;
                      const isAnswer = oi === q.answer;
                      let cls = "border-border hover:bg-subtle";
                      if (!checked && isPicked) cls = "border-primary bg-primary-soft";
                      if (checked && isAnswer) cls = "border-primary bg-primary-soft";
                      if (checked && isPicked && !isAnswer) cls = "border-danger bg-danger-soft";
                      return (
                        <label key={oi} className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm ${checked ? "cursor-default" : "cursor-pointer"} ${cls}`}>
                          <input
                            type="radio"
                            name={`q${qi}`}
                            checked={isPicked}
                            disabled={checked}
                            onChange={() => setAnswers({ ...answers, [qi]: oi })}
                            className="accent-primary size-4"
                          />
                          <span className="flex-1">{opt}</span>
                          {checked && isAnswer && <CheckCircle2 className="size-4 text-primary" strokeWidth={2} aria-label="Correct answer" />}
                          {checked && isPicked && !isAnswer && <XCircle className="size-4 text-danger" strokeWidth={2} aria-label="Your answer" />}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {missing && <p className="mt-2 text-sm text-danger">Pick an answer to finish</p>}
                {checked && (
                  <p className={`animate-fade-in mt-3 text-sm ${correct ? "text-primary-ink" : "text-foreground"}`}>
                    <b>{correct ? "Correct." : "Not quite."}</b> <span className="text-muted">{q.why}</span>
                  </p>
                )}
              </Panel>
            </li>
          );
        })}
      </ol>

      {!checked && (
        <div className="mt-6">
          <Button variant="primary" onClick={check}>Check answers</Button>
        </div>
      )}
    </div>
  );
}
