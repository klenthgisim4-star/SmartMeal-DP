import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Salad, X } from "lucide-react";
import { useStore } from "./store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/planner", label: "Meal Planner" },
  { to: "/visualization", label: "DP Visualization" },
  { to: "/results", label: "Results" },
  { to: "/algorithm", label: "Algorithm" },
  { to: "/complexity", label: "Complexity" },
  { to: "/challenge", label: "Challenge" },
];

export default function Layout() {
  const { toast, dismissToast } = useStore();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-surface/95 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 lg:gap-6">
          <NavLink to="/" className="flex items-center gap-2 h-14 shrink-0">
            <Salad className="size-6 text-primary" strokeWidth={2} aria-hidden />
            <span className="font-extrabold tracking-tight text-lg">
              SmartMeal <span className="text-primary">DP</span>
            </span>
          </NavLink>
          <nav aria-label="Main" className="-mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto">
            <ul className="flex gap-1 pb-2 lg:pb-0">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.to === "/"}
                    className={({ isActive }) =>
                      `block whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${
                        isActive ? "bg-primary-soft text-primary-ink" : "text-muted hover:text-foreground hover:bg-subtle"
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 text-sm text-muted flex flex-col sm:flex-row gap-1 sm:justify-between">
          <span>SmartMeal DP – Meal & Food Budget Planner</span>
          <span>Algorithm and Complexity · 0/1 Knapsack with Dynamic Programming</span>
        </div>
      </footer>

      {toast && (
        <div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto animate-fade-in flex items-center gap-3 rounded-lg bg-foreground text-surface pl-4 pr-2 py-2 shadow-pop text-sm"
          >
            <span>{toast.message}</span>
            {toast.undo && (
              <button onClick={toast.undo} className="font-semibold text-accent px-2 py-1 rounded hover:bg-surface/10">
                Undo
              </button>
            )}
            <button aria-label="Dismiss" onClick={dismissToast} className="p-1.5 rounded hover:bg-surface/10">
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
