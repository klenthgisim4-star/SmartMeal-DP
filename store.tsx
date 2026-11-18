import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { solveKnapsack, type Meal, type Solution } from "./knapsack";
import { useScreenInit } from "./useScreenInit";

export const EXAMPLE_MEALS: Omit<Meal, "id">[] = [
  { name: "Rice + Egg", price: 40, value: 60, category: "Breakfast" },
  { name: "Chicken Meal", price: 80, value: 90, category: "Lunch" },
  { name: "Vegetable Meal", price: 50, value: 70, category: "Dinner" },
  { name: "Sandwich", price: 60, value: 65, category: "Snack" },
  { name: "Fruit", price: 30, value: 40, category: "Snack" },
];

export const DEFAULT_BUDGET = 150;
export const MAX_MEALS = 12;
export const MAX_BUDGET = 5000;

let seq = 0;
const newId = () => `meal-${++seq}`;
const withIds = (list: Omit<Meal, "id">[]) => list.map((m) => ({ ...m, id: newId() }));

export type Toast = { id: number; message: string; undo?: () => void };

type Store = {
  budget: number;
  setBudget: (b: number) => void;
  meals: Meal[];
  addMeal: (m: Omit<Meal, "id">) => void;
  updateMeal: (m: Meal) => void;
  deleteMeal: (id: string) => void;
  loadExample: () => void;
  clearMeals: () => void;
  solution: Solution;
  toast: Toast | null;
  dismissToast: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const init = useScreenInit();
  const [budget, setBudget] = useState<number>(
    typeof init.budget === "number" ? init.budget : DEFAULT_BUDGET,
  );
  const [meals, setMeals] = useState<Meal[]>(() => (init.empty ? [] : withIds(EXAMPLE_MEALS)));
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string, undo?: () => void) => {
    window.clearTimeout(timer.current);
    const t = { id: Date.now(), message, undo };
    setToast(t);
    timer.current = window.setTimeout(() => setToast(null), undo ? 6000 : 4000);
  }, []);

  const dismissToast = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  const addMeal = useCallback((m: Omit<Meal, "id">) => {
    setMeals((prev) => [...prev, { ...m, id: newId() }]);
  }, []);

  const updateMeal = useCallback((m: Meal) => {
    setMeals((prev) => prev.map((x) => (x.id === m.id ? m : x)));
  }, []);

  const mealsRef = useRef(meals);
  mealsRef.current = meals;

  const deleteMeal = useCallback(
    (id: string) => {
      const prev = mealsRef.current;
      const idx = prev.findIndex((x) => x.id === id);
      if (idx < 0) return;
      const removed = prev[idx];
      setMeals(prev.filter((x) => x.id !== id));
      showToast(`${removed.name} deleted`, () => {
        setMeals((cur) => {
          const copy = [...cur];
          copy.splice(Math.min(idx, copy.length), 0, removed);
          return copy;
        });
        dismissToast();
      });
    },
    [showToast, dismissToast],
  );

  const loadExample = useCallback(() => setMeals(withIds(EXAMPLE_MEALS)), []);

  const clearMeals = useCallback(() => {
    const snapshot = mealsRef.current;
    if (!snapshot.length) return;
    setMeals([]);
    showToast(`${snapshot.length} ${snapshot.length === 1 ? "meal" : "meals"} cleared`, () => {
      setMeals(snapshot);
      dismissToast();
    });
  }, [showToast, dismissToast]);

  const solution = useMemo(() => solveKnapsack(meals, budget), [meals, budget]);

  const value = useMemo(
    () => ({ budget, setBudget, meals, addMeal, updateMeal, deleteMeal, loadExample, clearMeals, solution, toast, dismissToast }),
    [budget, meals, addMeal, updateMeal, deleteMeal, loadExample, clearMeals, solution, toast, dismissToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}

export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;
