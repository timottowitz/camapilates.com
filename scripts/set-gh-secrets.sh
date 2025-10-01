#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export GITHUB_TOKEN=<your_pat_with_repo_admin>
#   export CLOUDFLARE_API_TOKEN=...
#   export CLOUDFLARE_ACCOUNT_ID=...
#   export VITE_CONVEX_URL=...
#   export VITE_GOOGLE_MAPS_API_KEY=...
#   export VITE_SITE_URL=...
#   ./scripts/set-gh-secrets.sh [owner/repo]

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    origin=$(git remote get-url origin 2>/dev/null || echo "")
    # Extract owner/repo from HTTPS or SSH URL
    if [[ "$origin" =~ github.com[:/](.+/.+)\.git$ ]]; then
      REPO="${BASH_REMATCH[1]}"
    fi
  fi
fi

if [[ -z "$REPO" ]]; then
  echo "Repo not provided and could not infer from git origin."
  echo "Usage: ./scripts/set-gh-secrets.sh owner/repo"
  exit 1
fi

command -v gh >/dev/null || { echo "GitHub CLI 'gh' not found. Install: https://cli.github.com/"; exit 1; }

echo "Setting secrets for $REPO ..."

required=(
  CLOUDFLARE_API_TOKEN
  CLOUDFLARE_ACCOUNT_ID
  VITE_CONVEX_URL
  VITE_GOOGLE_MAPS_API_KEY
  VITE_SITE_URL
)

missing=()
for v in "${required[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    missing+=("$v")
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo "Missing environment values: ${missing[*]}" >&2
  echo "Export them before running this script." >&2
  exit 1
fi

set_secret() {
  local name="$1"; shift
  local value="$1"; shift
  echo "• $name"
  printf "%s" "$value" | gh secret set "$name" --app actions --repo "$REPO" --body - >/dev/null
}

set_secret CLOUDFLARE_API_TOKEN "$CLOUDFLARE_API_TOKEN"
set_secret CLOUDFLARE_ACCOUNT_ID "$CLOUDFLARE_ACCOUNT_ID"
set_secret VITE_CONVEX_URL "$VITE_CONVEX_URL"
set_secret VITE_GOOGLE_MAPS_API_KEY "$VITE_GOOGLE_MAPS_API_KEY"
set_secret VITE_SITE_URL "$VITE_SITE_URL"

echo "All secrets set for $REPO."

