export { auth as middleware } from "@/lib/auth";

export const config = {
  // Protect dashboard routes; skip Next.js internals and static files
  matcher: ["/dashboard/:path*"],
};
