# Welcome to your Lovable project


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Blog Content Architecture (Programmatic SEO)

- Author content in `src/content/blog/**.md` with YAML frontmatter:

```
---
title: "Page Title"
description: "1–2 sentence meta description"
category: "Scam | Company | Legal | State | ..."
tags: ["tag1", "tag2"]
publishDate: "YYYY-MM-DD"
author: "Name"
slug: "url-slug"
featured: false
---

## Your markdown starts here
```

- The app indexes frontmatter at build and renders posts at `/blog/:slug`.
- Related articles are computed (tags → category → recency).
- Category: `/blog/category/:category`, Tag: `/blog/tag/:tag`.
- `npm run build` auto-generates `public/sitemap.xml` from content.

## Cloudflare Caching & Prewarming

If you deploy on Cloudflare Pages:

- Edge caching via `public/_headers` (already included):
  - `/assets/*`, `/og/*` → long-lived immutable
  - `/blog/*`, `/blog/category/*`, `/blog/tag/*` → short browser TTL, longer edge TTL with stale-while-revalidate
  - `/sitemap.xml` → short TTL
- Pages Functions (already included):
  - `functions/[[path]].ts` sets Cache-Control headers consistently at the edge
  - `functions/_scheduled.ts` warms the cache by fetching all sitemap URLs
    - Set Pages environment variable `SITE_URL=https://your-domain`
    - Add a Cron Trigger in Cloudflare (e.g., every 6 hours)

If you proxy a separate origin through Cloudflare (non-Pages):

- Use Cache Rules to mirror the same policies for `/assets/*`, `/og/*`, `/blog/*`, `/blog/category/*`, `/blog/tag/*`, `/sitemap.xml`
- Optionally deploy a Worker with a Cron Trigger to prewarm the cache by fetching sitemap URLs


## How can I deploy this project?
You can publish via Lovable, or use the included GitHub Actions workflow to deploy to Cloudflare Pages.

### Deploy to Cloudflare Pages (CI/CD)

This repo includes `.github/workflows/deploy-cloudflare-pages.yml` which:
- Builds with Node 22
- Deploys to Cloudflare Pages project `camadepilates`
- Runs on push to `main` (production) and on pull requests (preview)

Set these GitHub Actions secrets (Repository → Settings → Secrets and variables → Actions):
- `CLOUDFLARE_API_TOKEN` — API token with Pages write access
- `CLOUDFLARE_ACCOUNT_ID` — Your Cloudflare account id
- `VITE_CONVEX_URL` — e.g. `https://<your-convex>.convex.cloud`
- `VITE_GOOGLE_MAPS_API_KEY` — Browser API key (restrict to localhost, *.pages.dev and your prod domain)
- `VITE_SITE_URL` — e.g. `https://camadepilates.com`

Optional: Also mirror these variables in Cloudflare Pages Project → Settings → Environment variables to keep build/runtime parity.

Caching notes:
- Images under `/images` and `/og` are versioned and served with `immutable` cache.
- HTML routes use `s-maxage=300, stale-while-revalidate=300` to prevent stale bundles after deploy.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Studios Directory: Convex + Cloudflare

- Convex URL is read from `VITE_CONVEX_URL`. If unset, the app uses a local dataset (`src/data/studios.json`) so dev and prod render identically without crashes.
- You can temporarily override via `?convexUrl=https://...` (stored in localStorage) for quick testing.
- Google Maps requires `VITE_GOOGLE_MAPS_API_KEY`. If missing or domain not authorized, the map shows a friendly placeholder instead of breaking.

Best practices:
- Keep `VITE_CONVEX_URL` and `VITE_GOOGLE_MAPS_API_KEY` set for both preview and production.
- Cache-bust images with the included manifest generator (`npm run build` runs it automatically).
- Avoid caching APIs at the edge (`functions/[[path]].ts` already sets `no-store` for `/api/*`).
