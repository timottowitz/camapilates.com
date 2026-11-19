import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction, internalMutation, internalQuery, mutation, query } from './_generated/server';
import { getAdminUserId } from './lib/adminAuth';
import {
  ACCESS_TYPES,
  CONTACT_CHANNELS,
  PLACE_TYPES,
  QUOTE_RESPONSE_TIME,
  UPHOLSTERY_OPTIONS,
  allowedQuantities,
  findProduct,
  formatAmount,
  hasUpholsteryChoice,
  normalizePhone,
  priceOrder,
  validateContact,
  validateDelivery,
  type AccessType,
  type ContactChannel,
  type PlaceType,
} from '../src/lib/shop/order';
import { stateForPostalCode } from '../src/lib/shipping/postalCodes';

const SITE_URL = 'https://camadepilates.com';
const FROM_EMAIL = 'Edelweiss Pilates <noreply@camadepilates.com>';
const TEAM_EMAIL = 'hello@camadepilates.com';
const TEAM_WHATSAPP = '525548468190';
const STATUSES = ['new', 'quoted', 'accepted', 'cancelled'];

// No 0/O or 1/I, so the number survives being read out loud or typed from a screenshot.
const ORDER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MEXICO_CITY_OFFSET_MS = 6 * 60 * 60 * 1000;

function newOrderNumber(): string {
  const day = new Date(Date.now() - MEXICO_CITY_OFFSET_MS).toISOString().slice(2, 10).replace(/-/g, '');
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += ORDER_ALPHABET[Math.floor(Math.random() * ORDER_ALPHABET.length)];
  return `EDW-${day}-${suffix}`;
}

const clean = (value: string, max: number) => value.trim().replace(/\s+/g, ' ').slice(0, max);

function oneOf<T extends string>(options: readonly T[], value: string, label: string): T {
  if (!options.includes(value as T)) throw new ConvexError(`${label} no válido.`);
  return value as T;
}

export const submit = mutation({
  args: {
    clientRef: v.string(),
    productSlug: v.string(),
    quantity: v.number(),
    upholstery: v.optional(v.string()),
    contact: v.object({
      name: v.string(),
      phone: v.string(),
      email: v.string(),
      channel: v.string(),
    }),
    delivery: v.object({
      postalCode: v.string(),
      city: v.string(),
      neighborhood: v.string(),
      street: v.string(),
      placeType: v.string(),
      access: v.string(),
      notes: v.string(),
    }),
    invoiceRequired: v.boolean(),
    sourcePath: v.optional(v.string()),
    // Hidden field no person fills in.
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Whether the buyer can be told a confirmation email is on its way.
    const emailConfirmation = Boolean(process.env.RESEND_API_KEY);
    if (args.website) return { orderNumber: newOrderNumber(), emailConfirmation };
    if (!/^[a-z0-9-]{8,64}$/i.test(args.clientRef)) throw new ConvexError('Referencia de pedido no válida.');

    const existing = await ctx.db
      .query('orderRequests')
      .withIndex('by_client_ref', (q) => q.eq('clientRef', args.clientRef))
      .unique();
    if (existing) return { orderNumber: existing.orderNumber, emailConfirmation };

    const product = findProduct(args.productSlug);
    if (!product) throw new ConvexError('Ese producto ya no está en el catálogo.');
    if (!allowedQuantities(product).includes(args.quantity)) throw new ConvexError('Cantidad no disponible.');

    const contact = {
      name: clean(args.contact.name, 120),
      phone: normalizePhone(args.contact.phone),
      email: clean(args.contact.email, 200).toLowerCase(),
      channel: oneOf<ContactChannel>(CONTACT_CHANNELS, args.contact.channel, 'Medio de contacto'),
    };
    const delivery = {
      postalCode: args.delivery.postalCode.trim(),
      city: clean(args.delivery.city, 120),
      neighborhood: clean(args.delivery.neighborhood, 120),
      street: clean(args.delivery.street, 200),
      placeType: oneOf<PlaceType>(PLACE_TYPES, args.delivery.placeType, 'Tipo de lugar'),
      access: oneOf<AccessType>(ACCESS_TYPES, args.delivery.access, 'Acceso'),
      notes: clean(args.delivery.notes, 600),
    };
    const problem = Object.values({ ...validateDelivery(delivery), ...validateContact(contact) })[0];
    if (problem) throw new ConvexError(problem);

    // The price comes from the catalog here, never from the browser.
    const pricing = priceOrder(product, args.quantity);
    const upholstery = hasUpholsteryChoice(product)
      ? oneOf(UPHOLSTERY_OPTIONS, args.upholstery ?? '', 'Tapicería')
      : undefined;

    let orderNumber = newOrderNumber();
    while (await ctx.db.query('orderRequests').withIndex('by_order_number', (q) => q.eq('orderNumber', orderNumber)).unique()) {
      orderNumber = newOrderNumber();
    }

    const now = Date.now();
    const id = await ctx.db.insert('orderRequests', {
      orderNumber,
      clientRef: args.clientRef,
      status: 'new',
      productSlug: product.slug,
      productName: product.name,
      sku: product.sku,
      quantity: pricing.quantity,
      upholstery,
      unitPrice: pricing.unitPrice,
      listUnitPrice: pricing.listUnitPrice,
      subtotal: pricing.subtotal,
      currency: pricing.currency,
      contact,
      delivery: { ...delivery, state: stateForPostalCode(delivery.postalCode) ?? undefined },
      invoiceRequired: args.invoiceRequired,
      sourcePath: args.sourcePath ? clean(args.sourcePath, 200) : undefined,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.orderRequests.notify, { id });
    return { orderNumber, emailConfirmation };
  },
});

export const getInternal = internalQuery({
  args: { id: v.id('orderRequests') },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const markNotified = internalMutation({
  args: { id: v.id('orderRequests') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { notifiedAt: Date.now() });
  },
});

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);

function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2A2624; max-width: 600px; margin: 0 auto; padding: 24px;">
  <p style="font-family: Georgia, serif; font-style: italic; font-size: 24px; margin: 0 0 24px;">Edelweiss</p>
  ${body}
</body>
</html>`;
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string, replyTo?: string): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!response.ok) console.error('Resend API error:', await response.text());
  return response.ok;
}

// Tells the team there is an order to quote, and tells the buyer we have it. A failure here never
// loses the order: it is already stored and shows in the admin list without `notifiedAt`.
export const notify = internalAction({
  args: { id: v.id('orderRequests') },
  handler: async (ctx, { id }) => {
    const order = await ctx.runQuery(internal.orderRequests.getInternal, { id });
    if (!order) return;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured; order emails not sent for', order.orderNumber);
      return;
    }

    const e = escapeHtml;
    const place = [order.delivery.city, order.delivery.state].filter(Boolean).join(', ');
    const address = [order.delivery.street, order.delivery.neighborhood, place, `C.P. ${order.delivery.postalCode}`]
      .filter(Boolean)
      .join(', ');
    const itemLine = `${order.quantity} × ${order.productName} (${order.sku})`;
    const summary = `
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 6px 0; color: #5D5550;">Pedido</td><td style="padding: 6px 0; text-align: right;"><strong>${e(order.orderNumber)}</strong></td></tr>
    <tr><td style="padding: 6px 0; color: #5D5550;">Producto</td><td style="padding: 6px 0; text-align: right;">${e(itemLine)}</td></tr>
    ${order.upholstery ? `<tr><td style="padding: 6px 0; color: #5D5550;">Tapicería</td><td style="padding: 6px 0; text-align: right;">${e(order.upholstery)}</td></tr>` : ''}
    <tr><td style="padding: 6px 0; color: #5D5550;">Subtotal (IVA incluido)</td><td style="padding: 6px 0; text-align: right;">${e(formatAmount(order.subtotal, order.currency))}</td></tr>
    <tr><td style="padding: 6px 0; color: #5D5550;">Envío</td><td style="padding: 6px 0; text-align: right;">Por cotizar a ${e(place)}</td></tr>
  </table>`;

    const customerWhatsApp = `https://wa.me/52${order.contact.phone}?text=${encodeURIComponent(
      `Hola ${order.contact.name.split(' ')[0]}, te escribimos de Edelweiss Pilates por tu pedido ${order.orderNumber}.`,
    )}`;
    const teamHtml = emailShell(`
  <h2 style="font-size: 20px; margin: 0 0 8px;">Nuevo pedido por cotizar</h2>
  ${summary}
  <p><strong>Entrega:</strong> ${e(address)}<br>
  <strong>Lugar:</strong> ${e(order.delivery.placeType)} · ${e(order.delivery.access)}${order.delivery.notes ? `<br><strong>Notas:</strong> ${e(order.delivery.notes)}` : ''}</p>
  <p><strong>Cliente:</strong> ${e(order.contact.name)}<br>
  <strong>WhatsApp:</strong> <a href="${customerWhatsApp}">${e(order.contact.phone)}</a><br>
  <strong>Correo:</strong> ${e(order.contact.email)}<br>
  <strong>Prefiere:</strong> ${e(order.contact.channel)}${order.invoiceRequired ? '<br><strong>Necesita factura.</strong>' : ''}</p>
  <p><a href="${SITE_URL}/admin/pedidos">Abrir pedidos en el panel</a></p>`);

    const teamWhatsApp = `https://wa.me/${TEAM_WHATSAPP}?text=${encodeURIComponent(`Hola, tengo una duda sobre mi pedido ${order.orderNumber}.`)}`;
    const customerHtml = emailShell(`
  <h2 style="font-size: 20px; margin: 0 0 8px;">Recibimos tu pedido, ${e(order.contact.name.split(' ')[0])}</h2>
  <p>Gracias por tu pedido. Todavía no se cobra nada: primero te enviamos la cotización de envío a ${e(place)}.</p>
  ${summary}
  <p><strong>Qué sigue</strong></p>
  <ol style="padding-left: 20px;">
    <li>En ${e(QUOTE_RESPONSE_TIME)} te enviamos el costo del envío asegurado por ${order.contact.channel === 'Correo' ? 'correo' : 'WhatsApp'}.</li>
    <li>Si estás de acuerdo con el total, confirmas tu pedido y acordamos el pago.</li>
    <li>Fabricamos tu pedido y te lo entregamos en la dirección que nos diste.</li>
  </ol>
  <p>¿Tienes dudas? <a href="${teamWhatsApp}">Escríbenos por WhatsApp</a> o responde a este correo.</p>`);

    const teamTo = process.env.ORDER_NOTIFY_EMAIL || TEAM_EMAIL;
    const [teamSent] = await Promise.all([
      sendEmail(apiKey, teamTo, `Nuevo pedido ${order.orderNumber}: ${itemLine}, ${place}`, teamHtml, order.contact.email),
      sendEmail(apiKey, order.contact.email, `Recibimos tu pedido ${order.orderNumber} | Edelweiss Pilates`, customerHtml, TEAM_EMAIL),
    ]);
    if (teamSent) await ctx.runMutation(internal.orderRequests.markNotified, { id });
  },
});

export const list = query({
  args: { token: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return [];
    return await ctx.db
      .query('orderRequests')
      .withIndex('by_created')
      .order('desc')
      .take(args.limit ?? 200);
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id('orderRequests'),
    status: v.optional(v.string()),
    shippingQuote: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, { token, id, status, shippingQuote, adminNotes }) => {
    const adminId = await getAdminUserId(ctx, token);
    if (!adminId) throw new ConvexError('Sin permiso.');
    if (status !== undefined && !STATUSES.includes(status)) throw new ConvexError('Estado no válido.');
    if (shippingQuote !== undefined && !(shippingQuote >= 0)) throw new ConvexError('Costo de envío no válido.');
    await ctx.db.patch(id, {
      ...(status !== undefined ? { status } : {}),
      ...(shippingQuote !== undefined ? { shippingQuote } : {}),
      ...(adminNotes !== undefined ? { adminNotes: adminNotes.slice(0, 2000) } : {}),
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});
