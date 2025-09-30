Convex Integration — Setup Guide
================================

Project IDs
- Project slug: `blogwriter-a38b3`
- Preview deployment: `preview:tim-ottowitz:blogwriter-a38b3`
- Production deployment: `prod:spotted-raven-102`

Install & Link
1) Install CLI & package (already added to repo):
   - `npm i convex`
2) Link to your Convex project:
   - `npx convex init` → choose existing project `blogwriter-a38b3`
   - or set `CONVEX_DEPLOYMENT=preview:tim-ottowitz:blogwriter-a38b3`

Dev & Codegen
- Run `npx convex dev` during development to generate `convex/_generated/*` and hot reload server functions.
- Or run `npx convex codegen` to update types after editing `convex/` code.

Environment Variables (Convex Dashboard → Environment Variables)
- GITHUB_REPO: e.g. `owner/repo`
- GITHUB_TOKEN: GitHub PAT with Contents:write
- GITHUB_BRANCH: `main` (optional)
- CONFIG_ENC_KEY: random secret string used for AES-GCM encryption
- VERTEX_PROJECT_ID: GCP project id (for image generation)
- VERTEX_LOCATION: usually `us-central1`
- VERTEX_MODEL_IMAGE: e.g. `imagegeneration@006`
- Optional (Service Account):
  - VERTEX_SA_EMAIL
  - VERTEX_SA_PRIVATE_KEY (PEM)

Client Setup
- Add `VITE_CONVEX_URL` to `.env.local` with the Convex URL printed by `convex dev` or from dashboard.
- The app wraps React with `ConvexProviderMaybe` (uses provider when URL present).

Server Functions Provided
- `convex/blog.ts`: suggestions CRUD, status, keywords storage
- `convex/pipeline.ts`: `pipelineRun({ slug })` commits research/blog `.md` to GitHub and updates TODO
- `convex/images.ts`: list/get/save metadata, `generateImages` scaffolds prompts (extend with Vertex calls)
- `convex/settings.ts`: encrypted settings storage for Vertex/OAuth

Next Steps
1) Wire Admin/Blog Writer UI to Convex hooks (`useQuery`, `useMutation`, `useAction`).
2) Add Vertex token exchange / service account in `images.generateImages` to generate real images.
3) Add cron to process queued topics.
4) Migrate auth to Convex Auth and gate Admin routes by allowlist.

