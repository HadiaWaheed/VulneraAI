import ThemeToggle from "../components/ThemeToggle";
import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Eye,
  EyeOff,
  History,
  ShieldAlert,
  ShieldCheck,
  Mail,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/AppLayout";
import { Alert, Button, Field, Input } from "../components/ui";

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-ink-950 text-slate-100 md:grid-cols-[1.05fr_1fr]">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-neutral/[0.06] p-10 md:flex md:flex-col md:justify-between lg:p-14">
        <div className="app-backdrop absolute inset-0" />
        <div className="grid-fade absolute inset-0" />
        <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[32px] font-semibold leading-[1.15] tracking-tight text-foreground">
            Find security risks in your code before they ship.
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-slate-400">
            A fine-tuned GraphCodeBERT model classifies your snippet, and Gemini
            explains the result with suggested fixes.
          </p>

          {/* Sample result preview */}
          <div className="mt-8 rounded-2xl border border-neutral/[0.08] bg-ink-900/80 p-4 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-danger ring-1 ring-inset ring-rose-500/30">
                  <ShieldAlert size={17} />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-100">
                    get_user(cursor, username)
                  </p>
                  <p className="text-xs text-slate-500">
                    Python · 4 lines
                  </p>
                </div>
              </div>

              <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-danger">
                HIGH RISK
              </span>
            </div>

            <pre className="mt-4 overflow-hidden rounded-lg bg-ink-950/80 p-3 font-mono text-[12px] leading-5 text-slate-400">
{`query = "SELECT * FROM users WHERE name = '"
        + username + "'"`}
            </pre>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Bot size={13} className="text-accent" />
              SQL injection: use a parameterized query.
            </div>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            <Feature
              icon={<ShieldCheck size={16} />}
              text="Safe / vulnerable classification with confidence score"
            />
            <Feature
              icon={<History size={16} />}
              text="Every scan saved to your history, with PDF and CSV export"
            />
          </ul>
        </div>

        <p className="relative text-xs text-slate-600">
          VulneraAI · AI-powered multi-language code scanner
        </p>
      </div>

      {/* Form */}
      <div className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_0%,rgba(99,102,241,0.08),transparent)]" />

        <div className="relative w-full max-w-[380px] animate-fade-up">
          <div className="mb-10 md:hidden">
            <Logo />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>

          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-slate-500">
            {footer}
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="rounded-lg bg-neutral/[0.04] p-2 text-accent ring-1 ring-inset ring-neutral/[0.08]">
        {icon}
      </span>
      {text}
    </li>
  );
}

function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="pr-10"
      />

      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-300"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}


// --------------------------------------------------
// Login page
// --------------------------------------------------

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from || "/dashboard";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to scan code and view your history."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-accent underline-offset-4 hover:text-accent hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <PasswordInput
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="mt-2 w-full"
        >
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}



// --------------------------------------------------
// Forgot password + OTP verification + password reset
// --------------------------------------------------

export function ForgotPasswordPage() {
  const {
    forgotPassword,
    verifyResetOTP,
    resetPassword,
  } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setStep("otp");
      setSuccess(`A password reset code has been sent to ${email}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send password reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      await verifyResetOTP(email, otp);
      setStep("reset");
      setSuccess("Email verified. You can now create a new password.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, otp, password);
      setSuccess("Your password has been reset successfully. Please log in.");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset your password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setOtp("");
      setSuccess("A new password reset code has been sent to your email.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not resend password reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError("");
    setSuccess("");

    if (step === "reset") {
      setStep("otp");
      setPassword("");
      setConfirm("");
    } else if (step === "otp") {
      setStep("email");
      setOtp("");
    } else {
      navigate("/login");
    }
  };

  return (
    <AuthShell
      title={
        step === "email"
          ? "Forgot your password?"
          : step === "otp"
            ? "Verify your email"
            : "Create a new password"
      }
      subtitle={
        step === "email"
          ? "Enter your account email and we will send you a 6-digit reset code."
          : step === "otp"
            ? "Enter the 6-digit code sent to your email address."
            : "Choose a strong new password for your account."
      }
      footer={
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 font-medium text-accent hover:underline"
        >
          <ArrowLeft size={14} />
          {step === "email" ? "Back to login" : "Go back"}
        </button>
      }
    >
      {error && <Alert>{error}</Alert>}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </Field>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full"
          >
            Send reset code
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-neutral/[0.08] bg-ink-900/50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Mail size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Reset code sent to</p>
              <p className="break-all text-sm font-medium text-foreground">
                {email}
              </p>
            </div>
          </div>

          <Field label="6-digit reset code">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              className="text-center text-lg tracking-[0.4em]"
            />
          </Field>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full"
          >
            Verify code
          </Button>

          <div className="pt-2 text-center">
            <p className="mb-2 text-sm text-slate-500">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-sm font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resend reset code
            </button>
          </div>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Field label="New password" hint="At least 8 characters.">
            <PasswordInput
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <Field label="Confirm new password">
            <PasswordInput
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full"
          >
            Reset password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

// --------------------------------------------------
// Signup + email verification page
// --------------------------------------------------

export function SignupPage() {
  const {
    signup,
    verifyEmail,
    resendVerificationCode,
  } = useAuth();

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [otp, setOtp] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);

      setVerificationStep(true);
      setSuccess(`A 6-digit verification code has been sent to ${email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      await verifyEmail(email, otp);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Email verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      await resendVerificationCode(email);
      setSuccess("A new verification code has been sent to your email.");
      setOtp("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not resend verification code."
      );
    } finally {
      setResending(false);
    }
  };

  const goBackToSignup = () => {
    setVerificationStep(false);
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <AuthShell
      title={
        verificationStep
          ? "Verify your email"
          : "Create your account"
      }
      subtitle={
        verificationStep
          ? "Enter the 6-digit code we sent to your email address."
          : "Start scanning code in less than a minute."
      }
      footer={
        verificationStep ? (
          <button
            type="button"
            onClick={goBackToSignup}
            className="inline-flex items-center gap-2 font-medium text-accent hover:underline"
          >
            <ArrowLeft size={14} />
            Back to signup
          </button>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-accent underline-offset-4 hover:text-accent hover:underline"
            >
              Log in
            </Link>
          </>
        )
      }
    >
      {verificationStep ? (
        <form onSubmit={handleVerify} className="space-y-4">
          {error && <Alert>{error}</Alert>}

          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <div className="flex items-center gap-3 rounded-xl border border-neutral/[0.08] bg-ink-900/50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Mail size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Verification email sent to
              </p>
              <p className="break-all text-sm font-medium text-foreground">
                {email}
              </p>
            </div>
          </div>

          <Field label="Verification code" hint="The code expires in 5 minutes.">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              className="text-center text-lg tracking-[0.4em]"
            />
          </Field>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full"
          >
            Verify email
          </Button>

          <div className="pt-2 text-center">
            <p className="mb-2 text-sm text-slate-500">
              Didn&apos;t receive the code?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification code"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          {error && <Alert>{error}</Alert>}

          <Field label="Full name">
            <Input
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password" hint="At least 8 characters.">
            <PasswordInput
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <Field label="Confirm password">
            <PasswordInput
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="mt-2 w-full"
          >
            Create account
          </Button>
        </form>
      )}
    </AuthShell>
  );
}