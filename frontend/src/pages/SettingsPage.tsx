import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Trash2, UserRound } from "lucide-react";

import { api } from "../lib/api";
import { formatDateTime } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { validatePassword } from "../lib/password";
import type { User } from "../types";
import { Alert, Button, Card, Field, Input, PageHeader, cx, useToast } from "../components/ui";

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" subtitle="Manage your profile, password and account." />
      <div className="space-y-6">
        <ProfileForm />
        <PasswordForm />
        <DangerZone />
      </div>
    </>
  );
}

/** Two-column settings section: description on the left, form on the right. */
function Section({
  icon, title, description, children, danger = false,
}: {
  icon: ReactNode; title: string; description: string; children: ReactNode; danger?: boolean;
}) {
  return (
    <Card className={cx("grid gap-6 p-6 md:grid-cols-[260px_1fr] md:gap-10", danger && "border-rose-500/20")}>
      <div>
        <div className={cx(
          "mb-3 flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset",
          danger ? "bg-rose-500/10 text-danger ring-rose-500/20" : "bg-neutral/[0.04] text-slate-300 ring-neutral/[0.08]"
        )}>
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </Card>
  );
}

function ProfileForm() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const unchanged = name === user?.name && email === user?.email;

  const initials = (user?.name || "?").split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await api<{ user: User }>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      });
      setUser(data.user);
      toast("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={<UserRound size={17} />} title="Profile"
      description={user ? `Your name and email. Member since ${formatDateTime(user.created_at)}.` : "Your name and email."}>
      <form onSubmit={save} className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/50 to-violet-500/50 text-lg font-semibold text-foreground ring-1 ring-inset ring-neutral/15">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end border-t border-neutral/[0.06] pt-5">
          <Button type="submit" loading={saving} disabled={unchanged}>Save changes</Button>
        </div>
      </form>
    </Section>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const passwordError = validatePassword(next);
    if (passwordError) return setError(passwordError);
    if (next !== confirm) return setError("New passwords do not match.");

    setSaving(true);
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      setCurrent(""); setNext(""); setConfirm("");
      toast("Password updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={<KeyRound size={17} />} title="Password"
      description="Use 8+ characters with uppercase, lowercase, a number and a symbol. You stay logged in on this device after changing it.">
      <form onSubmit={save} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="max-w-md space-y-4">
          <Field label="Current password">
            <Input type="password" autoComplete="current-password" required value={current}
              onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="New password" hint="8+ chars: uppercase, lowercase, number & symbol.">
            <Input type="password" autoComplete="new-password" required value={next}
              onChange={(e) => setNext(e.target.value)} />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" autoComplete="new-password" required value={confirm}
              onChange={(e) => setConfirm(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end border-t border-neutral/[0.06] pt-5">
          <Button type="submit" loading={saving} disabled={!current || !next || !confirm}>Update password</Button>
        </div>
      </form>
    </Section>
  );
}

function DangerZone() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault();
    setDeleting(true);
    setError("");
    try {
      await api("/api/auth/me", { method: "DELETE", body: JSON.stringify({ password }) });
      logout();
      navigate("/signup", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete account.");
      setDeleting(false);
    }
  };

  return (
    <Section danger icon={<Trash2 size={17} />} title="Delete account"
      description="Permanently delete your account and all saved scans. This cannot be undone.">
      {!open ? (
        <div className="flex h-full items-center">
          <Button variant="danger-outline" onClick={() => setOpen(true)}>
            Delete my account
          </Button>
        </div>
      ) : (
        <form onSubmit={deleteAccount} className="space-y-4">
          <Alert tone="warning">All your scans will be deleted. Enter your password to confirm.</Alert>
          {error && <Alert>{error}</Alert>}
          <div className="max-w-md">
            <Field label="Password">
              <Input type="password" autoComplete="current-password" required value={password}
                onChange={(e) => setPassword(e.target.value)} />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="danger" loading={deleting}>Permanently delete</Button>
            <Button type="button" variant="secondary" onClick={() => { setOpen(false); setPassword(""); setError(""); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Section>
  );
}
