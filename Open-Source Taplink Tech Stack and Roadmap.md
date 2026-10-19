# Open-Source Linktree Alternative: Tech Stack and Roadmap

A free, open-source, self-hostable link-in-bio platform. This document covers the full technology stack, architecture, and a phased roadmap with clear deliverables and exit criteria.

## 1. Project Principles

- **Free forever:** no paywalled features, no plans or billing code.
- **Self-hostable in one command:** Docker Compose brings up the whole app.
- **Portable:** no vendor lock-in; every managed service has a self-hosted equivalent.
- **Privacy-first:** hashed visitor IDs, no raw IP storage, configurable analytics, data export.
- **Contributor-friendly:** clear structure, good docs, themes and translations as simple files.

## 2. Tech Stack

### Application

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | Server-rendered public pages (fast, SEO-friendly), one codebase for UI and API |
| UI | React + Tailwind CSS | Quick, consistent styling; easy theming |
| Components | shadcn/ui (Radix primitives) | Accessible, unstyled-by-default components |
| Drag and drop | dnd-kit | Link reordering in the editor |
| Forms and validation | React Hook Form + Zod | Shared validation on client and server |
| State and data fetching | TanStack Query | Caching and optimistic updates in the editor |

### Backend and Data

| Layer | Choice | Why |
| --- | --- | --- |
| Database | MongoDB (replica set) | Page and links form a natural document; one read per public page |
| Database alternative | FerretDB (Apache 2.0, Postgres-backed) | Keeps a fully open-source stack; compatible with the MongoDB driver |
| ODM / driver | Mongoose or official MongoDB Node driver | Schemas and validation |
| Authentication | Auth.js (NextAuth) with MongoDB adapter | Email/password and OAuth, no vendor lock-in |
| Password hashing | Argon2id | Current best practice |
| File storage | Storage adapter: local disk or any S3-compatible bucket (MinIO, R2, S3) | Works on a cheap VPS or in the cloud |
| Email | Nodemailer over SMTP | Works with any provider |
| Cache and rate limiting | Redis (optional), in-memory fallback | Rate limits, bot filtering, hot page cache |
| Background jobs | BullMQ (with Redis) or a simple cron worker | Rollups, link checks, cleanup |

### Infrastructure and Tooling

| Area | Choice |
| --- | --- |
| Containers | Docker and Docker Compose (app, MongoDB replica set, optional Redis, optional MinIO) |
| Reverse proxy / SSL | Caddy (automatic HTTPS, easy custom domains) |
| CI/CD | GitHub Actions (lint, test, build, publish image) |
| Testing | Vitest (unit), Playwright (end-to-end) |
| Code quality | ESLint, Prettier, Husky pre-commit hooks |
| Docs site | Docusaurus or VitePress |
| i18n | next-intl, translations as JSON files |
| Error monitoring (optional) | Sentry-compatible or GlitchTip (self-hostable) |
| Hosted demo | Vercel or a small VPS, MongoDB Atlas free tier |
| Safety | Google Safe Browsing API (optional) for link scanning |

### Licensing

- **Recommended:** AGPL-3.0, so hosted forks must share their changes. Choose MIT or Apache 2.0 instead if maximum adoption matters more than protection.
- **Note on MongoDB:** it uses the SSPL, which is not OSI-approved. This is fine for self-hosters, but FerretDB is the fallback for a purist open-source stack.

## 3. Architecture Overview

1. **Public page** (`/{username}`): server-rendered, reads one `pages` document, cached, mobile-first.
2. **Click redirect** (`/r/{linkId}`): logs an event, then redirects with a 302.
3. **Dashboard** (`/dashboard`): authenticated editor and analytics.
4. **API routes** (`/api/*`): auth, pages, links, uploads, analytics, reports.
5. **Worker:** daily analytics rollups, event TTL cleanup, optional link health checks.
6. **Storage and email adapters:** swappable via environment variables.

### Data Model (MongoDB)

- **users:** email, passwordHash, username (lowercase, unique), isSuspended, createdAt.
- **pages:** userId, displayName, bio, avatarUrl, themeId, style, isPublished, and an embedded `links` array (array order is display order).
- **events:** time series collection with pageId, linkId, type (click or view), country, device, referrer, visitorHash, with a TTL.
- **dailyStats:** rollups per page and link per day.
- **reports, blockedDomains, reservedUsernames, themes, instanceSettings:** small supporting collections.

Key rules: cap links per page (100 to 200), enforce unique indexes on `username`, `email`, and `userId`, and delete a user's page and events through one tested function since MongoDB has no cascading deletes.

### Suggested Repository Layout

```
/app            Next.js routes (public pages, dashboard, API)
/components     UI components
/lib            db, auth, storage, mail, analytics, validation
/themes         community themes as JSON files
/locales        translation JSON files
/scripts        index setup, seed data, admin CLI
/worker         background jobs
/docs           documentation source
/docker         Dockerfile, compose files, Caddyfile
.env.example
CONTRIBUTING.md  CODE_OF_CONDUCT.md  SECURITY.md  LICENSE
```

## 4. Roadmap

Timelines assume one to two part-time developers and are estimates, not promises.

### Phase 0: Foundation (Week 1)

**Goal:** a project anyone can clone and run.

- Create the repo, choose a license, and set up the Next.js + TypeScript + Tailwind skeleton.
- Set up ESLint, Prettier, Husky, and GitHub Actions CI.
- Write `docker-compose.yml` with the MongoDB replica set and a `.env.example`.
- Add README, CONTRIBUTING, CODE\_OF\_CONDUCT, and SECURITY files.

**Exit criteria:** `docker compose up` starts a working empty app, and CI passes on every pull request.

### Phase 1: MVP (Weeks 2 to 5)

**Goal:** a user can sign up and publish a working link page.

- Sign up, log in, email verification, and password reset.
- Username claiming with format checks and a reserved-word list.
- Link editor: add, edit, delete, drag-to-reorder, and toggle on or off.
- Profile: avatar upload, display name, and bio.
- Public page at `/{username}`, server-rendered and mobile-first.
- Three to five starter themes.
- Storage and email adapters (local disk and SMTP to begin).

**Exit criteria:** a new user can go from sign-up to a live public page in under five minutes, and end-to-end tests cover this flow.

### Phase 2: Launch-Ready (Weeks 6 to 9)

**Goal:** safe and useful enough for a public release.

- Click and view tracking through the `/r/{linkId}` redirect.
- Analytics dashboard: totals, 7 and 30-day trends, top links.
- Social icon row (Instagram, YouTube, X, GitHub, and more).
- Moderation basics: report button, blocked-domain list, user suspension.
- Rate limiting and basic bot filtering on tracking endpoints.
- Open Graph tags and share preview images.
- Instance settings: toggle signups, email verification, and analytics.
- Issue templates, pull request template, and a first documentation site.

**Exit criteria:** security review done, v0.1.0 released, hosted demo live, announcement posted.

### Phase 3: Growth (Weeks 10 to 15)

**Goal:** richer pages and a stronger contributor ecosystem.

- Custom colors, fonts, backgrounds, and button styles.
- Theme system: contributors submit themes as JSON files.
- Link scheduling (start and end dates).
- Header and divider blocks, plus embeds (YouTube, Spotify).
- QR code for each page.
- OAuth login (Google, GitHub, Apple).
- Analytics breakdowns by country, device, and referrer, with daily rollups.
- Custom domains for self-hosters, using Caddy automatic HTTPS.

**Exit criteria:** at least ten themes, analytics stay fast with large event volumes, and the first outside contributions merged.

### Phase 4: Community (Weeks 16 to 22)

**Goal:** make the project sustainable and easy to adopt.

- Full documentation site: self-hosting guide, theme guide, API reference, contributor guide.
- Import and export of a user's page as JSON (data portability).
- Internationalization with community-contributed translations.
- Webhooks and a simple plugin hook system.
- Account deletion and full data export for privacy compliance.
- Official Docker image on GitHub Container Registry, plus one-click deploy templates.

**Exit criteria:** v1.0.0 released with stable data format and a documented upgrade path.

### Phase 5: Future Ideas

- Multiple pages per account.
- Public REST API with API keys.
- Admin moderation dashboard and automated link scanning.
- Email or contact-form capture blocks.
- Team and agency accounts.
- Optional federation or ActivityPub integration.
- Progressive web app support for the dashboard.

## 5. Cross-Cutting Requirements

**Security**

- Argon2id hashing, secure session cookies, CSRF protection, and input validation with Zod.
- Only allow `http` and `https` link schemes; block `javascript:` and similar URLs.
- Sanitize all user-provided text and uploaded images (re-encode, limit size and type).
- Rate limit sign-up, login, reports, and the redirect endpoint.

**Privacy**

- Store hashed visitor IDs, never raw IP addresses.
- Configurable retention through TTL on events.
- No third-party trackers in the app itself.

**Performance**

- Cache public pages and invalidate on edit.
- Use a daily rollup collection once dashboards slow down.
- Keep public page JavaScript minimal.

**Quality**

- Unit tests for validation and data functions, end-to-end tests for the main user flows.
- Required CI checks before merge, and semantic versioning with a changelog.

## 6. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Spam and phishing pages | Blocked domains, report flow, optional Safe Browsing scan, easy suspension |
| Hosting costs on the public instance | Free tiers, event TTL, rate limits, invite or signup toggle |
| MongoDB licensing concerns | Keep to standard features so FerretDB remains a drop-in option |
| Maintainer burnout | Clear contributing guide, good first issues, a small core scope |
| Unbounded analytics growth | Time series collection, TTL, daily rollups |

## 7. Immediate Next Steps

1. Confirm the license (AGPL-3.0 or MIT) and the project name.
2. Create the repository and complete Phase 0.
3. Build the schema and index setup script.
4. Start Phase 1 with auth and the public page, then the editor.
