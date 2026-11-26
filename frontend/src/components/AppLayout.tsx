
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
  Sparkles,
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
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/40 blur-xl" />
        <div className="relative rounded-2xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 p-2.5 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
          <ShieldCheck size={20} className="text-white" strokeWidth={2.2} />
        </div>
      </div>

      {!compact && (
        <div className="min-w-0">
          <p className="text-[16px] font-bold leading-tight tracking-tight text-foreground">
            VulneraAI
          </p>
          <p className="mt-1 text-[10px] font-medium tracking-wide text-slate-500">
            CODE SECURITY PLATFORM
          </p>
        </div>
      )}
    </div>
  );
}

function StatusPill({
  health,
  error,
}: {
  health: Health | null;
  error: boolean;
}) {
  if (error) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-danger">
        <span className="h-2 w-2 rounded-full bg-rose-400" />
        Backend offline
      </span>
    );
  }

  if (!health) return null;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span
        title={
          health.model_name
            ? `${health.model_name} · ${health.scoring_rule_description ?? ""}`
            : undefined
        }
        className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-2 text-xs font-medium text-success"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Model online
      </span>

      <span
        title={
          health.gemini_configured
            ? health.gemini_model
            : "Set GEMINI_API_KEY in .env"
        }
        className={cx(
          "hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium xl:inline-flex",
          health.gemini_configured
            ? "border-indigo-500/20 bg-indigo-500/[0.08] text-accent"
            : "border-amber-500/20 bg-amber-500/[0.08] text-warning"
        )}
      >
        <Sparkles size={13} />
        {health.gemini_configured
          ? "AI explanations on"
          : "AI explanations off"}
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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Existing backend health check preserved.
  useEffect(() => {
    const check = () =>
      api<Health>("/api/health")
        .then((data) => {
          setHealth(data);
          setHealthError(false);
        })
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
  const pageTitle = PAGE_TITLES[section] ?? "VulneraAI";
  const isDetail = /^\/history\/\d+/.test(location.pathname);

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-[82px] items-center border-b border-[rgb(var(--border))] px-6">
        <Link to="/dashboard" className="rounded-xl">
          <Logo />
        </Link>
      </div>

      {/* New scan action */}
      <div className="px-4 pb-5 pt-6">
        <Link to="/scan" className="block">
          <Button className="w-full justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/30">
            <Plus size={17} />
            New scan
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 pb-5">
        {NAV_SECTIONS.map((group) => (
          <div key={group.label}>
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to !== "/history"}
                  className={({ isActive }) =>
                    cx(
                      "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-indigo-500/10 text-accent shadow-sm"
                        : "text-slate-500 hover:bg-[rgb(var(--surface-hover))] hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                      )}

                      <span
                        className={cx(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                          isActive
                            ? "bg-indigo-500/15 text-accent"
                            : "bg-transparent text-slate-500 group-hover:bg-[rgb(var(--surface-hover))] group-hover:text-foreground"
                        )}
                      >
                        <Icon size={17} strokeWidth={2} />
                      </span>

                      <span>{label}</span>

                      {isActive && (
                        <ChevronRight
                          size={15}
                          className="ml-auto text-accent/70"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-[rgb(var(--border))] p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {user?.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="rounded-xl p-2.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-danger"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-backdrop relative min-h-screen text-foreground">
      <div className="grid-fade pointer-events-none fixed inset-x-0 top-0 z-0 h-[460px]" />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[264px] border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))]/90 shadow-[4px_0_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl md:block">
        {sidebar}
      </aside>

      {/* Mobile navigation drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 w-[290px] border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-2xl animate-fade-up">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-6 z-10 rounded-lg p-2 text-slate-500 transition hover:bg-[rgb(var(--surface-hover))] hover:text-foreground"
            >
              <X size={19} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="relative z-10 md:pl-[264px]">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))]/85 px-4 shadow-sm backdrop-blur-2xl sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-[rgb(var(--surface-hover))] hover:text-foreground md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="md:hidden"><Logo compact /></div>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="hidden text-slate-500 sm:inline">PolyGuard</span>
              <ChevronRight size={14} className="hidden text-slate-600 sm:inline" />
              {isDetail ? (
                <>
                  <Link
                    to="/history"
                    className="text-slate-500 transition hover:text-accent"
                  >
                    History
                  </Link>

                  <ChevronRight size={15} className="text-slate-500" />

                  <span className="truncate font-semibold text-foreground">
                    Scan #{location.pathname.split("/")[2]}
                  </span>
                </>
              ) : (
                <span className="truncate font-semibold text-foreground">
                  {pageTitle}
                </span>
              )}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <StatusPill health={health} error={healthError} />
            <div className="h-7 w-px bg-[rgb(var(--border))] hidden sm:block" />
            <ThemeToggle />
          </div>
        </header>

        {/* Main page content */}
        <main className="relative mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-9 lg:px-9 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
