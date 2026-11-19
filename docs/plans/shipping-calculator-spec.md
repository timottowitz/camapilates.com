# Shipping calculator: spec

Status: proposed, not built. Written 2026-11-18.

## Goal

Given a destination postal code and a cart, return a delivery fee that is shown before payment and
that the business can honor. Mexican consumer rules require the total, shipping included, before
the purchase is accepted, and the shown price is binding. So the calculator has two hard rules:

1. It always answers. A carrier outage must not block a sale.
2. It never quotes below what delivery will really cost.

Cost data, margins and the carrier quotes this is calibrated on live in `deal-vog/pricing.md`
(kept out of git). This file holds no costs.

## What the research established

| Fact | Consequence | Source |
|---|---|---|
| Paquetexpress has no public rate API. Its parcel service stops at 70 kg a piece; a crated reformer has to go as a pallet. | Quote through an aggregator, as pallets. | paquetexpress.com.mx, drenvio.com carrier pages |
| DrEnvío exposes `POST https://prod.api-drenvio.com/v2/shipments/rate` with package `type: "pallet"`, carriers `paquetexpress` and `tresguerras`, an `insurance` amount, and `metadata.extended_area` / `ocurre` flags in the answer. Bearer token. | Primary live source. Same source as the quotes already collected by hand. | docs.drenvio.com/en/guides/cotizar-envio |
| DrEnvío's sandbox only quotes JTExpress and Quiken. | Pallet quotes can only be tested against production, with a real token. | same |
| Envia.com has `POST https://api.envia.com/ship/rate/` with pallet packages and `shipment.type: 2`, also covering Paquetexpress and Tresguerras. | Second, independent live source. | docs.envia.com |
| Paquetexpress bills the greater of actual and volumetric weight, L × W × H / 5000 (cm). | The crate's size drives the price more than its weight: the 242 × 78 × 55 cm crate weighs 125 kg but bills as 208 kg. Every model needs its own crate dimensions. | carrier and aggregator pages |
| Without a declared value, carrier liability is 15 UMA per tonne: about MXN 220 for one crate. | "Envío asegurado" is only true if every shipment declares its value. Insurance is part of the fee, not an option. | Ley de Caminos art. 66 |
| Insurance through one aggregator: 1.5% of declared value plus IVA, 20% deductible, MXN 100,000 cap per shipment. | Packs exceed the cap as one shipment; declare per crate. Terms on DrEnvío still to confirm. | ayuda.enviatodo.com |
| Home delivery does not cover every postal code; uncovered ones are branch pickup. Extended zones carry a surcharge (about MXN 197 at Paquetexpress). | Coverage is a result of the quote, not an assumption. | paquetexpress.com.mx FAQ |
| Freight does not include unloading. Pieces over 2.4 m need the carrier's approval. | State "entrega a pie de camión" to the buyer. Gym reformers (3.19 m) cannot be auto-quoted. | drenvio.com pallet page |
| The official postal code catalog may not be redistributed. | Do not ship it in the site. Validate through the quote itself; the fallback only needs the first two digits, which map to states. | correosdemexico.gob.mx |
| The carrier issues the Carta Porte; the shipper supplies contents, weight and value. | No extra system needed, but the order must carry those fields. | SAT, paquetexpress.com.mx |

## How a quote is produced

```
postal code + cart
      │
      ▼
 1. validate input ── bad ──► error shown at the field
      │
      ▼
 2. build shipment from per-model crate profiles (size, gross weight, pieces, declared value)
      │
      ├─ any model oversize, or pack of 4+ ──► MANUAL
      ▼
 3. cache hit (same origin, postal code, shipment signature, < 24 h)? ──► return it
      │
      ▼
 4. live quote: DrEnvío (4 s timeout, 1 retry) ── fails ──► Envia.com ── fails ──┐
      │                                                                          │
      ▼                                                                          │
 5. sanity checks ── fail ───────────────────────────────────────────────────────┤
      │                                                                          ▼
      ▼                                                             6. fallback zone table
 7. pricing policy (IVA, buffer, round up) ◄─────────────────────────────────────┘
      │
      ▼
 8. store quote, return { quoteId, fee, eta, method, confidence, expiresAt }
```

Three outcomes, each shown differently:

- **exact**: live quote, home delivery, passed every check. Fee is final.
- **estimate**: fallback table. Fee is still final and honored; the table is built to sit at or
  above the live price.
- **manual**: no coverage, extended zone with branch pickup only, oversize, pack of 4 or more, or
  declared value over the insurance cap. No fee is shown. The buyer can reserve with a deposit and
  gets a confirmed freight price by WhatsApp or email.

## Reliability rules

1. **Crate profile per model, enforced.** One data file. The build fails if a sellable reformer has
   no profile. Chargeable weight is computed locally and compared with what the carrier used.
2. **The client never sends a price.** Checkout sends a `quoteId`; the server reads the stored fee.
   Expired quotes (7 days) are recomputed.
3. **Sanity bounds on live quotes.** Reject anything that is not MXN, not positive, from a carrier
   or service outside the allow-list, or outside 0.6× to 2.5× the fallback value for that zone and
   profile. (One carrier's public form returned MXN 190 for every route; this is what catches it.)
4. **Carrier allow-list and order.** Paquetexpress ground first, Tresguerras second. Cheapest
   allowed, not cheapest overall.
5. **IVA is explicit.** A config flag says whether the aggregator's prices include IVA. Until one
   real invoice confirms it, treat them as excluding IVA, which can only overcharge slightly.
6. **Insurance always on.** Declared value is the net product price. The insurance amount returned
   by the API is part of the fee. If the API returns none, the shipment goes to manual.
7. **Fallback table is generated, dated and conservative.** Per zone and profile: the highest of
   the sampled live quotes plus the buffer. It carries a `validUntil`; an expired table still
   answers but raises an alert.
8. **Drift watch.** A weekly job re-quotes fixed reference postal codes per zone and profile,
   compares with the table, and alerts in the admin when the gap passes 8%. Carriers reprice every
   January; this is what notices.
9. **Circuit breaker.** After 3 live failures in 5 minutes, skip the live call for 10 minutes and
   answer from the table.
10. **Reconciliation.** When an order ships, the admin records what the carrier charged. The system
    keeps quoted versus charged per order and reports the error. The buffer is set from that data,
    starting at 5%.
11. **Abuse limits.** The token stays server-side. The public quote action is rate-limited and
    cached, and accepts only catalog SKUs and quantities 1 to 8.
12. **Everything is logged.** Each quote stores inputs, source, raw answer, and outcome, and sends
    a `shipping_quote` event to analytics with zone, source and confidence.

## Pricing policy

`fee = round up to next x90 ( (freight + insurance + surcharges) × (1 + buffer) × IVA factor )`

The round-up and "delivery is charged on top of the product price" come from the existing pricing
decision. Buffer starts at 5%.

## Pieces

- `src/lib/shipping/` (pure, shared, unit-tested): crate profiles, chargeable weight, postal prefix
  to state to zone, pricing policy, sanity checks, fallback table.
- `convex/shipping.ts`: `quote` action, provider clients, cache, circuit breaker, quote log,
  weekly drift job, reconciliation mutations.
- Product page: "Calcula tu envío" postal code field showing fee, delivery window and method.
- Admin: quote log, drift alerts, quoted versus charged.

## Tests

- Unit: chargeable weight, all 32 states to zones, rounding, bounds, source precedence.
- Property: for any valid input the result is a fee at or above the table floor, or manual. Never
  an error, never zero.
- Contract: recorded real DrEnvío and Envia answers as fixtures, including an extended-zone and a
  no-coverage case.
- End to end: postal code on the product page, with the live provider forced to fail.

## Needed before building

1. A DrEnvío API token (production), set as a Convex environment variable.
2. The real origin postal code the crates ship from.
3. Crate dimensions and gross weight for each of the 10 reformers, from the supplier.
4. Confirmation of whether DrEnvío prices include IVA (one real quote or invoice settles it).

## Phases

1. Core library and fallback table with tests. Needs items 2 and 3.
2. Live quoting, cache, bounds, logging. Needs items 1 and 4.
3. Product page calculator and analytics event.
4. Drift job, reconciliation and admin views.
5. Checkout consumes `quoteId`.
