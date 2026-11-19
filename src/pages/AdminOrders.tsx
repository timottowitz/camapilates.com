import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatAmount, placeLabel } from '@/lib/shop/order';
import { whatsappUrl } from '@/lib/contact';

type Order = Doc<'orderRequests'>;

const STATUS_LABELS: Record<string, string> = {
  new: 'Por cotizar',
  quoted: 'Cotizado',
  accepted: 'Aceptado',
  cancelled: 'Cancelado',
};

const dateTime = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' });

function quoteMessage(order: Order, shipping: number): string {
  const place = placeLabel(order.delivery.city, order.delivery.state);
  return [
    `Hola ${order.contact.name.split(' ')[0]}, gracias por tu pedido ${order.orderNumber} en Edelweiss Pilates.`,
    '',
    `${order.quantity} × ${order.productName}: ${formatAmount(order.subtotal, order.currency)}`,
    `Envío asegurado a ${place}: ${formatAmount(shipping, order.currency)}`,
    `Total: ${formatAmount(order.subtotal + shipping, order.currency)} (IVA incluido)`,
    '',
    '¿Confirmamos tu pedido?',
  ].join('\n');
}

function OrderCard({ order, token }: { order: Order; token: string }) {
  const update = useMutation(api.orderRequests.update);
  const [shipping, setShipping] = useState(order.shippingQuote !== undefined ? String(order.shippingQuote) : '');
  const [saving, setSaving] = useState(false);
  const amount = Number(shipping);
  const hasAmount = shipping.trim() !== '' && Number.isFinite(amount) && amount >= 0;
  const address = [order.delivery.street, order.delivery.neighborhood, placeLabel(order.delivery.city, order.delivery.state), `C.P. ${order.delivery.postalCode}`]
    .filter(Boolean)
    .join(', ');

  const saveQuote = async () => {
    setSaving(true);
    try {
      await update({ token, id: order._id, shippingQuote: amount, status: order.status === 'new' ? 'quoted' : order.status });
    } finally {
      setSaving(false);
    }
  };

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
      <CardContent className="grid gap-6 text-sm md:grid-cols-3">
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
            <span className="mb-1 block font-semibold">Envío a cobrar (MXN, IVA incluido)</span>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={shipping}
              onChange={(event) => setShipping(event.target.value)}
              placeholder="0"
            />
          </label>
          {hasAmount && (
            <div>Total: <strong>{formatAmount(order.subtotal + amount, order.currency)}</strong></div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={!hasAmount || saving} onClick={saveQuote}>
              {saving ? 'Guardando…' : 'Guardar cotización'}
            </Button>
            <Button size="sm" variant="outline" asChild disabled={!hasAmount}>
              <a
                href={hasAmount ? whatsappUrl(quoteMessage(order, amount), `52${order.contact.phone}`) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!hasAmount}
                className={hasAmount ? '' : 'pointer-events-none opacity-50'}
              >
                <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={hasAmount
                  ? `mailto:${order.contact.email}?subject=${encodeURIComponent(`Tu pedido ${order.orderNumber}: cotización de envío`)}&body=${encodeURIComponent(quoteMessage(order, amount))}`
                  : undefined}
                aria-disabled={!hasAmount}
                className={hasAmount ? '' : 'pointer-events-none opacity-50'}
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
          {orders === undefined ? 'Cargando…' : `${orders.length} pedidos, ${pending} por cotizar. Escribe el envío, guarda y envía la cotización al cliente.`}
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
