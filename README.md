# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/daa6e9d0-74c1-491c-a49d-5a687a3d9dde

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/daa6e9d0-74c1-491c-a49d-5a687a3d9dde) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

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

Simply open [Lovable](https://lovable.dev/projects/daa6e9d0-74c1-491c-a49d-5a687a3d9dde) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
