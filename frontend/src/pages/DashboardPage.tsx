
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock,
  Code2,
  FileText,
  Gauge,
  PieChart,
  Plus,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { api } from "../lib/api";
import { formatRelative, languageLabel, percent } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import type { Stats } from "../types";
import { EXAMPLES } from "../lib/examples";

import {
  DailyActivityChart,
  DonutChart,
  LanguageBreakdown,
  Sparkline,
} from "../components/charts";

import {
  Alert,
  Button,
  Card,
  CardHeader,
  ConfidenceBar,
  PredictionBadge,
  Skeleton,
} from "../components/ui";

const subtle = "text-[rgb(var(--text-secondary))]";
const muted = "text-[rgb(var(--text-muted))]";

function greeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}

// Compact KPI card
function MetricCard({
  label,
  value,
  hint,
  icon,
  accent,
  chart,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent: "indigo" | "rose" | "emerald" | "amber";
  chart?: ReactNode;
}) {
  const styles = {
    indigo: {
      icon: "bg-indigo-500/10 text-indigo-500 ring-indigo-500/20",
      line: "from-indigo-500 to-violet-500",
    },
    rose: {
      icon: "bg-rose-500/10 text-rose-500 ring-rose-500/20",
      line: "from-rose-500 to-pink-500",
    },
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
      line: "from-emerald-500 to-teal-400",
    },
    amber: {
      icon: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
      line: "from-amber-500 to-orange-400",
    },
  };

  const style = styles[accent];

  return (
    <Card className="relative min-w-0 overflow-hidden p-3.5 sm:p-4">
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${style.line}`}
      />

      <div className="flex items-center justify-between gap-2">
        <p className={`truncate text-xs font-semibold ${subtle}`}>
          {label}
        </p>

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${style.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight text-[rgb(var(--text-primary))] sm:text-[27px]">
            {value}
          </p>

          <p className={`mt-1 truncate text-[10px] ${muted}`}>
            {hint}
          </p>
        </div>

        {chart && (
          <div className="mb-1 w-[68px] shrink-0">
            {chart}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/stats")
      .then(setStats)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Could not load stats."
        )
      );
  }, []);

  const firstName = user?.name.split(" ")[0] ?? "";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (!stats) {
    return <DashboardSkeleton />;
  }

  const daily = stats.daily.map((d) => d.total);
  const dailyVuln = stats.daily.map((d) => d.vulnerable);
  const dailySafe = stats.daily.map(
    (d) => d.total - d.vulnerable
  );

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-5">

      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-[#17183e] via-[#25205c] to-[#382477] px-5 py-4 shadow-lg shadow-indigo-950/10 sm:px-6 sm:py-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 30%, #a78bfa 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="pointer-events-none absolute right-28 top-10 h-28 w-28 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200/80">
              <Sparkles size={12} />
              {today}
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {greeting()}, {firstName}!
            </h1>

            <p className="mt-1 text-xs text-indigo-100/75 sm:text-sm">
              Monitor your code security and keep your projects safe.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/scan">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-50">
                  <Plus size={14} />
                  Start new scan
                </span>
              </Link>

              <Link to="/history">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
                  <Clock size={13} />
                  View history
                </span>
              </Link>
            </div>
          </div>

          <div className="relative hidden h-24 w-28 shrink-0 items-center justify-center sm:flex">
            <div className="absolute h-24 w-24 rounded-full border border-indigo-300/20" />
            <div className="absolute h-16 w-16 rounded-full border border-violet-300/30" />
            <div className="absolute h-28 w-28 rounded-full border border-dashed border-indigo-300/20" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-200/30 bg-white/10 shadow-[0_0_35px_rgba(139,92,246,0.35)] backdrop-blur-md">
              <ShieldCheck size={30} className="text-indigo-100" />
            </div>

            <Code2 size={17} className="absolute right-0 top-2 text-violet-200" />
            <Sparkles size={13} className="absolute bottom-1 left-1 text-indigo-200" />
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]" />

          <p className={`text-[11px] font-semibold ${subtle}`}>
            Security overview · Updated just now
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            label="Total scans"
            value={String(stats.total_scans)}
            hint={`${stats.total_lines.toLocaleString()} lines analyzed`}
            accent="indigo"
            icon={<Activity size={16} />}
            chart={<Sparkline values={daily} color="#818cf8" />}
          />

          <MetricCard
            label="Vulnerable"
            value={String(stats.vulnerable_scans)}
            hint={`${percent(stats.vulnerable_rate)} of all scans`}
            accent="rose"
            icon={<ShieldAlert size={16} />}
            chart={<Sparkline values={dailyVuln} color="#f43f5e" />}
          />

          <MetricCard
            label="Safe"
            value={String(stats.safe_scans)}
            hint={`${percent(stats.total_scans ? 1 - stats.vulnerable_rate : 0)} of all scans`}
            accent="emerald"
            icon={<ShieldCheck size={16} />}
            chart={<Sparkline values={dailySafe} color="#10b981" />}
          />

          <MetricCard
            label="Avg. confidence"
            value={percent(stats.average_confidence)}
            hint="Average model confidence"
            accent="amber"
            icon={<Gauge size={16} />}
          />
        </div>
      </section>

      {/* Analytics */}
      {stats.total_scans === 0 ? (
        <GettingStarted />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-5">

            <Card className="min-w-0 overflow-hidden lg:col-span-3">
              <CardHeader
                title="Scan Analytics"
                subtitle="Daily scan volume and outcomes"
                icon={<BarChart3 size={16} />}
                action={
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold text-indigo-500">
                    14 day trend
                  </span>
                }
              />

              <div className="p-3 sm:p-4">
                <DailyActivityChart data={stats.daily} />
              </div>
            </Card>

            <Card className="min-w-0 overflow-hidden lg:col-span-2">
              <CardHeader
                title="Risk Distribution"
                subtitle="Safe vs vulnerable scans"
                icon={<PieChart size={16} />}
              />

              <div className="flex min-h-[190px] items-center justify-center p-3 sm:p-4">
                <DonutChart
                  safe={stats.safe_scans}
                  vulnerable={stats.vulnerable_scans}
                />
              </div>
            </Card>
          </section>

          {/* Recent scans and language */}
          <section className="grid gap-4 lg:grid-cols-5">

            <Card className="min-w-0 overflow-hidden lg:col-span-3">
              <CardHeader
                title="Recent Scan Results"
                subtitle="Your latest five scans"
                icon={<Clock size={16} />}
                action={
                  <Link
                    to="/history"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 transition hover:gap-2"
                  >
                    View all <ArrowRight size={13} />
                  </Link>
                }
              />

              {stats.recent.length ? (
                <ul className="divide-y divide-[rgb(var(--border))]">
                  {stats.recent.slice(0, 5).map((scan) => (
                    <li key={scan.id}>
                      <Link
                        to={`/history/${scan.id}`}
                        className="group flex items-center gap-2.5 px-3 py-3 transition hover:bg-indigo-500/[0.035] sm:gap-3 sm:px-4"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${
                            scan.prediction === "vulnerable"
                              ? "bg-rose-500/10 text-rose-500 ring-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
                          }`}
                        >
                          {scan.prediction === "vulnerable" ? (
                            <ShieldAlert size={15} />
                          ) : (
                            <ShieldCheck size={15} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-[rgb(var(--text-primary))] transition group-hover:text-indigo-500">
                            {scan.title}
                          </p>

                          <p className={`mt-1 truncate text-[10px] ${muted}`}>
                            {languageLabel(scan.language)} · {scan.total_lines} lines · {formatRelative(scan.created_at)}
                          </p>
                        </div>

                        <div className="hidden sm:block">
                          <ConfidenceBar
                            value={scan.confidence}
                            prediction={scan.prediction}
                          />
                        </div>

                        <PredictionBadge prediction={scan.prediction} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`px-4 py-8 text-center text-sm ${muted}`}>
                  No recent scans to show.
                </div>
              )}
            </Card>

            <Card className="min-w-0 overflow-hidden lg:col-span-2">
              <CardHeader
                title="Language Breakdown"
                subtitle="Scans by programming language"
                icon={<Code2 size={16} />}
              />

              <div className="p-4">
                <LanguageBreakdown data={stats.by_language} />
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

// Empty dashboard
function GettingStarted() {
  const steps = [
    {
      icon: Code2,
      title: "Paste your code",
      text: "Add a snippet in Python, JavaScript, Java, C/C++, Go and more.",
    },
    {
      icon: Sparkles,
      title: "Get a verdict",
      text: "GraphCodeBERT classifies it, and Gemini explains why with suggested fixes.",
    },
    {
      icon: FileText,
      title: "Track and export",
      text: "Every scan is saved to your history, with PDF and CSV export.",
    },
  ];

  return (
    <Card className="relative mt-1 overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative grid gap-5 p-5 lg:grid-cols-5 lg:p-6">
        <div className="lg:col-span-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-500">
            <Sparkles size={13} />
            Getting started
          </span>

          <h2 className="mt-3 text-xl font-bold tracking-tight text-[rgb(var(--text-primary))]">
            Run your first scan
          </h2>

          <p className={`mt-2 text-sm leading-6 ${subtle}`}>
            Your dashboard fills up with charts and history as you scan. Try one of the examples to see how it works.
          </p>

          <div className="mt-4">
            <Link to="/scan">
              <Button>
                <ScanSearch size={16} />
                Start scanning
              </Button>
            </Link>
          </div>

          <div className="mt-4">
            <p className={`mb-2 text-xs font-semibold ${muted}`}>
              Or try an example
            </p>

            <div className="flex flex-wrap gap-2">
              {EXAMPLES.slice(0, 3).map((example) => (
                <Link
                  key={example.id}
                  to={`/scan?example=${example.id}`}
                  className={`rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-3 py-1.5 text-xs font-medium ${subtle} transition hover:border-indigo-400/50 hover:text-indigo-500`}
                >
                  {example.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <ol className="grid content-center gap-3 lg:col-span-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] p-3 transition hover:border-indigo-400/30"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 ring-1 ring-inset ring-indigo-500/15">
                <step.icon size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                  <span className={`mr-2 font-mono text-xs ${muted}`}>
                    0{index + 1}
                  </span>
                  {step.title}
                </p>

                <p className={`mt-1 text-xs ${subtle}`}>
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="h-32 overflow-hidden bg-indigo-500/10">
        <div className="h-full w-full animate-pulse" />
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-7 w-16" />
            <Skeleton className="mt-3 h-3 w-28" />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-3">
          <Skeleton className="h-48 w-full" />
        </Card>

        <Card className="p-4 lg:col-span-2">
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
    </div>
  );
}
