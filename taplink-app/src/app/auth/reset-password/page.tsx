"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { newPasswordSchema } from "@/lib/validation";
import type { z } from "zod";

type NewPasswordInput = z.infer<typeof newPasswordSchema>;

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordInput>({ resolver: zodResolver(newPasswordSchema) });

  async function onSubmit(data: NewPasswordInput) {
    setServerError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...data }),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 2500);
  }

  if (!token) {
    return (
      <div className="card text-center py-10">
        <p className="text-red-400">Invalid or missing reset token.</p>
        <Link href="/auth/forgot-password" className="btn-secondary mt-4 inline-flex">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in-up">
      {success ? (
        <div className="flex flex-col items-center text-center py-8 gap-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          <p className="font-semibold text-lg">Password reset!</p>
          <p className="text-white/60 text-sm">Redirecting to login…</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Set new password
          </h1>
          <p className="text-white/50 text-sm mb-6">Choose a strong password.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="reset-password"
                  placeholder="Min. 8 characters"
                  className={`input-field pr-10 ${errors.password ? "error" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type={showPassword ? "text" : "password"}
                id="reset-confirm-password"
                placeholder="Repeat password"
                className={`input-field ${errors.confirmPassword ? "error" : ""}`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              id="reset-submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,111,234,0.2) 0%, transparent 60%)",
        }}
      />
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center mb-8 gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
            T
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Taplink
          </span>
        </Link>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
