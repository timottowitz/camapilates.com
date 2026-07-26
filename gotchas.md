# Gotchas

Traps that cost real debugging time on this project. Read before chasing a bug that
"should be impossible".

---

## A hidden browser tab makes Helmet look broken

**Symptom:** Every page in a production build appears to ship index.html's static
title and description with no JSON-LD and no per-page canonical, while `vite dev`
looks fine. It reads exactly like a bundler bug and invites a "fix" to
`react-helmet-async`.

**Cause:** Helmet defaults to `defer: true` and commits head changes inside
`requestAnimationFrame`. Browsers suspend rAF in hidden tabs, so the commit never
runs and the head keeps whatever index.html shipped. The automated browser pane
reports `document.visibilityState === 'hidden'`, so anything measured through it
sees the pre-Helmet head. Dev only looked healthy because starting the preview
server fronts the pane for that first load.

**Check this first** before concluding head management is broken:

```js
let fired = false; requestAnimationFrame(() => { fired = true; });
setTimeout(() => console.log(document.visibilityState, fired), 1000);
```

If `fired` is false, the measurement is worthless. Route rAF through a timer for
the rest of the session, then re-measure:

```js
window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
```

Head tags are prerendered into the served HTML anyway (see below), so `curl` is the
more reliable way to check what a crawler actually receives.

---

## Browser auto-translation freezes any value React re-renders

**Symptom:** A price, total, or counter updates once and then never changes, while the
UI around it clearly reacts — a selected card highlights, a checkmark moves, classes
change. The React state is provably correct and the same prop drives both, so the two
cannot disagree in a normal render.

**Cause:** Chrome, Safari and the Google Translate widget replace the text nodes React
manages with their own `<font>` wrappers. React keeps a reference to the original text
node, which is now detached, so `nodeValue` updates land on a node that is no longer in
the document and the visible text stays frozen at whatever was on screen when the page
was translated. Element-level work (inserting the checkmark span, swapping `className`)
still applies, which is exactly what makes it look like a state bug.

**Tell:** The screenshot is in a language that does not exist in the source. This
codebase has no i18n library — every string is Spanish. English in a screenshot means
the browser translated the page.

**Fix:** Mark every element holding a value that changes at runtime with
`translate="no"` and the `notranslate` class. Keep static labels outside the marked
element so the page still reads in the visitor's language. See
`src/components/shop/BundleSelector.tsx`.

**Do not** "fix" this by restructuring React state. It was attempted twice (1361bf7,
7c64955) before the cause was found, and neither could have worked.

**Reproduce without a translated browser:** wrap the text nodes yourself, skipping
protected subtrees, then change state and watch the numbers stall.

```js
const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
for (const n of nodes) {
  if (!n.nodeValue.trim() || n.parentElement?.closest('[translate="no"], .notranslate')) continue;
  const outer = document.createElement('font'), inner = document.createElement('font');
  inner.textContent = n.nodeValue; outer.appendChild(inner);
  n.parentNode.replaceChild(outer, n);
}
```

---

## A green deploy does not mean the change is live

**Symptom:** GitHub Actions passes, Cloudflare reports "Deployment complete", and
camadepilates.com keeps serving the previous build.

**Cause:** `wrangler pages deploy` without `--branch` has to infer the branch from git.
`actions/checkout` leaves a detached HEAD, so wrangler cannot resolve one and files the
upload as a *preview* deployment. The job still goes green and prints a
`<hash>.camadepilates.pages.dev` URL that does have the new build, while the production
alias never moves. Fixed in `.github/workflows/cloudflare-pages.yml` by pinning
`--branch=main`.

**Verify a deploy for real** — compare the asset hash the origin serves against the
local build, rather than trusting the workflow status. The HTML is `no-store`, so a
stale reference is the origin, not a CDN cache:

```bash
curl -s https://camadepilates.com/product/<slug> | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1
```

Assets are content-hashed and immutable-cached, so during propagation two edges can
briefly return different bytes for the same filename. Re-check before concluding.

A 308 is cacheable, so a URL that redirected before a fix can keep returning the
cached redirect for a while afterwards. Re-request with a `?cb=` buster before
believing a straggler is a real failure.

---

## SEO output lives in three places that must agree

`scripts/static-prerender.cjs` writes the HTML crawlers actually get,
`scripts/generate-sitemap.cjs` writes the URL list, and the page components set the
same tags client-side via Helmet. A URL is only correct when all three use the
identical form, and each has already drifted once:

- Both scripts must use the same `slugify` as `src/utils/slug.ts`. Percent-encoding
  a tag or category name produces a URL the route redirects away from.
- The prerenderer writes `<path>.html`, never `<path>/index.html`. Cloudflare Pages
  serves `foo.html` at `/foo` with a 200 but serves `foo/index.html` only at `/foo/`,
  308ing `/foo` to it — which contradicts every canonical and sitemap entry.
- Do not add a `canonical` or `og:url` to `index.html`. Helmet cannot replace a tag
  it did not create, so a hardcoded value survives alongside Helmet's and every inner
  page ends up declaring the homepage as its canonical.

Verify the whole set rather than spot-checking; the sweep is cheap:

```bash
curl -s https://camadepilates.com/sitemap.xml | grep -oE '<loc>[^<]+</loc>' | sed -E 's|</?loc>||g' | while read -r u; do echo "$(curl -s -o /dev/null -w '%{http_code}' "$u") $u"; done | grep -v '^200 '
```
