# Taplink — Open-Source Link in Bio Platform

A free, self-hostable, open-source link-in-bio platform built with Next.js 16, React 19, Tailwind CSS, and MongoDB.

---

## 🚀 Quick Start with Docker (Recommended)

Run the full stack (Next.js app, MongoDB replica set, and Mailpit email inspector) with a single command:

```bash
docker compose up --build
```

### Services Started:

| Service | URL | Purpose |
| :--- | :--- | :--- |
| **Taplink App** | [http://localhost:3000](http://localhost:3000) | Next.js web application (with live hot-reloading) |
| **Mailpit Web UI** | [http://localhost:8025](http://localhost:8025) | Local inbox to preview verification and auth emails |
| **MongoDB** | `localhost:27017` | MongoDB 7.0 (with `rs0` replica set initialized) |

Any edits made in `./taplink-app` will immediately hot-reload in the running container.

---

## 🛠️ Production Build with Docker

To build and run the optimized standalone production image:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 💻 Running Locally (Without Docker for the App)

If you prefer to run `npm run dev` directly on your host machine while running MongoDB and Mailpit in Docker:

1. Start only the background services:
   ```bash
   docker compose up -d mongodb mailpit
   ```

2. Run the Next.js dev server:
   ```bash
   cd taplink-app
   npm install
   npm run dev
   ```
