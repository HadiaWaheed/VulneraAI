
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { validatePassword } from "../lib/password";
import { Alert, Button, Field, Input } from "../components/ui";
import ThemeToggle from "../components/ThemeToggle";

type Step = "email" | "otp" | "password";

export function ForgotPasswordPage() {
  const {
    forgotPassword,
    verifyResetOTP,
    resetPassword,
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await forgotPassword(email.trim());

      setStep("otp");
      setSuccess(
        "If an account exists with this email, a reset code has been sent."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not process your request."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      await verifyResetOTP(email.trim(), otp);

      setStep("password");
      setSuccess("Code verified. You can now create a new password.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim(), otp, password);

      navigate("/login", {
        replace: true,
        state: {
          message: "Password reset successfully. Please log in.",
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reset your password."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      setOtp("");
      setSuccess("A new reset code has been requested.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not resend reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    email: "Forgot your password?",
    otp: "Verify your email",
    password: "Create new password",
  };

  const subtitles = {
    email: "Enter your registered email address to receive a reset code.",
    otp: "Enter the 6-digit code sent to your email address.",
    password: "Choose a strong password for your VulneraAI account.",
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink-950 px-5 py-12 text-slate-100">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_0%,rgba(99,102,241,0.10),transparent)]" />

      <div className="relative w-full max-w-[400px] animate-fade-up">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/20">
          {step === "email" && <Mail size={25} />}
          {step === "otp" && <ShieldCheck size={25} />}
          {step === "password" && <LockKeyhole size={25} />}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {titles[step]}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {subtitles[step]}
        </p>

        {error && (
          <div className="mt-6">
            <Alert>{error}</Alert>
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {step === "email" && (
          <form
            onSubmit={handleRequestOTP}
            className="mt-8 space-y-5"
          >
            <Field label="Email address">
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
          <form
            onSubmit={handleVerifyOTP}
            className="mt-8 space-y-5"
          >
            <div className="rounded-xl border border-neutral/[0.08] bg-ink-900/50 p-4">
              <p className="text-xs text-slate-500">
                Reset code requested for
              </p>

              <p className="mt-1 break-all text-sm font-medium text-foreground">
                {email}
              </p>
            </div>

            <Field label="6-digit verification code">
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(/\D/g, "").slice(0, 6)
                  )
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

            <div className="text-center">
              <button
                type="button"
                onClick={resendOTP}
                disabled={loading}
                className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
              >
                Resend reset code
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form
            onSubmit={handleResetPassword}
            className="mt-8 space-y-5"
          >
            <Field label="New password" hint="8+ chars: uppercase, lowercase, number & symbol.">
              <Input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter new password"
              />
            </Field>

            <Field label="Confirm new password">
              <Input
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
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

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            <ArrowLeft size={15} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
