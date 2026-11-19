import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAction, useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Check, Copy, Mail, MessageCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatAmount, placeLabel } from '@/lib/shop/order';
import { whatsappUrl } from '@/lib/contact';

type Order = Doc<'orderRequests'>;
type PaymentLink = NonNullable<Order['payments']>[number];

const STATUS_LABELS: Record<string, string> = {
  new: 'Por cotizar',
  quoted: 'Cotizado',
  accepted: 'Aceptado',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

const dateTime = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' });

const paidTotal = (order: Order) => (order.payments ?? []).reduce((sum, link) => sum + (link.paidAt ? link.amount : 0), 0);

// The message that carries the freight quote to the buyer, with the payment link once one exists.
function quoteMessage(order: Order, shipping: number, link?: PaymentLink): string {
  const place = placeLabel(order.delivery.city, order.delivery.state);
  const total = order.subtotal + shipping;
  const lines = [
    `Hola ${order.contact.name.split(' ')[0]}, gracias por tu pedido ${order.orderNumber} en Edelweiss Pilates.`,
    '',
    `${order.quantity} × ${order.productName}: ${formatAmount(order.subtotal, order.currency)}`,
    `Envío asegurado a ${place}: ${formatAmount(shipping, order.currency)}`,
    `Total: ${formatAmount(total, order.currency)} (IVA incluido)`,
    '',
  ];
  if (link) {
    const label = link.amount < total ? `Para apartarlo, paga ${formatAmount(link.amount, order.currency)} aquí` : 'Puedes pagarlo de forma segura aquí';
    lines.push(`${label}: ${link.url}`);
  } else {
    lines.push('¿Confirmamos tu pedido?');
  }
  return lines.join('\n');
}

function OrderCard({ order, token }: { order: Order; token: string }) {
  const update = useMutation(api.orderRequests.update);
  const createLink = useAction(api.orderPayments.createLink);
  const verify = useAction(api.orderPayments.verify);
  const cancelLink = useAction(api.orderPayments.cancelLink);

  const [shipping, setShipping] = useState(order.shippingQuote !== undefined ? String(order.shippingQuote) : '');
  const [charge, setCharge] = useState('');
  const [busy, setBusy] = useState<'quote' | 'link' | 'verify' | 'cancel' | null>(null);

  const shippingAmount = Number(shipping);
  const hasShipping = shipping.trim() !== '' && Number.isFinite(shippingAmount) && shippingAmount >= 0;
  const quoteSaved = order.shippingQuote !== undefined && order.shippingQuote === shippingAmount;

  const total = order.subtotal + (order.shippingQuote ?? 0);
  const paid = paidTotal(order);
  const pending = Math.max(0, total - paid);
  const links = order.payments ?? [];
  // Links already sent count as owed, so a new one can only cover what no open link asks for.
  const chargeable = Math.max(0, pending - links.reduce((sum, link) => sum + (link.paidAt ? 0 : link.amount), 0));
  const chargeAmount = charge.trim() === '' ? chargeable : Number(charge);
  const canCharge = Number.isInteger(chargeAmount) && chargeAmount >= 1 && chargeAmount <= chargeable;
  const openLink = [...links].reverse().find((link) => !link.paidAt);

  const address = [order.delivery.street, order.delivery.neighborhood, placeLabel(order.delivery.city, order.delivery.state), `C.P. ${order.delivery.postalCode}`]
    .filter(Boolean)
    .join(', ');
  const message = hasShipping ? quoteMessage(order, shippingAmount, openLink) : '';

  const run = async (kind: 'quote' | 'link' | 'verify' | 'cancel', work: () => Promise<void>) => {
    setBusy(kind);
    try {
      await work();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo completar.');
    } finally {
      setBusy(null);
    }
  };

  const saveQuote = () =>
    run('quote', async () => {
      await update({ token, id: order._id, shippingQuote: shippingAmount, status: order.status === 'new' ? 'quoted' : order.status });
    });

  const makeLink = () =>
    run('link', async () => {
      const result = await createLink({ token, id: order._id, amount: chargeAmount });
      if (!result.ok) throw new Error(result.error);
      setCharge('');
      toast.success(`Enlace de pago creado por ${formatAmount(result.amount, order.currency)}.`);
    });

  const voidLink = (checkoutId: string) =>
    run('cancel', async () => {
      const result = await cancelLink({ token, id: order._id, checkoutId });
      if (!result.ok) throw new Error(result.error);
      toast('Enlace anulado. Ya no se puede pagar.');
    });

  const checkPayments = () =>
    run('verify', async () => {
      const result = await verify({ token, id: order._id });
      if (!result.ok) throw new Error(result.error);
      toast(result.newlyPaid > 0 ? 'Pago confirmado.' : 'Whop todavía no registra un pago.');
    });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-3 text-base">
          <span translate="no" className="notranslate">{order.orderNumber}</span>
          <Badge variant={order.status === 'new' ? 'destructive' : 'secondary'}>{STATUS_LABELS[order.status] ?? order.status}</Badge>
          {!order.notifiedAt && <Badge variant="outline">Sin aviso por correo</Badge>}
          <span className="ml-auto text-sm font-normal text-muted-foreground">{dateTime.format(order.createdAt)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-1">
            <div className="font-semibold">{order.quantity} × {order.productName}</div>
            <div className="text-muted-foreground">{order.sku}{order.upholstery ? ` · Tapicería ${order.upholstery.toLowerCase()}` : ''}</div>
            <div>Subtotal: <strong>{formatAmount(order.subtotal, order.currency)}</strong></div>
            {order.invoiceRequired && <div>Necesita factura</div>}
          </div>

          <div className="space-y-1">
            <div className="font-semibold">{order.contact.name}</div>
            <div>{order.contact.phone} · {order.contact.email}</div>
            <div className="text-muted-foreground">Prefiere {order.contact.channel}</div>
            <div className="pt-2">{address}</div>
            <div className="text-muted-foreground">{order.delivery.placeType} · {order.delivery.access}</div>
            {order.delivery.notes && <div className="text-muted-foreground">Notas: {order.delivery.notes}</div>}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block font-semibold">1. Envío a cobrar (MXN, IVA incluido)</span>
              <Input type="number" min={0} inputMode="numeric" value={shipping} onChange={(event) => setShipping(event.target.value)} placeholder="0" />
            </label>
            {hasShipping && <div>Total: <strong>{formatAmount(order.subtotal + shippingAmount, order.currency)}</strong></div>}
            <Button size="sm" disabled={!hasShipping || quoteSaved || busy !== null} onClick={saveQuote}>
              {busy === 'quote' ? 'Guardando…' : quoteSaved ? 'Cotización guardada' : 'Guardar cotización'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 border-t pt-5 md:grid-cols-3">
          <div className="space-y-3">
            <div className="font-semibold">2. Cobro por Whop</div>
            <div className="text-muted-foreground">
              Pagado {formatAmount(paid, order.currency)} de {formatAmount(total, order.currency)}. Pendiente{' '}
              <strong className="text-foreground">{formatAmount(pending, order.currency)}</strong>.
            </div>
            {pending > 0 && chargeable === 0 && (
              <div className="text-muted-foreground">Los enlaces enviados ya cubren lo pendiente. Anula uno para cambiar el monto.</div>
            )}
            {chargeable > 0 && (
              <>
                <label className="block">
                  <span className="mb-1 block">Monto del enlace (vacío = {formatAmount(chargeable, order.currency)})</span>
                  <Input type="number" min={1} max={chargeable} inputMode="numeric" value={charge} onChange={(event) => setCharge(event.target.value)} placeholder={String(chargeable)} />
                </label>
                <Button size="sm" disabled={!canCharge || busy !== null} onClick={makeLink}>
                  {busy === 'link' ? 'Creando…' : `Crear enlace de pago por ${canCharge ? formatAmount(chargeAmount, order.currency) : '…'}`}
                </Button>
                {order.shippingQuote === undefined && (
                  <div className="text-muted-foreground">Aún no hay envío cotizado: el pendiente no lo incluye.</div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="font-semibold">Enlaces de pago</div>
            {links.length === 0 && <div className="text-muted-foreground">Ninguno todavía.</div>}
            {links.map((link) => (
              <div key={link.checkoutId} className="flex items-center gap-2">
                <Badge variant={link.paidAt ? 'default' : 'outline'}>
                  {link.paidAt ? <><Check className="mr-1 h-3 w-3" /> Pagado</> : 'Pendiente'}
                </Badge>
                <span>{formatAmount(link.amount, order.currency)}</span>
                {!link.paidAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(link.url).then(() => toast('Enlace copiado'))}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar
                  </Button>
                )}
                {!link.paidAt && (
                  <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => voidLink(link.checkoutId)}>
                    Anular
                  </Button>
                )}
              </div>
            ))}
            {openLink && (
              <Button size="sm" variant="outline" disabled={busy !== null} onClick={checkPayments}>
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${busy === 'verify' ? 'animate-spin' : ''}`} /> Verificar pago
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="font-semibold">3. Enviar al cliente</div>
            <div className="text-muted-foreground">
              {openLink ? 'El mensaje lleva la cotización y el enlace de pago.' : 'El mensaje lleva la cotización. Crea un enlace para incluir el pago.'}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <a
                  href={hasShipping ? whatsappUrl(message, `52${order.contact.phone}`) : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!hasShipping}
                  className={hasShipping ? '' : 'pointer-events-none opacity-50'}
                >
                  <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={hasShipping
                    ? `mailto:${order.contact.email}?subject=${encodeURIComponent(`Tu pedido ${order.orderNumber}: cotización de envío`)}&body=${encodeURIComponent(message)}`
                    : undefined}
                  aria-disabled={!hasShipping}
                  className={hasShipping ? '' : 'pointer-events-none opacity-50'}
                >
                  <Mail className="mr-1.5 h-4 w-4" /> Correo
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(['accepted', 'cancelled', 'new'] as const)
                .filter((status) => status !== order.status)
                .map((status) => (
                  <Button key={status} size="sm" variant="ghost" onClick={() => update({ token, id: order._id, status })}>
                    Marcar: {STATUS_LABELS[status].toLowerCase()}
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const AdminOrders: React.FC = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admint') || '' : '';
  const orders = useQuery(api.orderRequests.list, token ? { token, limit: 200 } : 'skip');
  const pending = orders?.filter((order) => order.status === 'new').length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Panel
        </Link>
        <h1 className="mb-2 text-3xl">Pedidos</h1>
        <div className="mb-8 text-sm text-muted-foreground">
          {orders === undefined
            ? 'Cargando…'
            : `${orders.length} pedidos, ${pending} por cotizar. Cotiza el envío, crea el enlace de pago y envíalo al cliente.`}
        </div>
        <div className="space-y-4">
          {orders?.map((order) => <OrderCard key={order._id} order={order} token={token} />)}
          {orders?.length === 0 && <div className="text-sm text-muted-foreground">Todavía no hay pedidos.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
