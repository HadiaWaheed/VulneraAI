import {
  createContext, useCallback, useContext, useState,
  type ButtonHTMLAttributes, type InputHTMLAttributes,
  type ReactNode, type SelectHTMLAttributes,
} from "react";
import {
  AlertTriangle, CheckCircle2, ChevronDown, Info, Loader2,
  ShieldAlert, ShieldCheck, X, XCircle,
} from "lucide-react";
import type { Prediction } from "../types";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const surface = "border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-[0_8px_30px_rgba(15,23,42,0.06)]";
const primaryText = "text-[rgb(var(--text-primary))]";
const secondaryText = "text-[rgb(var(--text-secondary))]";
const mutedText = "text-[rgb(var(--text-muted))]";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("relative overflow-hidden rounded-2xl", surface, "transition-shadow duration-200 hover:shadow-[0_12px_34px_rgba(15,23,42,0.09)]", className)}>{children}</section>;
}

export function CardHeader({ title, subtitle, action, icon }: {
  title: string; subtitle?: string; action?: ReactNode; icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgb(var(--border))] px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 ring-1 ring-inset ring-indigo-500/15">{icon}</div>}
        <div className="min-w-0">
          <h2 className={cx("text-sm font-semibold tracking-tight", primaryText)}>{title}</h2>
          {subtitle && <p className={cx("mt-0.5 text-xs", mutedText)}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action, eyebrow }: {
  title: string; subtitle?: string; action?: ReactNode; eyebrow?: string;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-500">{eyebrow}</p>}
        <h1 className={cx("text-2xl font-bold leading-tight tracking-tight sm:text-[30px]", primaryText)}>{title}</h1>
        {subtitle && <p className={cx("mt-2 max-w-2xl text-sm", secondaryText)}>{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline";
type ButtonSize = "sm" | "md" | "lg";
const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500",
  secondary: "border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-primary))] hover:border-indigo-400/50 hover:bg-indigo-500/5",
  ghost: "text-[rgb(var(--text-secondary))] hover:bg-indigo-500/8 hover:text-indigo-500",
  "danger-outline": "border border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10",
  danger: "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/20 hover:-translate-y-0.5",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-lg px-3 text-xs", md: "h-10 rounded-xl px-4 text-sm", lg: "h-11 rounded-xl px-5 text-sm",
};
export function Button({ variant = "primary", size = "md", loading = false, className, children, disabled, ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  return <button className={cx("inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50", buttonStyles[variant], buttonSizes[size], className)}
    disabled={disabled || loading} {...props}>{loading && <Loader2 size={15} className="animate-spin" />}{children}</button>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className={cx("mb-1.5 block text-[13px] font-semibold", secondaryText)}>{label}</span>{children}{hint && <span className={cx("mt-1.5 block text-xs", mutedText)}>{hint}</span>}</label>;
}

const controlClass = "h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] outline-none transition hover:border-indigo-400/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(controlClass, className)} {...props} />;
}
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <div className={cx("relative", className)}><select className={cx(controlClass, "cursor-pointer appearance-none pr-9")} {...props}>{children}</select><ChevronDown size={16} className={cx("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2", mutedText)} /></div>;
}

export function Segmented<T extends string>({ value, options, onChange, ariaLabel }: {
  value: T; options: Array<{ value: T; label: ReactNode }>; onChange: (value: T) => void; ariaLabel: string;
}) {
  return <div role="tablist" aria-label={ariaLabel} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] p-1">
    {options.map(option => <button key={option.value} role="tab" type="button" aria-selected={value === option.value} onClick={() => onChange(option.value)}
      className={cx("inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition", value === option.value ? "bg-indigo-600 text-white shadow-sm" : cx(secondaryText, "hover:bg-indigo-500/8 hover:text-indigo-500"))}>{option.label}</button>)}
  </div>;
}
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={cx("inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-1.5 font-sans text-[11px] font-medium", secondaryText)}>{children}</kbd>;
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success" | "warning" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-rose-500/25 bg-rose-500/8 text-rose-500",
    success: "border-emerald-500/25 bg-emerald-500/8 text-emerald-600",
    warning: "border-amber-500/25 bg-amber-500/8 text-amber-600",
    info: "border-indigo-500/25 bg-indigo-500/8 text-indigo-500",
  };
  const icons = { error: XCircle, success: CheckCircle2, warning: AlertTriangle, info: Info };
  const Icon = icons[tone];
  return <div role="alert" className={cx("flex gap-3 rounded-xl border px-4 py-3 text-sm", styles[tone])}><Icon size={17} className="mt-0.5 shrink-0" /><div className="min-w-0">{children}</div></div>;
}
export function Spinner({ label = "Loading..." }: { label?: string }) {
  return <div className={cx("flex items-center justify-center gap-3 py-16 text-sm", secondaryText)}><Loader2 size={20} className="animate-spin text-indigo-500" />{label}</div>;
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton rounded-lg", className)} />;
}
export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center px-6 py-16 text-center">
    <div className="relative mb-5"><div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl" /><div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-500">{icon}</div></div>
    <h3 className={cx("text-base font-bold", primaryText)}>{title}</h3><p className={cx("mt-1.5 max-w-sm text-sm", secondaryText)}>{text}</p>{action && <div className="mt-6">{action}</div>}
  </div>;
}

type ToastTone = "success" | "error" | "info";
interface ToastItem { id: number; tone: ToastTone; message: string }
const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: number) => setToasts(current => current.filter(toast => toast.id !== id)), []);
  const show = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current.slice(-2), { id, tone, message }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);
  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const colors = { success: "text-emerald-500", error: "text-rose-500", info: "text-indigo-500" };
  return <ToastContext.Provider value={show}>{children}
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map(toast => { const Icon = icons[toast.tone]; return <div key={toast.id} className={cx("pointer-events-auto flex items-start gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-4 py-3 text-sm shadow-xl backdrop-blur", primaryText)}>
        <Icon size={17} className={cx("mt-0.5 shrink-0", colors[toast.tone])} /><p className="min-w-0 flex-1">{toast.message}</p><button onClick={() => dismiss(toast.id)} aria-label="Dismiss" className={cx(mutedText, "transition hover:text-indigo-500")}><X size={15} /></button>
      </div>; })}
    </div>
  </ToastContext.Provider>;
}
export function useToast() { return useContext(ToastContext); }

export function PredictionBadge({ prediction, size = "sm" }: { prediction: Prediction; size?: "sm" | "md" }) {
  const vulnerable = prediction === "vulnerable"; const Icon = vulnerable ? ShieldAlert : ShieldCheck;
  return <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset", size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-sm", vulnerable ? "bg-rose-500/10 text-rose-500 ring-rose-500/25" : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/25")}><Icon size={size === "sm" ? 12 : 14} />{vulnerable ? "Vulnerable" : "Safe"}</span>;
}
export function ConfidenceBar({ value, prediction }: { value: number; prediction: Prediction }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return <div className="flex items-center gap-2.5"><div className="h-2 w-20 overflow-hidden rounded-full bg-[rgb(var(--border))]"><div className={cx("h-full rounded-full", prediction === "vulnerable" ? "bg-gradient-to-r from-rose-600 to-rose-400" : "bg-gradient-to-r from-emerald-600 to-emerald-400")} style={{ width: `${pct}%` }} /></div><span className={cx("w-9 text-right font-mono text-xs tabular-nums", secondaryText)}>{pct}%</span></div>;
}
export function StatCard({ label, value, hint, icon, accent = "indigo", chart }: {
  label: string; value: string; hint?: string; icon: ReactNode; accent?: "indigo" | "rose" | "emerald" | "amber"; chart?: ReactNode;
}) {
  const accents = {
    indigo: { icon: "bg-indigo-500/10 text-indigo-500 ring-indigo-500/20", line: "from-indigo-500", glow: "bg-indigo-500/8" },
    rose: { icon: "bg-rose-500/10 text-rose-500 ring-rose-500/20", line: "from-rose-500", glow: "bg-rose-500/8" },
    emerald: { icon: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20", line: "from-emerald-500", glow: "bg-emerald-500/8" },
    amber: { icon: "bg-amber-500/10 text-amber-600 ring-amber-500/20", line: "from-amber-500", glow: "bg-amber-500/8" },
  };
  return <Card className="group relative p-5">
    <div className={cx("pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl", accents[accent].glow)} />
    <div className={cx("absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r to-transparent", accents[accent].line)} />
    <div className="relative flex items-start justify-between gap-3"><div><p className={cx("text-[13px] font-semibold", secondaryText)}>{label}</p><p className={cx("mt-3 text-[30px] font-bold leading-none tracking-tight tabular-nums", primaryText)}>{value}</p></div><div className={cx("rounded-xl p-2.5 ring-1 ring-inset", accents[accent].icon)}>{icon}</div></div>
    <div className="relative mt-4 flex min-h-8 items-end justify-between gap-3"><p className={cx("text-xs", mutedText)}>{hint}</p>{chart && <div className="shrink-0 opacity-90 transition group-hover:scale-105">{chart}</div>}</div>
  </Card>;
}
