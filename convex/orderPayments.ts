// Paying for an order through Whop.
//
// The team creates a payment link for an amount (the full total, a deposit, or the balance). Whop
// hosts the checkout. Whether a link was paid is only ever learned by asking Whop's API with our
// key: nothing a browser or an incoming request says about a payment is trusted.
import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { action, internalAction, internalMutation, internalQuery, type ActionCtx } from './_generated/server';
import { getAdminUserId } from './lib/adminAuth';
import { formatAmount, placeLabel } from '../src/lib/shop/order';
import { SITE_URL, TEAM_EMAIL, TEAM_WHATSAPP, emailShell, escapeHtml, sendEmail, teamInbox } from './lib/orderEmail';

const WHOP_API = 'https://api.whop.com/api/v1';
// Pinned, so Whop keeps answering in the shape this file was written against.
const WHOP_API_VERSION = '2026-11-17';
const WHOP_ACCOUNT_ID = 'biz_3eUPkeAdggRnrP';
// The hidden Whop product "Pedido Edelweiss Pilates". Every payment link is a single-use price on it.
const ORDER_PRODUCT_ID = 'prod_xK5YwNU9ZexOx';
// No instalments or financing are offered, so those methods are switched off at checkout.
const FINANCING_METHODS = [
  'kueski',
  'card_installments_three',
  'card_installments_six',
  'card_installments_twelve',
  'klarna',
  'afterpay_clearpay',
  'affirm',
  'zip',
  'sezzle',
  'splitit',
];
const REFUNDED = ['refunded', 'auto_refunded'];
// How often one order may trigger a lookup at Whop, however many times its status page is loaded.
const CHECK_INTERVAL_MS = 8_000;
const RECONCILE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

type Order = Doc<'orderRequests'>;
type PaymentLink = NonNullable<Order['payments']>[number];

// Whop calls the price behind a checkout `variant` in its current API and `plan` in the version
// this account's key answers with, so both are read.
type WhopCheckout = {
  id?: string;
  purchase_url?: string | null;
  variant?: { id?: string } | null;
  plan?: { id?: string } | null;
};
type WhopPayment = {
  id?: string;
  status?: string;
  substatus?: string;
  currency?: string;
  total?: number | string | null;
  paid_at?: string | null;
  checkout_configuration_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

async function whop(path: string, init?: { method: string; body?: unknown }): Promise<{ ok: boolean; status: number; body: unknown }> {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new ConvexError('WHOP_API_KEY no está configurada en Convex.');
  const response = await fetch(`${WHOP_API}${path}`, {
    method: init?.method ?? 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Api-Version-Date': WHOP_API_VERSION },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = { message: text.slice(0, 300) };
  }
  return { ok: response.ok, status: response.status, body };
}

function whopError(status: number, body: unknown): string {
  const data = body as { message?: string; error?: { message?: string } | string } | null;
  const detail = typeof data?.error === 'string' ? data.error : data?.error?.message ?? data?.message;
  return `Whop respondió ${status}${detail ? `: ${detail}` : ''}`;
}

const paidTotal = (order: Order) => (order.payments ?? []).reduce((sum, link) => sum + (link.paidAt ? link.amount : 0), 0);
const orderTotal = (order: Order) => order.subtotal + (order.shippingQuote ?? 0);
const outstanding = (order: Order) => Math.max(0, orderTotal(order) - paidTotal(order));
const openTotal = (order: Order) => (order.payments ?? []).reduce((sum, link) => sum + (link.paidAt ? 0 : link.amount), 0);
// What a new link may ask for: links already sent count as owed, so two of them can never add up
// to more than the order.
const chargeable = (order: Order) => Math.max(0, outstanding(order) - openTotal(order));

function isPaid(payment: WhopPayment): boolean {
  return payment.status === 'paid' && !REFUNDED.includes(payment.substatus ?? '');
}

export const getByNumber = internalQuery({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) =>
    ctx.db.query('orderRequests').withIndex('by_order_number', (q) => q.eq('orderNumber', orderNumber)).unique(),
});

export const isAdmin = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }) => Boolean(await getAdminUserId(ctx, token)),
});

export const addLink = internalMutation({
  args: {
    id: v.id('orderRequests'),
    link: v.object({ checkoutId: v.string(), variantId: v.string(), url: v.string(), amount: v.number(), createdAt: v.number() }),
  },
  handler: async (ctx, { id, link }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new ConvexError('Pedido no encontrado.');
    await ctx.db.patch(id, { payments: [...(order.payments ?? []), link], updatedAt: Date.now() });
  },
});

export const removeLink = internalMutation({
  args: { id: v.id('orderRequests'), checkoutId: v.string() },
  handler: async (ctx, { id, checkoutId }) => {
    const order = await ctx.db.get(id);
    if (!order) return;
    // A paid link is a record of money received and is never removed.
    const payments = (order.payments ?? []).filter((link) => link.checkoutId !== checkoutId || link.paidAt);
    await ctx.db.patch(id, { payments, updatedAt: Date.now() });
  },
});

export const touchChecked = internalMutation({
  args: { id: v.id('orderRequests') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { paymentCheckedAt: Date.now() });
  },
});

// Records that Whop confirmed a link as paid. Safe to call twice: the second call changes nothing.
export const markPaid = internalMutation({
  args: { id: v.id('orderRequests'), checkoutId: v.string(), paymentId: v.string(), paidAt: v.number() },
  handler: async (ctx, { id, checkoutId, paymentId, paidAt }) => {
    const order = await ctx.db.get(id);
    const link = order?.payments?.find((l) => l.checkoutId === checkoutId);
    if (!order || !link || link.paidAt) return false;
    const payments = (order.payments ?? []).map((l) => (l.checkoutId === checkoutId ? { ...l, paidAt, paymentId } : l));
    const settled = orderTotal(order) - payments.reduce((sum, l) => sum + (l.paidAt ? l.amount : 0), 0) <= 0;
    await ctx.db.patch(id, {
      payments,
      status: settled && order.status !== 'cancelled' ? 'paid' : order.status,
      updatedAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.orderPayments.notifyPaid, { id, checkoutId });
    return true;
  },
});

export const openOrderIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const since = Date.now() - RECONCILE_WINDOW_MS;
    const recent = await ctx.db.query('orderRequests').withIndex('by_created', (q) => q.gt('createdAt', since)).collect();
    return recent
      .filter((order) => (order.payments ?? []).some((link) => !link.paidAt && link.createdAt > since))
      .map((order) => order._id);
  },
});

async function createLinkFor(ctx: ActionCtx, id: Id<'orderRequests'>, amount: number) {
  const order: Order | null = await ctx.runQuery(internal.orderRequests.getInternal, { id });
  if (!order) return { ok: false as const, error: 'Pedido no encontrado.' };
  if (!Number.isInteger(amount) || amount < 1) return { ok: false as const, error: 'El monto debe ser un número entero de pesos.' };
  if (amount > chargeable(order)) {
    const open = openTotal(order);
    return {
      ok: false as const,
      error: open > 0
        ? `Ya hay enlaces sin pagar por ${formatAmount(open, order.currency)}. Anula uno antes de crear otro por este monto.`
        : `El monto supera lo pendiente (${formatAmount(outstanding(order), order.currency)}).`,
    };
  }

  const result = await whop('/checkout_configurations', {
    method: 'POST',
    body: {
      account_id: WHOP_ACCOUNT_ID,
      variant: {
        product_id: ORDER_PRODUCT_ID,
        billing_type: 'one_time',
        release_method: 'buy_now',
        currency: order.currency.toLowerCase(),
        initial_price: amount,
        title: `Pedido ${order.orderNumber}`,
        description: `Pedido ${order.orderNumber}: ${order.quantity} × ${order.productName}`,
        visibility: 'hidden',
        // One unit, so a link that was paid cannot be paid a second time.
        stock: 1,
        unlimited_stock: false,
        force_create_new_plan: true,
      },
      metadata: { order_number: order.orderNumber, order_id: order._id },
      redirect_url: `${SITE_URL}/pedido/pago?pedido=${order.orderNumber}`,
      payment_method_configuration: { enabled: [], disabled: FINANCING_METHODS, include_platform_defaults: true },
    },
  });
  if (!result.ok) return { ok: false as const, error: whopError(result.status, result.body) };

  const checkout = result.body as WhopCheckout;
  const variantId = checkout.variant?.id ?? checkout.plan?.id;
  if (!checkout.id || !checkout.purchase_url || !variantId) {
    // Names what did arrive, so a change in Whop's response is visible without a debugger.
    const fields = Object.entries(checkout as Record<string, unknown>).map(([key, value]) => `${key}:${value === null ? 'null' : typeof value}`);
    return { ok: false as const, error: `Whop no devolvió un enlace de pago completo (${fields.join(', ')}).` };
  }
  await ctx.runMutation(internal.orderPayments.addLink, {
    id,
    link: { checkoutId: checkout.id, variantId, url: checkout.purchase_url, amount, createdAt: Date.now() },
  });
  return { ok: true as const, url: checkout.purchase_url, amount };
}

// Asks Whop about every unpaid link of one order and records the ones that were paid.
async function syncOrder(ctx: ActionCtx, order: Order): Promise<{ checked: number; newlyPaid: number; error?: string }> {
  const open = (order.payments ?? []).filter((link) => !link.paidAt);
  let newlyPaid = 0;
  for (const link of open) {
    // Narrowed to the orders product as well as the link's own price: if a filter is not honored
    // by the API version in use, the list is still small and the match below is what decides.
    const result = await whop(
      `/payments?account_id=${WHOP_ACCOUNT_ID}&product_id=${ORDER_PRODUCT_ID}&variant_id=${link.variantId}&first=50`,
    );
    if (!result.ok) return { checked: open.length, newlyPaid, error: whopError(result.status, result.body) };
    const listed = result.body as { data?: WhopPayment[] } | WhopPayment[];
    const payments = Array.isArray(listed) ? listed : listed.data ?? [];
    const match = payments.find((payment) => matchesLink(payment, order, link));
    if (match?.id) {
      const recorded: boolean = await ctx.runMutation(internal.orderPayments.markPaid, {
        id: order._id,
        checkoutId: link.checkoutId,
        paymentId: match.id,
        paidAt: match.paid_at ? Date.parse(match.paid_at) || Date.now() : Date.now(),
      });
      if (recorded) newlyPaid += 1;
    }
  }
  return { checked: open.length, newlyPaid };
}

function matchesLink(payment: WhopPayment, order: Order, link: PaymentLink): boolean {
  const forThisOrder =
    payment.checkout_configuration_id === link.checkoutId || payment.metadata?.order_number === order.orderNumber;
  return (
    isPaid(payment) &&
    forThisOrder &&
    (payment.currency ?? '').toLowerCase() === order.currency.toLowerCase() &&
    Number(payment.total) >= link.amount
  );
}

// What the buyer's payment page may know about an order: amounts and state, no personal data.
function publicStatus(order: Order) {
  return {
    found: true as const,
    orderNumber: order.orderNumber,
    productName: order.productName,
    quantity: order.quantity,
    currency: order.currency,
    total: orderTotal(order),
    paid: paidTotal(order),
    outstanding: outstanding(order),
    hasOpenLink: (order.payments ?? []).some((link) => !link.paidAt),
    cancelled: order.status === 'cancelled',
  };
}

// Disables a link at Whop and forgets it. It first checks that the link was not paid a moment ago.
async function cancelLinkFor(ctx: ActionCtx, id: Id<'orderRequests'>, checkoutId: string) {
  const order: Order | null = await ctx.runQuery(internal.orderRequests.getInternal, { id });
  if (!order) return { ok: false as const, error: 'Pedido no encontrado.' };
  const synced = await syncOrder(ctx, order);
  if (synced.error) return { ok: false as const, error: synced.error };

  const fresh: Order | null = await ctx.runQuery(internal.orderRequests.getInternal, { id });
  const link = fresh?.payments?.find((l) => l.checkoutId === checkoutId);
  if (!link) return { ok: false as const, error: 'Ese enlace ya no existe.' };
  if (link.paidAt) return { ok: false as const, error: 'Ese enlace ya fue pagado.' };

  const result = await whop(`/checkout_configurations/${checkoutId}`, { method: 'DELETE' });
  if (!result.ok && result.status !== 404) return { ok: false as const, error: whopError(result.status, result.body) };
  await ctx.runMutation(internal.orderPayments.removeLink, { id, checkoutId });
  return { ok: true as const };
}

export const cancelLinkInternal = internalAction({
  args: { id: v.id('orderRequests'), checkoutId: v.string() },
  handler: async (ctx, { id, checkoutId }) => cancelLinkFor(ctx, id, checkoutId),
});

export const cancelLink = action({
  args: { token: v.string(), id: v.id('orderRequests'), checkoutId: v.string() },
  handler: async (ctx, { token, id, checkoutId }) => {
    if (!(await ctx.runQuery(internal.orderPayments.isAdmin, { token }))) return { ok: false as const, error: 'Sin permiso.' };
    return cancelLinkFor(ctx, id, checkoutId);
  },
});

// The same as createLink without the admin check, for scripts run with deployment access
// (`npx convex run orderPayments:createLinkInternal`).
export const createLinkInternal = internalAction({
  args: { id: v.id('orderRequests'), amount: v.number() },
  handler: async (ctx, { id, amount }) => createLinkFor(ctx, id, amount),
});

export const syncInternal = internalAction({
  args: { id: v.id('orderRequests') },
  handler: async (ctx, { id }) => {
    const order: Order | null = await ctx.runQuery(internal.orderRequests.getInternal, { id });
    return order ? syncOrder(ctx, order) : { checked: 0, newlyPaid: 0, error: 'Pedido no encontrado.' };
  },
});

export const createLink = action({
  args: { token: v.string(), id: v.id('orderRequests'), amount: v.number() },
  handler: async (ctx, { token, id, amount }) => {
    if (!(await ctx.runQuery(internal.orderPayments.isAdmin, { token }))) return { ok: false as const, error: 'Sin permiso.' };
    return createLinkFor(ctx, id, amount);
  },
});

export const verify = action({
  args: { token: v.string(), id: v.id('orderRequests') },
  handler: async (ctx, { token, id }) => {
    if (!(await ctx.runQuery(internal.orderPayments.isAdmin, { token }))) return { ok: false as const, error: 'Sin permiso.' };
    const order: Order | null = await ctx.runQuery(internal.orderRequests.getInternal, { id });
    if (!order) return { ok: false as const, error: 'Pedido no encontrado.' };
    const result = await syncOrder(ctx, order);
    return result.error ? { ok: false as const, error: result.error } : { ok: true as const, newlyPaid: result.newlyPaid };
  },
});

// Called by the page the buyer lands on after paying. Open to anyone who has the order number.
export const refresh = action({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    if (!/^EDW-\d{6}-[A-Z0-9]{4}$/.test(orderNumber)) return { found: false as const };
    const order: Order | null = await ctx.runQuery(internal.orderPayments.getByNumber, { orderNumber });
    if (!order) return { found: false as const };

    const hasOpen = (order.payments ?? []).some((link) => !link.paidAt);
    if (hasOpen && Date.now() - (order.paymentCheckedAt ?? 0) > CHECK_INTERVAL_MS) {
      await ctx.runMutation(internal.orderPayments.touchChecked, { id: order._id });
      await syncOrder(ctx, order);
      const fresh: Order | null = await ctx.runQuery(internal.orderPayments.getByNumber, { orderNumber });
      if (fresh) return publicStatus(fresh);
    }
    return publicStatus(order);
  },
});

// Every ten minutes: catches payments whose buyer closed the tab before returning to the site.
export const syncOpen = internalAction({
  args: {},
  handler: async (ctx) => {
    const ids: Id<'orderRequests'>[] = await ctx.runQuery(internal.orderPayments.openOrderIds, {});
    for (const id of ids.slice(0, 25)) {
      const order: Order | null = await ctx.runQuery(internal.orderRequests.getInternal, { id });
      if (!order) continue;
      const result = await syncOrder(ctx, order);
      if (result.error) {
        console.error('Whop payment check failed:', result.error);
        return;
      }
    }
  },
});

// For the webhook: looks the payment up at Whop instead of believing the request, and settles the
// order it belongs to. `paid` tells the caller whether Whop really has this payment as paid.
export const confirmPayment = internalAction({
  args: { paymentId: v.string() },
  handler: async (ctx, { paymentId }): Promise<{ paid: boolean; forOrder: boolean }> => {
    if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) return { paid: false, forOrder: false };
    const result = await whop(`/payments/${paymentId}`);
    if (!result.ok) return { paid: false, forOrder: false };
    const payment = result.body as WhopPayment;
    if (!isPaid(payment)) return { paid: false, forOrder: false };

    const orderNumber = payment.metadata?.order_number;
    if (typeof orderNumber !== 'string') return { paid: true, forOrder: false };
    const order: Order | null = await ctx.runQuery(internal.orderPayments.getByNumber, { orderNumber });
    if (!order) return { paid: true, forOrder: false };
    await syncOrder(ctx, order);
    return { paid: true, forOrder: true };
  },
});

export const notifyPaid = internalAction({
  args: { id: v.id('orderRequests'), checkoutId: v.string() },
  handler: async (ctx, { id, checkoutId }) => {
    const order: Order | null = await ctx.runQuery(internal.orderRequests.getInternal, { id });
    const link = order?.payments?.find((l) => l.checkoutId === checkoutId);
    if (!order || !link) return;

    const e = escapeHtml;
    const amount = formatAmount(link.amount, order.currency);
    const pending = outstanding(order);
    const place = placeLabel(order.delivery.city, order.delivery.state);
    const balanceLine =
      pending > 0
        ? `Queda pendiente ${e(formatAmount(pending, order.currency))} de un total de ${e(formatAmount(orderTotal(order), order.currency))}.`
        : `El pedido está pagado por completo (${e(formatAmount(orderTotal(order), order.currency))}).`;

    const teamHtml = emailShell(`
  <h2 style="font-size: 20px; margin: 0 0 8px;">Pago recibido: ${e(amount)}</h2>
  <p><strong>Pedido ${e(order.orderNumber)}</strong>: ${order.quantity} × ${e(order.productName)}, ${e(place)}.<br>
  ${balanceLine}</p>
  <p><strong>Cliente:</strong> ${e(order.contact.name)} · ${e(order.contact.phone)} · ${e(order.contact.email)}<br>
  <strong>Pago en Whop:</strong> ${e(link.paymentId ?? '')}</p>
  <p><a href="${SITE_URL}/admin/pedidos">Abrir pedidos en el panel</a></p>`);

    const help = `https://wa.me/${TEAM_WHATSAPP}?text=${encodeURIComponent(`Hola, tengo una duda sobre mi pedido ${order.orderNumber}.`)}`;
    const customerHtml = emailShell(`
  <h2 style="font-size: 20px; margin: 0 0 8px;">Recibimos tu pago, ${e(order.contact.name.split(' ')[0])}</h2>
  <p>Confirmamos tu pago de <strong>${e(amount)}</strong> para el pedido <strong>${e(order.orderNumber)}</strong> (${order.quantity} × ${e(order.productName)}).</p>
  <p>${balanceLine}</p>
  <p>Te mantenemos al tanto de la fabricación y la entrega en ${e(place)}. ¿Tienes dudas? <a href="${help}">Escríbenos por WhatsApp</a> o responde a este correo.</p>`);

    await Promise.all([
      sendEmail(teamInbox(), `Pago recibido ${amount}: pedido ${order.orderNumber}`, teamHtml, order.contact.email),
      sendEmail(order.contact.email, `Recibimos tu pago: pedido ${order.orderNumber} | Edelweiss Pilates`, customerHtml, TEAM_EMAIL),
    ]);
  },
});
