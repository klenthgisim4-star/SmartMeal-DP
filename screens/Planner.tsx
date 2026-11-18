import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2, Check, X, Sparkles } from "lucide-react";
import { MAX_BUDGET, MAX_MEALS, peso, useStore } from "../store";
import { Button, EmptyState, Panel, PanelHeader, PageHeader } from "../ui";
import { CATEGORIES, type Category, type Meal } from "../knapsack";

type Draft = { name: string; price: string; value: string; category: Category | "" };
type Errors = Partial<Record<keyof Draft, string>>;
const EMPTY: Draft = { name: "", price: "", value: "", category: "" };

function CategorySelect({ id, value, onChange, label }: { id?: string; value: Category | ""; onChange: (v: Category | "") => void; label?: string }) {
  return (
    <select
      id={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as Category | "")}
      className="h-10 w-full rounded-md border border-border-strong bg-surface px-2 text-sm focus:outline-2 focus:outline-primary"
    >
      <option value="">None</option>
      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}

function validate(d: Draft): Errors {
  const e: Errors = {};
  if (!d.name.trim()) e.name = "Enter a food name";
  const p = Number(d.price);
  if (!d.price.trim() || !Number.isInteger(p) || p < 1) e.price = "Price must be a whole number from ₱1";
  else if (p > MAX_BUDGET) e.price = `Price can't be more than ${peso(MAX_BUDGET)}`;
  const v = Number(d.value);
  if (!d.value.trim() || !Number.isInteger(v) || v < 0) e.value = "Value must be a whole number from 0";
  return e;
}

const inputCls =
  "h-10 w-full rounded-md border bg-surface px-3 text-sm focus:outline-2 focus:outline-offset-0 focus:outline-primary";

function Field({
  id, label, value, onChange, error, prefix, inputMode,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string;
  prefix?: string; inputMode?: "numeric" | "text";
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">{prefix}</span>}
        <input
          id={id}
          value={value}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`${inputCls} ${prefix ? "pl-7" : ""} ${error ? "border-danger" : "border-border-strong"}`}
        />
      </div>
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

export default function Planner() {
  const { budget, setBudget, meals, addMeal, updateMeal, deleteMeal, loadExample, clearMeals } = useStore();
  const navigate = useNavigate();

  const [budgetText, setBudgetText] = useState(String(budget));
  const [budgetErr, setBudgetErr] = useState<string | undefined>();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Draft>(EMPTY);
  const [editErr, setEditErr] = useState<Errors>({});

  const totalPrice = meals.reduce((s, m) => s + m.price, 0);
  const full = meals.length >= MAX_MEALS;

  function onBudget(v: string) {
    setBudgetText(v);
    const n = Number(v.replace(/[₱,\s]/g, ""));
    if (!v.trim() || !Number.isInteger(n) || n < 1) setBudgetErr("Budget must be a whole number from ₱1");
    else if (n > MAX_BUDGET) setBudgetErr(`Budget can't be more than ${peso(MAX_BUDGET)}`);
    else {
      setBudgetErr(undefined);
      setBudget(n);
    }
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const errs = validate(draft);
    setErrors(errs);
    if (Object.keys(errs).length || full) return;
    addMeal({ name: draft.name.trim(), price: Number(draft.price), value: Number(draft.value), category: draft.category || undefined });
    setDraft(EMPTY);
  }

  function startEdit(m: Meal) {
    setEditingId(m.id);
    setEdit({ name: m.name, price: String(m.price), value: String(m.value), category: m.category ?? "" });
    setEditErr({});
  }

  function saveEdit() {
    const errs = validate(edit);
    setEditErr(errs);
    if (Object.keys(errs).length || !editingId) return;
    updateMeal({ id: editingId, name: edit.name.trim(), price: Number(edit.price), value: Number(edit.value), category: edit.category || undefined });
    setEditingId(null);
  }

  return (
    <div>
      <PageHeader
        title="Meal Planner"
        description="Set your budget and list the meals you can buy. Each meal can be picked once."
        action={
          <Button variant="primary" disabled={!meals.length || !!budgetErr} onClick={() => navigate("/results")} className="h-11 px-5">
            <Sparkles className="size-4" strokeWidth={2} /> Optimize My Meal Plan
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
        <div className="space-y-6">
          <Panel className="p-5">
            <Field
              id="budget" label="Food budget" prefix="₱" inputMode="numeric"
              value={budgetText} onChange={onBudget} error={budgetErr}
            />
            {!budgetErr && meals.length > 0 && (
              <p className="mt-3 text-sm text-muted">
                {totalPrice > budget
                  ? `All ${meals.length} meals cost ${peso(totalPrice)}, ${peso(totalPrice - budget)} over budget. DP picks the best subset.`
                  : `All ${meals.length} meals fit (${peso(totalPrice)}). Raise the challenge by lowering the budget.`}
              </p>
            )}
          </Panel>

          <Panel className="p-5">
            <h2 className="text-base font-bold tracking-tight mb-4">Add a food item</h2>
            <form onSubmit={onAdd} className="space-y-4" noValidate>
              <Field id="m-name" label="Food name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} error={errors.name} />
              <div className="grid grid-cols-2 gap-3">
                <Field id="m-price" label="Price" prefix="₱" inputMode="numeric" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} error={errors.price} />
                <Field id="m-value" label="Nutrition score" inputMode="numeric" value={draft.value} onChange={(v) => setDraft({ ...draft, value: v })} error={errors.value} />
              </div>
              <div>
                <label htmlFor="m-cat" className="block text-sm font-semibold mb-1.5">Category (optional)</label>
                <CategorySelect id="m-cat" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} />
              </div>
              <Button type="submit" disabled={full} className="w-full">
                <Plus className="size-4" strokeWidth={2} /> Add food item
              </Button>
              {full && <p className="text-sm text-muted">You can list up to {MAX_MEALS} food items. Delete one to add another.</p>}
            </form>
          </Panel>
        </div>

        <Panel>
          <PanelHeader
            title={<>Food items <span className="text-muted font-semibold">{meals.length}</span></>}
            aside={
              <div className="flex gap-1">
                <Button variant="ghost" onClick={loadExample}>Load example meals</Button>
                {meals.length > 0 && <Button variant="danger" onClick={clearMeals}>Clear all</Button>}
              </div>
            }
          />
          {meals.length === 0 ? (
            <EmptyState
              title="No food items yet"
              body="Add a food item on the left, or start with the 5 example meals."
              action={<Button variant="primary" onClick={loadExample}>Load example meals</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-subtle text-muted">
                    <th className="text-left font-semibold px-5 py-2.5 w-10">#</th>
                    <th className="text-left font-semibold px-3 py-2.5">Food</th>
                    <th className="text-left font-semibold px-3 py-2.5">Category</th>
                    <th className="text-right font-semibold px-3 py-2.5">Price</th>
                    <th className="text-right font-semibold px-3 py-2.5">Nutrition score</th>
                    <th className="px-5 py-2.5"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {meals.map((m, idx) =>
                    editingId === m.id ? (
                      <tr key={m.id} className="bg-primary-soft/40 align-top">
                        <td className="px-5 py-3 font-mono text-muted">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <input aria-label="Food name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={`${inputCls} ${editErr.name ? "border-danger" : "border-border-strong"}`} />
                          {editErr.name && <p className="mt-1 text-xs text-danger">{editErr.name}</p>}
                        </td>
                        <td className="px-3 py-2 min-w-28">
                          <CategorySelect label="Category" value={edit.category} onChange={(v) => setEdit({ ...edit, category: v })} />
                        </td>
                        <td className="px-3 py-2">
                          <input aria-label="Price" inputMode="numeric" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} className={`${inputCls} text-right w-24 ml-auto block ${editErr.price ? "border-danger" : "border-border-strong"}`} />
                          {editErr.price && <p className="mt-1 text-xs text-danger text-right">{editErr.price}</p>}
                        </td>
                        <td className="px-3 py-2">
                          <input aria-label="Nutrition score" inputMode="numeric" value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} className={`${inputCls} text-right w-20 ml-auto block ${editErr.value ? "border-danger" : "border-border-strong"}`} />
                          {editErr.value && <p className="mt-1 text-xs text-danger text-right">{editErr.value}</p>}
                        </td>
                        <td className="px-5 py-2">
                          <div className="flex justify-end gap-1">
                            <button onClick={saveEdit} aria-label={`Save ${m.name}`} className="size-9 grid place-items-center rounded-md bg-primary text-primary-foreground hover:bg-primary-hover">
                              <Check className="size-4" strokeWidth={2} />
                            </button>
                            <button onClick={() => setEditingId(null)} aria-label="Cancel editing" className="size-9 grid place-items-center rounded-md text-muted hover:bg-subtle">
                              <X className="size-4" strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={m.id} className="animate-fade-in hover:bg-subtle/60">
                        <td className="px-5 py-3 font-mono text-muted">{idx + 1}</td>
                        <td className="px-3 py-3 font-semibold">{m.name}</td>
                        <td className="px-3 py-3 text-muted">{m.category ?? "–"}</td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums">{peso(m.price)}</td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums">{m.value}</td>
                        <td className="px-5 py-2">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => startEdit(m)} aria-label={`Edit ${m.name}`} className="size-9 grid place-items-center rounded-md text-muted hover:text-foreground hover:bg-subtle">
                              <Pencil className="size-4" strokeWidth={2} />
                            </button>
                            <button onClick={() => deleteMeal(m.id)} aria-label={`Delete ${m.name}`} className="size-9 grid place-items-center rounded-md text-muted hover:text-danger hover:bg-danger-soft">
                              <Trash2 className="size-4" strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
