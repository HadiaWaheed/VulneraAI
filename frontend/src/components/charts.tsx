import { useId, useState } from "react";
import type { DailyCount, LanguageCount } from "../types";
import { languageLabel } from "../lib/format";

const SAFE_COLOR = "#10b981";
const VULN_COLOR = "#f43f5e";
const labelClass = "text-[rgb(var(--text-secondary))]";
const mutedClass = "text-[rgb(var(--text-muted))]";

export function DonutChart({ safe, vulnerable }: { safe: number; vulnerable: number }) {
  const total = safe + vulnerable;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const vulnerableShare = total ? vulnerable / total : 0;
  const vulnerableLength = circumference * vulnerableShare;
  return <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
    <div className="relative h-40 w-40 shrink-0 rounded-full">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label={`${vulnerable} vulnerable and ${safe} safe scans`}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" className="text-[rgb(var(--border))]" strokeWidth="15" />
        {total > 0 && <><circle cx="70" cy="70" r={radius} fill="none" stroke={SAFE_COLOR} strokeWidth="15" strokeDasharray={`${circumference - vulnerableLength} ${circumference}`} strokeDashoffset={-vulnerableLength} strokeLinecap="round" /><circle cx="70" cy="70" r={radius} fill="none" stroke={VULN_COLOR} strokeWidth="15" strokeDasharray={`${vulnerableLength} ${circumference}`} strokeLinecap="round" /></>}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold tabular-nums text-[rgb(var(--text-primary))]">{total}</span><span className={`text-xs ${mutedClass}`}>total scans</span></div>
    </div>
    <div className="min-w-[150px] space-y-3 text-sm"><Legend color={VULN_COLOR} label="Vulnerable" value={vulnerable} total={total} /><Legend color={SAFE_COLOR} label="Safe" value={safe} total={total} /></div>
  </div>;
}
function Legend({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
  return <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /><span className={`flex-1 ${labelClass}`}>{label}</span><span className="font-semibold tabular-nums text-[rgb(var(--text-primary))]">{value}</span><span className={`w-10 text-right text-xs tabular-nums ${mutedClass}`}>{total ? `${Math.round(value / total * 100)}%` : "0%"}</span></div>;
}

export function DailyActivityChart({ data }: { data: DailyCount[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map(d => d.total));
  const active = hovered !== null ? data[hovered] : null;
  return <div>
    <div className={`mb-3 flex min-h-6 items-center justify-between gap-2 text-xs ${mutedClass}`}>
      {active ? <span><strong className="font-semibold text-[rgb(var(--text-primary))]">{formatDay(active.date)}</strong>{" · "}{active.total} scans · {active.vulnerable} vulnerable</span> : <span>Daily scan volume</span>}
      <span className="rounded-full bg-indigo-500/8 px-2.5 py-1 text-indigo-500">Last 14 days</span>
    </div>
    <div className="flex h-44 items-end gap-1.5 sm:gap-2" onMouseLeave={() => setHovered(null)}>
      {data.map((day, index) => {
        const safeCount = Math.max(0, day.total - day.vulnerable);
        return <div key={day.date} className="group flex h-full min-w-0 flex-1 cursor-default flex-col justify-end" onMouseEnter={() => setHovered(index)}>
          <div className="relative flex w-full flex-col justify-end overflow-hidden rounded-t-md bg-[rgb(var(--border))]/40 transition-all" style={{ height: `${day.total ? Math.max(4, day.total / max * 100) : 0}%`, minHeight: day.total ? 4 : 0, opacity: hovered === null || hovered === index ? 1 : .4 }}>
            {day.vulnerable > 0 && <div style={{ height: `${day.vulnerable / day.total * 100}%`, background: VULN_COLOR }} />}
            {safeCount > 0 && <div style={{ height: `${safeCount / day.total * 100}%`, background: SAFE_COLOR }} />}
          </div>
          <div className={`mt-2 h-1 rounded-full transition ${hovered === index ? "bg-indigo-500" : "bg-transparent"}`} />
        </div>;
      })}
    </div>
    <div className={`mt-1 flex justify-between text-[11px] ${mutedClass}`}><span>{data[0] && formatDay(data[0].date)}</span><span>{data.length ? formatDay(data[data.length - 1].date) : "Today"}</span></div>
    <div className={`mt-4 flex flex-wrap gap-4 border-t border-[rgb(var(--border))] pt-3 text-xs ${labelClass}`}><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm" style={{ background: VULN_COLOR }} /> Vulnerable</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm" style={{ background: SAFE_COLOR }} /> Safe</span></div>
  </div>;
}
function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function LanguageBreakdown({ data }: { data: LanguageCount[] }) {
  const max = Math.max(1, ...data.map(d => d.total));
  if (!data.length) return <p className={`py-8 text-center text-sm ${mutedClass}`}>No language data yet.</p>;
  return <div className="space-y-5">{data.slice(0, 6).map(row => {
    const vulnWidth = row.total ? row.vulnerable / max * 100 : 0;
    const safeWidth = row.total ? Math.max(0, row.total - row.vulnerable) / max * 100 : 0;
    return <div key={row.language}>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className={`font-medium ${labelClass}`}>{languageLabel(row.language)}</span><span className="shrink-0 text-xs tabular-nums text-[rgb(var(--text-primary))]">{row.total} <span className={mutedClass}>scans</span></span></div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-[rgb(var(--border))]"><div className="rounded-l-full transition-all" style={{ width: `${vulnWidth}%`, background: VULN_COLOR }} /><div className="rounded-r-full transition-all" style={{ width: `${safeWidth}%`, background: SAFE_COLOR }} /></div>
      <p className={`mt-1.5 text-[11px] ${mutedClass}`}>{row.vulnerable} vulnerable · {Math.max(0, row.total - row.vulnerable)} safe</p>
    </div>;
  })}</div>;
}

export function Sparkline({ values, color = "#6366f1", width = 96, height = 32 }: {
  values: number[]; color?: string; width?: number; height?: number;
}) {
  const gradientId = useId().replace(/:/g, "");
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = Math.max(1, max - min);
  const step = width / (values.length - 1);
  const points = values.map((v, i) => [i * step, height - 3 - ((v - min) / range) * (height - 6)]);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    <path d={area} fill={`url(#${gradientId})`} /><path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
  </svg>;
}
