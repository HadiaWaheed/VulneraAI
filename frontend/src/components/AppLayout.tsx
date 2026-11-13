import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ScanSearch,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button, cx } from "./ui";

import ThemeToggle from "./ThemeToggle";

const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/scan", label: "New Scan", icon: ScanSearch },
      { to: "/history", label: "History", icon: History },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/scan": "New Scan",
  "/history": "History",
  "/settings": "Settings",
};

interface Health {
  model_loaded: boolean;
  model_name?: string;
  scoring_rule_description?: string;
  gemini_configured: boolean;
  gemini_model: string;
  device: string;
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-indigo-500/40 blur-md" />
        <div className="relative rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 p-[7px] ring-1 ring-inset ring-neutral/20">
          <ShieldCheck size={18} className="text-white" strokeWidth={2.2} />
        </div>
      </div>
      {!compact && (
        <div>
          <p className="text-[15px] font-semibold leading-tight tracking-tight text-foreground">VulneraAI</p>
          <p className="text-[11px] leading-tight text-slate-500">Code Vulnerability Scanner</p>
        </div>
      )}
    </div>
  );
}

function StatusPill({ health, error }: { health: Health | null; error: boolean }) {
  if (error) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs text-danger">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Backend offline
      </span>
    );
  }
  if (!health) return null;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span
        title={health.model_name ? `${health.model_name} · ${health.scoring_rule_description ?? ""}` : undefined}
        className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 text-xs text-success">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Model online
      </span>
      <span
        title={health.gemini_configured ? health.gemini_model : "Set GEMINI_API_KEY in .env"}
        className={cx(
          "hidden items-center gap-2 rounded-full border px-3 py-1 text-xs xl:inline-flex",
          health.gemini_configured
            ? "border-indigo-500/20 bg-indigo-500/[0.08] text-accent"
            : "border-amber-500/20 bg-amber-500/[0.08] text-warning"
        )}
      >
        <span className={cx("h-1.5 w-1.5 rounded-full", health.gemini_configured ? "bg-indigo-400" : "bg-amber-400")} />
        {health.gemini_configured ? "AI explanations on" : "AI explanations off"}
      </span>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState(false);

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Backend status, refreshed every 30 seconds.
  useEffect(() => {
    const check = () =>
      api<Health>("/api/health")
        .then((data) => { setHealth(data); setHealthError(false); })
        .catch(() => setHealthError(true));
    check();
    const timer = setInterval(check, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = (user?.name || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const section = "/" + (location.pathname.split("/")[1] || "dashboard");
  const pageTitle = PAGE_TITLES[section] ?? "PolyGuard";
  const isDetail = /^\/history\/\d+/.test(location.pathname);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link to="/dashboard"><Logo /></Link>
      </div>

      <div className="px-3 pb-2">
        <Link to="/scan">
          <Button className="w-full" size="md"><Plus size={16} /> New scan</Button>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cx(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-neutral/[0.06] text-foreground"
                        : "text-slate-400 hover:bg-neutral/[0.03] hover:text-slate-200"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400" />
                      )}
                      <Icon size={17} className={isActive ? "text-accent" : "text-slate-500 group-hover:text-slate-300"} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-neutral/[0.06] bg-neutral/[0.02] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-500/40 text-xs font-semibold text-foreground ring-1 ring-inset ring-neutral/15">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-100">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-danger"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-backdrop min-h-screen text-slate-100">
      <div className="grid-fade pointer-events-none fixed inset-x-0 top-0 h-[420px]" />

      {/* Sidebar (tablet and up) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-neutral/[0.06] bg-ink-950/80 backdrop-blur-xl md:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-neutral/[0.06] bg-ink-950 animate-fade-up">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-neutral/[0.06]"
            >
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="relative md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-neutral/[0.06] bg-ink-950/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="-ml-1 rounded-lg p-2 text-slate-300 hover:bg-neutral/[0.06] md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="md:hidden"><Logo compact /></div>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="hidden text-slate-500 sm:inline">PolyGuard</span>
              <ChevronRight size={14} className="hidden text-slate-600 sm:inline" />
              {isDetail ? (
                <>
                  <Link to="/history" className="text-slate-400 hover:text-slate-200">History</Link>
                  <ChevronRight size={14} className="text-slate-600" />
                  <span className="truncate font-medium text-slate-100">
                    Scan #{location.pathname.split("/")[2]}
                  </span>
                </>
              ) : (
                <span className="truncate font-medium text-slate-100">{pageTitle}</span>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3"><StatusPill health={health} error={healthError} /><ThemeToggle /></div>
        </header>

        <main className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
