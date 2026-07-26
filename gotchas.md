# Gotchas

Traps that cost real debugging time on this project. Read before chasing a bug that
"should be impossible".

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
