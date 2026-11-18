import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-surface text-foreground border border-border-strong hover:bg-subtle",
  ghost: "text-muted hover:text-foreground hover:bg-subtle",
  danger: "text-danger hover:bg-danger-soft",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  to, variant = "secondary", children, className = "",
}: { to: string; variant?: Variant; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`bg-surface border border-border rounded-xl shadow-panel ${className}`}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, aside }: { title: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3">
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
      {aside}
    </div>
  );
}

export function PageHeader({
  title, description, action,
}: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-muted leading-relaxed">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function Progress({
  value, max, label, tone = "primary",
}: { value: number; max: number; label: string; tone?: "primary" | "accent" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2.5 w-full rounded-full bg-subtle overflow-hidden"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ease-out ${tone === "primary" ? "bg-primary" : "bg-accent"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title, body, action,
}: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-14">
      <p className="text-base font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted max-w-sm">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-sm bg-subtle rounded-md px-4 py-3 overflow-x-auto whitespace-nowrap">
      {children}
    </div>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <pre className="font-mono text-[13px] leading-relaxed bg-foreground text-subtle rounded-lg p-4 overflow-x-auto">
      {/* ds-ok: code block size */}
      <code>{children}</code>
    </pre>
  );
}
