"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { resetPasswordSchema } from "@/lib/validation";
import type { z } from "zod";

type ForgotInput = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(data: ForgotInput) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSent(true);
  }

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

        <div className="card animate-fade-in-up">
          {sent ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-violet-400" />
              </div>
              <h1 className="text-xl font-bold">Check your inbox</h1>
              <p className="text-white/60 text-sm">
                If that email is registered, we've sent a reset link. Check your spam folder
                if you don't see it within a few minutes.
              </p>
              <Link href="/auth/login" className="btn-secondary mt-2">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Forgot password?
              </h1>
              <p className="text-white/50 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    id="forgot-email"
                    placeholder="you@example.com"
                    className={`input-field ${errors.email ? "error" : ""}`}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  id="forgot-submit"
                  className="btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <div className="text-center mt-4">
                <Link href="/auth/login" className="text-sm text-white/40 hover:text-white/70">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
