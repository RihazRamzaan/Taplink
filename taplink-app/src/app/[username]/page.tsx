import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Page } from "@/lib/models";
import { getTheme } from "@/lib/themes";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  await connectDB();
  const page = await Page.findOne({ username: username.toLowerCase() }).lean();
  if (!page) return { title: "Not Found" };

  return {
    title: `${(page as { displayName?: string }).displayName || username} | Taplink`,
    description: (page as { bio?: string }).bio || `Check out ${username}'s links on Taplink`,
    openGraph: {
      title: `${(page as { displayName?: string }).displayName || username}`,
      description: (page as { bio?: string }).bio || "",
      images: (page as { avatarUrl?: string }).avatarUrl ? [(page as { avatarUrl?: string }).avatarUrl!] : [],
    },
  };
}

export default async function PublicPage({ params }: Props) {
  const { username } = await params;
  await connectDB();

  const page = await Page.findOne({ username: username.toLowerCase() }).lean() as {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    themeId?: string;
    isPublished?: boolean;
    links?: Array<{ _id: unknown; title: string; url: string; enabled: boolean; order: number; clicks: number }>;
  } | null;

  if (!page || !page.isPublished) notFound();

  const theme = getTheme(page.themeId ?? "default");
  const links = [...(page.links ?? [])]
    .filter((l) => l.enabled)
    .sort((a, b) => a.order - b.order);

  const initials = (page.displayName || username).charAt(0).toUpperCase();

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-12"
      style={{ background: theme.bg, color: theme.text }}
    >
      <div className="w-full max-w-md">
        {/* ── Profile ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-10">
          {page.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.avatarUrl}
              alt={page.displayName ?? username}
              className="w-24 h-24 rounded-full object-cover mb-4"
              style={{ border: `3px solid ${theme.border}` }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
              style={{ background: theme.card, border: `3px solid ${theme.border}` }}
            >
              {initials}
            </div>
          )}

          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: theme.text }}
          >
            {page.displayName || username}
          </h1>

          {page.bio && (
            <p className="mt-2 text-sm max-w-xs leading-relaxed" style={{ color: theme.subtext }}>
              {page.bio}
            </p>
          )}
        </div>

        {/* ── Links ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {links.length === 0 && (
            <p className="text-center text-sm" style={{ color: theme.subtext }}>
              No links yet.
            </p>
          )}
          {links.map((link, i) => (
            <a
              key={String(link._id)}
              href={`/r/${String(link._id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-btn"
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: theme.buttonRadius,
                color: theme.text,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {link.title}
            </a>
          ))}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="text-xs font-medium"
            style={{ color: theme.subtext, opacity: 0.6 }}
          >
            Powered by Taplink
          </a>
        </div>
      </div>
    </main>
  );
}
