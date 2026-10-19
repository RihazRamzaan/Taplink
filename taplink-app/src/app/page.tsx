import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taplink — Free Link in Bio Platform",
  description:
    "Create a beautiful link-in-bio page in minutes. Free, open-source, and self-hostable.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background blobs */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(124,111,234,0.3) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(56,189,248,0.15) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-3xl w-full mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Free & Open Source
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          One link for{" "}
          <span className="shimmer-text">everything</span>
        </h1>

        <p
          className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Share all your links, social profiles, and content in one beautiful,
          customisable page. No paywalls. No lock-in. Ever.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">
            Get Started Free
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base px-8 py-3">
            Sign In
          </Link>
        </div>

        {/* Feature pills */}
        <div
          className="flex flex-wrap justify-center gap-3 mt-16 animate-fade-in"
          style={{ animationDelay: "0.35s" }}
        >
          {[
            "🎨 5 Themes",
            "🔗 Unlimited Links",
            "📊 Click Analytics",
            "🚀 Self-Hostable",
            "🔒 Privacy-First",
            "✉️ Email Verification",
          ].map((f) => (
            <span
              key={f}
              className="glass px-4 py-2 rounded-full text-sm font-medium text-white/80"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
