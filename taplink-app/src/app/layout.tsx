import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Taplink — Your Link in Bio", template: "%s | Taplink" },
  description:
    "A free, open-source link-in-bio platform. Share all your links in one beautiful page.",
  keywords: ["link in bio", "linktree alternative", "open source", "taplink"],
  openGraph: {
    type: "website",
    siteName: "Taplink",
    title: "Taplink — Your Link in Bio",
    description:
      "A free, open-source link-in-bio platform. Share all your links in one beautiful page.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
