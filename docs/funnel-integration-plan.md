# Funnel integration plan: CAMA / Edelweiss Pilates

Status: proposal, nothing built yet. Written 2026-11-07 against commit `3ec0c77`.

Sources:
- Alen Sultanic's knowledge garden (`alen-sultanic-copywriting-and-internet-marketing`, cited as **A**), plus the `ecom-88wxgd` (**E**), `vsl-swipe-file` (**V**) and `distribution-channels` (**D**) gardens. `NODE-*` codes are Alen's compiled rules.
- A read of the current codebase.

Anything marked *(ours)* is our own proposal and is not in the gardens. The gardens have nothing on WhatsApp follow-up cadence, email/SMS flows, or interest-free installments (MSI).

---

## 1. Where the funnel stands today

The shop works as a catalogue. Its single job is to start a WhatsApp chat. After that, nothing is recorded, measured or followed up.

| Stage | Today | Problem |
|---|---|---|
| Traffic | SEO blog, buying guides, city pages, directories. No ad pixels, and UTM/gclid/fbclid are never captured. | We can't tell which page or ad produces a sale. |
| Product page | Price, bundles (1/4/6/8 units), and WhatsApp / PDF quote / call buttons. | Contradicts itself (section 2). No reviews show for any current product. No cross-sell to accessories or certification. |
| Conversion | A prefilled WhatsApp message. Shoprocket and Whop are switched off. | Shop enquiries aren't stored, so a chat can't be tied to a sale. |
| Non-buyers (~97%) | The lead magnet popup exists but isn't mounted anywhere. The blog newsletter form has no handler and claims "Join 2,000+". | No list and no nurture. 49 of 56 blog visits leave after one page. |
| After the sale | Nothing. | No production updates, onboarding, review request, referral ask or ascension. |
| Certification | The clearest funnel: $400 seat deposit, WhatsApp, a lead form stored in Convex, partner folios. | Folios live only in Rybbit. Nothing connects reformer buyers to certification, or graduates to studio packs. |

Alen's playbook starts with economics: MLTV, AOV contribution per step, and earnings per click above cost per click (EPC > CPC). None of those can be computed today, because no sale is recorded anywhere. **That makes measurement the first real phase**, behind a short trust clean-up.

---

## 2. Phase 0: trust clean-up and one security fix (before any growth work)

Why: **A** says each purchase resets trust to zero and has to be rebuilt (`wiki/playbooks/retain-customers-and-rebuild-trust-after-the-sale.md`), and that a brand is an experience that beats what you promised. A page that promises one thing in one block and something else three blocks later loses that trust before the chat even starts.

### 0.1 Security: do this today

`scripts/buzz-signup-sync.js:24` hardcodes a Buzz/Nostr **private key** (`nsec1…`). The repo `timottowitz/camapilates.com` is **public**.
- Rotate the key in Buzz.
- Move it to an environment variable.
- Removing it from the file alone doesn't help, because the key stays in git history.

### 0.2 Remove contradictions (one source of truth per fact)

| Claim | Where | Fix |
|---|---|---|
| "En stock" pulse on made-to-order reformers | `src/pages/Product.tsx:359` | Show "Fabricación bajo pedido · 6–8 semanas". |
| FAQ says 3 weeks delivery and a 1-year warranty | `Product.tsx:42, 189, 515-516` | Read from `product.deliveryTime` / `product.warranty`, with no hardcoded fallback. |
| "Envío express garantizado 7 días" and an unsourced customer quote | `PilatesReformerMonterrey.tsx:15, 39, 68, 135, 191` | Remove, or confirm with the owner that it's true for stock units. |
| "0% interés", "Envío gratis", "Pago seguro" | `StickyMobileCTA.tsx:87, 144-149` | Keep only what we actually deliver. This depends on decision D1. |
| Schema: free shipping in 3–7 days, 30-day free returns | `src/lib/shop/catalog.ts:61-75`, `Product.tsx:121-128` | Match the real policy, or remove. |
| "12 MSI disponibles" on every card | `ProductCard21Enhanced.tsx:86` | Depends on decision D1. |
| English strings ("Common Questions", "Related", the blog newsletter) and leftover "Solar Fraud" copy | `Product.tsx:512, 532`, `Blog.tsx:270-281`, `BlogList.tsx:125-139` | Translate, or delete. |
| Pack discount tiers disagree (4/6/8 units vs "8+" vs "4 a 10") | `bundles.ts`, `StudioPack.tsx`, shop/blog copy | Pick one tier table and read it from `bundles.ts` everywhere. |

### 0.3 Fix measurement that lies

- `GAListener.tsx:28-37` fires a GA `purchase` whenever the page text contains "gracias", "pedido" or "orden". Delete it.
- `whatsapp_click` also counts clicks on instructors' own WhatsApp links (`TeacherDetail.tsx:285, 445`). Exclude those. The studio-directory buttons that use `window.open` aren't counted at all.

**Done when:** every price, delivery, warranty, shipping and financing claim comes from one data source; the key is rotated; and GA has no fake purchases.

---

## 3. Phase 1: make sales measurable

Why: **A** says to judge each funnel step by its AOV contribution, not its conversion rate (`units/ku-0094`), and that scale needs only EPC > CPC (`units/ku-0477`). It also says to trace each objection back to the page and stage the prospect came from (`NODE-BUYPSY-0336`). All three need a record that links a visit to a sale.

1. **A folio on every WhatsApp lead.** Reuse the partner-folio idea (`CertificationPartnerCard.tsx:19-36`) for every `productWhatsAppUrl` and CTA:
   - The prefilled message ends in `Folio: CAMA-XXXXX`.
   - Before opening WhatsApp, the site writes a Convex `shopLeads` row: folio, product/SKU, page path, CTA placement, UTM/gclid/fbclid, bump selections, and a timestamp.
2. **Capture UTMs on first visit** and store them in session storage, so the source survives navigation.
3. **Close the loop** *(ours)*. Add a small internal page, or a Convex dashboard view, where whoever answers WhatsApp marks each folio as `quoted / deposit / won / lost` with the amount and the loss reason. Without this step, the rest of the plan is guesswork.
4. **Move partner folios into the same table** (`source = partner`).
5. **Send GA4 ecommerce events to Rybbit too**, so one tool shows the whole funnel.

**Metrics this unlocks:**
- Leads per page.
- Lead → won % per page.
- Revenue per lead and per visitor (EPC).
- AOV, and accessory attach rate.
- Reformer buyer → certification rate.
- Time from first chat to sale.

---

## 4. Phase 2: the offer ladder and MLTV

### 4.1 Set the MLTV ceiling

**A**: your LTV can never exceed your MLTV, so work it out first ("what would a customer pay if they bought everything you have?") and raise it if it's low (`units/ku-0489`). Lose money on the first sale and profit on sales 2–6 (`NODE-PRICE-0203`).

Illustrative ladder at today's prices. These are estimates to check against real data from Phase 1.

| Step | Offer | ~MXN |
|---|---|---|
| Entry | Accessories / apparel / a buying-guide lead magnet | 0–3,000 |
| Core | Home reformer | 17,000–55,000 |
| Bump / OTO1 | Jump board + box + accessory kit, or a tower upgrade | 3,000–15,000 |
| Ascension | Certification Básico 28h → Completa 48h | 25,000 → 38,000 |
| Business | Studio pack (8 units, 20% off) | ~130,000+ |
| Repeat | Spare parts, springs, upholstery, apparel, continuing education | recurring |

A home buyer who goes on to get certified and open a studio is worth roughly 10× the first reformer sale. Today, nothing on the site moves anyone up from one step to the next.

**Turning one transformation into formats** (**A** `wiki/frameworks/turn-a-transformation-into-product-formats…`). The transformation is "Pilates at home → becoming an instructor → running a studio". Each format is its own offer:
- a guide (free or low price)
- a course (certification)
- done-with-you (studio-opening consultation plus the pack)
- community (the Whop campus)

### 4.2 A WhatsApp-native version of front end → bump → OTO1

There's no checkout, so the decisions move onto the product page and into the prefilled message.

- **Front end.** The reformer quote request, made a more deliberate step: the visitor picks a model, upholstery colour (if offered) and postcode on the page. That's three small decisions before WhatsApp opens. **A**: after about 4–5 decisions buyers are "basically autopilot ascended" (`NODE-BUYPSY-0253`).
- **Bump.** A checkbox above the WhatsApp button, carried into the message:
  - *Option A, free:* "Incluir sesión de instalación y primera clase por videollamada (gratis)". **A**: a bump, even a free one, raises upsell-1 take rate (`units/ku-0274`).
  - *Option B:* "Agregar kit de accesorios −X%".
- **OTO1, offered in the chat after the deposit.** A tower/cadillac upgrade, or the certification at a reformer-owner price. Price it far above the bump, because upsells are price-elastic (`units/ku-0471`).
- **No downsells.** A "no" goes straight to the next offer (`NODE-OFFECO-0337`).
- **A different seller per upsell** (`units/ku-0482`). If staffing allows, the certification offer comes from the course coordinator, not the person who sold the reformer.
- **Downgrade, don't drop** (`units/ku-0321`):
  - A studio that can't do 8 units → a 4-unit starter pack.
  - Completa is too much → Básico, with the price difference credited toward an upgrade later.
  - A reformer is over budget → the cheaper model, or a reservation on a payment plan.

### 4.3 Pricing and payment

- **10/20/70 spread** (`units/ku-0143`; the split is garbled in the source). Most buyers decide on what they can pay per month. Lead with "desde $X/mes", but only once decision D1 is real.
- **Keep the payment at or under ~10% of income** (`units/ku-0190`). For the home buyer, MXN 17,000 ÷ 12 ≈ MXN 1,420/month.
- **Real urgency only** (**E** offer playbook). Being made to order gives us a true scarcity lever *(ours)*: "Próximo lote de producción cierra el DD/MM". Use it only if production really runs in batches (decision D3).
- **A deposit as the front-end decision** *(ours, inspired by the $400 certification deposit and A's "front end as a filter", `units/ku-0407`)*. A refundable deposit holds a production slot. It qualifies buyers, and the deposit itself is a decision.

---

## 5. Phase 3: pages that match intent

| Tip | Source | CAMA application |
|---|---|---|
| Spell out "how is this useful to me" wherever the reader would have to work it out | A `beat-a-control…:17` | Rewrite specs as benefits: "resortes alemanes" → "misma resistencia que en tu estudio, sin desgaste en 5 años". |
| Mine the category's reviews for buyers' words | A `research-a-market…:7,23` | Mine Mercado Libre / Amazon MX reformer reviews (noise, stability, size, springs, assembly). Use the recurring criteria as product page sections. |
| Present your specs as fixes for named flaws in cheaper rivals | V `present-the-product-s-specs…` | A "Reformer de $9,000 vs Edelweiss" block covering wobble, rail noise and spring fatigue. |
| Mechanical markets need a demo | A `research-a-market…:19` | A 30–60s video on each product: carriage glide, spring change, folding. |
| Buyers who can't try the product want other owners' experience | A `units/ku-0201`, `NODE-BUYPSY-0190` | Collect real reviews (Phase 5). Add "Habla con una dueña en tu ciudad" (a referral-owner call) and "Pruébalo en un estudio" (link already exists). |
| Cold traffic goes to pre-sale content; warm traffic goes to the product page | E `choose-the-right-landing-page…` | Blog = pre-sale. The end-of-article CTA should match the topic like the inline ones (`BlogPost.tsx:316-322` is still fixed reformer copy). |
| A pre-opener turns the click's intent into the offer | A `put-a-pre-opener…` | Each blog CTA's first line restates the article's problem before the offer (e.g. "¿Dolor lumbar? Así se ve una rutina de reformer en casa →"). |
| One landing page per winning angle | E `choose-the-right-landing-page…:23` | Separate pages for home/health, studio/business and instructor/income angles, each echoing its ad. |
| Aim negatives at "most people", never "you" | A `map-a-buyer…:43-48` | Audit hero copy. |
| No income claims to zero-to-one buyers | A `map-a-buyer…:41-43` | Audit certification copy for instructor-income promises. |
| Give the buyer a justifying story | A `write-the-close…:9` | "Del mat al reformer al estudio": what you outgrow becomes the reason for the next step. |
| Checkout optimization means removing things | A `beat-a-control…:19` | Fewer CTAs per product page (currently WhatsApp, PDF quote, call, sticky bar, floating button). |

**Tension to decide:** **A** says to hold the price back until the message has done its work (`NODE-PERSU-0186`). But much of CAMA's SEO traffic comes from searches for price ("cama de pilates precio"). *Our view:* keep prices visible on the shop and guides, because that's what those searches are for. Lead with the monthly figure and the benefits ahead of the total.

---

## 6. Phase 4: capture and nurture the ~97% who don't buy

- **Three kinds of buyer** (`NODE-BUYPSY-0327`):
  - instant (5–10%)
  - repeat (needs 3–10 exposures from different angles)
  - duration (3–12 months)

  Organic audiences can take up to a year (`units/ku-0158`).
- **Lead magnets with buyer intent, not curiosity.** Curiosity opt-ins don't produce buyers (`units/ku-0494`). Proposals *(ours)*:
  1. "Guía de compra + calculadora de espacio" for home buyers (shop, guides, reformer blog posts)
  2. "Plan financiero para abrir tu estudio" for B2B (studio pack, business blog)
  3. "Temario + fechas de certificación" for future instructors (already partly exists)
- **Tag the lead by which opt-in it came through** and follow up differently (`units/ku-0449`). Mount `LeadMagnetPopup.tsx`, wire the blog newsletter form to `api.leads.capture`, and save the intent tag.
- **Reply the same day** *(ours, based on A `units/ku-0010`: intent fades within 1–2 weeks)*. Set a WhatsApp Business response-time goal, for example under 2 hours during business hours.
- **Nurture channel** *(ours; the gardens don't cover it)*. Mexico is WhatsApp-first, so:
  - a WhatsApp broadcast list for opted-in leads, plus a monthly email
  - mostly content with no offer (`make-content-that-actually-gets-consumed…`), one deep piece rather than many
  - occasional direct offers to the most-aware leads: a quick value reminder, the deal, real urgency (E `most-aware-audiences…`)
- **Retargeting** for repeat buyers. Meta pixel and Google Ads tag, behind a consent banner (decision D4). Comparison and call-out statics against failed alternatives (E `build-comparison-statics…`). Click-to-WhatsApp ads whose prefilled message carries a keyword (V `use-a-comment-keyword-cta…`).

---

## 7. Phase 5: after the sale

- **The 6–8 week wait is a trust gap** (A `retain-customers…:8-11`). *(ours)* Send production updates by WhatsApp at order, mid-build (a photo of their unit), dispatch and delivery. Promise less than we deliver.
- **A seven-day fast start at delivery** (A `use-a-seven-day-fast-start…`). Few buyers consume the main product. Send 3–7 short videos: setup, safety, the first three routines. The first 2–3 do the reframing ("en 7 días ya tienes rutina").
- **Ask for a review at ~30 days** (feeds Phase 3 proof). **Ask for a referral** after a good outcome, with tracking (D `run-customer-referrals…`).
- **Ascension timeline** (`units/ku-0375`: a buyer goes back to being a lead):
  - day 7–30: accessories
  - month 2–3: certification ("ya practicas en casa, ¿y si lo enseñas?")
  - graduates: the studio pack
- **The decision ladder:**
  1. choose model
  2. choose colour
  3. book delivery
  4. join the campus community
  5. book the first video class

---

## 8. Phase 6: paid traffic (only after Phases 1–4)

- Start only when Phase 1 gives revenue per lead by source.
- Rule: EPC > CPC (`units/ku-0477`).
- Set the starting daily budget from the measured value of a lead, not a guess (`units/ku-0275`).
- Prove comparison angles and the studio/business angle organically and with small spend first.

---

## 9. Build order (≤5 files per phase, verified before the next)

| # | Phase | Main files | Depends on |
|---|---|---|---|
| 0a | Rotate the Buzz key; move it to env | `scripts/buzz-signup-sync.js` | — |
| 0b | Trust contradictions | `Product.tsx`, `StickyMobileCTA.tsx`, `PilatesReformerMonterrey.tsx`, `catalog.ts`, `ProductCard21Enhanced.tsx` | D1, D2 |
| 0c | English/leftover copy; fake GA purchase; pack tier source | `Blog.tsx`, `BlogList.tsx`, `GAListener.tsx`, `bundles.ts`, `StudioPack.tsx` | — |
| 1a | `shopLeads` table + folio + UTM capture | `convex/schema.ts`, `convex/shopLeads.ts`, `src/lib/shop/whatsapp.ts`, new `src/lib/attribution.ts` | — |
| 1b | Lead status page; partner folios into Convex | new internal page, `CertificationPartnerCard.tsx` | 1a |
| 2a | Decision steps + bump checkbox on the product page | `Product.tsx`, `whatsapp.ts`, `QuickView21.tsx` | D3 |
| 3a | Topic-matched end-of-article CTA + pre-opener lines | `BlogPost.tsx`, `topicCta.ts` | — |
| 3b | Benefit rewrite + comparison block + demo video slot | `Product.tsx`, `products.json` | review mining |
| 4a | Lead magnets + intent tags + newsletter wiring | `LeadMagnetPopup.tsx`, `Blog.tsx`, `convex/leads.ts` | assets |
| 5 | Post-purchase sequence | mostly operations (WhatsApp templates); a little code | 1b |
| 6 | Pixels + consent | `index.html`, consent component | D4 |

---

## 10. Decisions the owner needs to make

- **D1. MSI: real or remove?** Either add a payment link that supports meses sin intereses (for example Mercado Pago, which shows MSI per card), or stop claiming "12 MSI / 0% interés" anywhere.
- **D2. Real policies.** The actual warranty years, shipping cost by region, return window, and whether any units are in stock (Monterrey "7 días").
- **D3. Deposit and production batches.** Is there a deposit to hold a production slot? Does production run in batches with real close dates?
- **D4. Ads and consent.** Will we run Meta/Google ads? If so, we need a consent banner and pixels.
- **D5. Who answers WhatsApp,** and can a second person handle upsells (certification/accessories)?
- **D6. Reviews.** Can we contact past customers (on the old catalogue too) for reviews and "talk to an owner"?

---

## 11. Tips not used above (for later)

- Desire plus justification: in a downturn, strengthen the justification (A `every-sale-needs-desire-plus-justification…`). That suggests a health-cost and studio-revenue framing.
- Design offers that open options later, the way a Rolex keeps its resale value (A `units/ku-0181`). That suggests resale/buy-back on reformers.
- A payment plan with an exit point and a payout option for the certification (A `structure-a-recurring-or-subscription-offer…`).
- Rising requests for payment plans signal falling market optimism (A `units/ku-0255`). Watch for it in the Phase 1 data.
- Resellers sell only if you train them (D `agencies-consultants…`). This applies to the 23 partner schools.
- Micro testimonials of about 40 words: past failures → result → feeling → name, state (V `micro-success-story…`).
