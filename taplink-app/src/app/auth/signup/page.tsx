"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { signUpSchema, type SignUpInput } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(data: SignUpInput) {
    setServerError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/auth/login?registered=true"), 2500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 0%, rgba(124,111,234,0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 90%, rgba(56,189,248,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8 gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
            T
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Taplink
          </span>
        </Link>

        <div className="card animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Create your account
          </h1>
          <p className="text-white/50 text-sm mb-6">
            Free forever. No credit card required.
          </p>

          {success ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <p className="font-semibold text-lg">Account created!</p>
              <p className="text-white/60 text-sm">
                Check your email to verify your account. Redirecting to login…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {serverError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {serverError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  id="signup-email"
                  placeholder="you@example.com"
                  className={`input-field ${errors.email ? "error" : ""}`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                    taplink.to/
                  </span>
                  <input
                    {...register("username")}
                    type="text"
                    id="signup-username"
                    placeholder="yourname"
                    className={`input-field pl-[88px] ${errors.username ? "error" : ""}`}
                    autoComplete="username"
                    autoCapitalize="none"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Display Name <span className="text-white/30">(optional)</span>
                </label>
                <input
                  {...register("displayName")}
                  type="text"
                  id="signup-displayname"
                  placeholder="Your Name"
                  className="input-field"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id="signup-password"
                    placeholder="Min. 8 characters"
                    className={`input-field pr-10 ${errors.password ? "error" : ""}`}
                    autoComplete="new-password"
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

              <button
                type="submit"
                id="signup-submit"
                className="btn-primary w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Creating account…" : "Create Account"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
