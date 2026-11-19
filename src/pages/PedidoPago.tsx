import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Clock, Loader2, MessageCircle } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { convexClient } from '@/lib/convexProvider';
import { whatsappUrl } from '@/lib/contact';
import { orderPaid } from '@/lib/shop/analytics';
import { formatAmount } from '@/lib/shop/order';
import { DEFAULTS } from '@/lib/seo';
import OrderHeader from '@/components/order/OrderHeader';

type Status =
  | { found: false }
  | {
      found: true;
      orderNumber: string;
      productName: string;
      quantity: number;
      currency: string;
      total: number;
      paid: number;
      outstanding: number;
      hasOpenLink: boolean;
      cancelled: boolean;
    };

// A card payment is usually confirmed within seconds; a bank transfer can take a few minutes.
const RECHECK_MS = 9_000;
const MAX_RECHECKS = 6;

function Panel({ icon, tone, title, children }: { icon: React.ReactNode; tone: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${tone}`}>{icon}</div>
      <h1 className="mt-6 mb-0 font-serif text-4xl italic leading-tight text-[#2A2624] md:text-5xl">{title}</h1>
      <div className="mt-4 space-y-4 text-lg text-[#5D5550]">{children}</div>
    </div>
  );
}

const PedidoPago: React.FC = () => {
  const [params] = useSearchParams();
  const orderNumber = (params.get('pedido') ?? '').toUpperCase();
  const [status, setStatus] = useState<Status | null>(null);
  const [checks, setChecks] = useState(0);
  const [unreachable, setUnreachable] = useState(false);

  // The page never decides that a payment happened. It asks the server, which asks Whop.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = async (attempt: number) => {
      try {
        if (!convexClient) throw new Error('backend unavailable');
        const result: Status = await convexClient.action(api.orderPayments.refresh, { orderNumber });
        if (cancelled) return;
        setStatus(result);
        setChecks(attempt + 1);
        if (result.found && result.hasOpenLink && attempt + 1 < MAX_RECHECKS) {
          timer = setTimeout(() => check(attempt + 1), RECHECK_MS);
        }
      } catch {
        if (!cancelled) setUnreachable(true);
      }
    };
    check(0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderNumber]);

  const paid = status?.found ? status.paid : 0;
  useEffect(() => {
    if (status?.found && paid > 0) orderPaid(status.orderNumber, paid, status.currency);
    // Reported when the paid amount changes, not on every poll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid]);

  const help = (
    <a
      href={whatsappUrl(`Hola, tengo una duda sobre el pago de mi pedido ${orderNumber}.`)}
      target="_blank"
      rel="noopener noreferrer"
      data-rybbit-event="click_order_payment_whatsapp"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#20ba59]"
    >
      <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
    </a>
  );

  let body: React.ReactNode;
  if (unreachable) {
    body = (
      <Panel icon={<Clock className="h-7 w-7" />} tone="bg-amber-500" title="No pudimos consultar tu pago">
        <div>Si ya pagaste, tu pago está seguro: lo confirmamos en unos minutos y te avisamos por correo.</div>
        {help}
      </Panel>
    );
  } else if (!status) {
    body = (
      <Panel icon={<Loader2 className="h-7 w-7 animate-spin" />} tone="bg-[#2A2624]" title="Consultando tu pago…">
        <div>Un momento.</div>
      </Panel>
    );
  } else if (!status.found) {
    body = (
      <Panel icon={<Clock className="h-7 w-7" />} tone="bg-[#2A2624]" title="No encontramos ese pedido">
        <div>Revisa el enlace que te enviamos o escríbenos y lo vemos contigo.</div>
        {help}
      </Panel>
    );
  } else {
    const item = `${status.quantity} × ${status.productName}`;
    const amount = (value: number) => (
      <strong translate="no" className="notranslate font-semibold text-[#2A2624]">{formatAmount(value, status.currency)}</strong>
    );
    if (status.paid > 0 && status.outstanding === 0) {
      body = (
        <Panel icon={<Check className="h-7 w-7" strokeWidth={2.5} />} tone="bg-emerald-600" title="Pago recibido. Gracias.">
          <div>Tu pedido <strong className="font-semibold text-[#2A2624]">{status.orderNumber}</strong> ({item}) está pagado por completo: {amount(status.paid)}.</div>
          <div>Te enviamos la confirmación por correo y te mantenemos al tanto de la fabricación y la entrega.</div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {help}
            <Link to="/shop" className="inline-flex h-12 items-center justify-center rounded-full border border-[#2A2624]/20 px-6 text-sm font-bold text-[#2A2624] transition-colors hover:border-[#2A2624]">
              Volver a la tienda
            </Link>
          </div>
        </Panel>
      );
    } else if (status.hasOpenLink && checks < MAX_RECHECKS) {
      body = (
        <Panel icon={<Loader2 className="h-7 w-7 animate-spin" />} tone="bg-[#2A2624]" title="Confirmando tu pago…">
          <div>Estamos verificando el pago del pedido <strong className="font-semibold text-[#2A2624]">{status.orderNumber}</strong> con el procesador. Suele tardar unos segundos.</div>
          {status.paid > 0 && <div>Ya tenemos registrado {amount(status.paid)}.</div>}
        </Panel>
      );
    } else if (status.paid > 0) {
      body = (
        <Panel icon={<Check className="h-7 w-7" strokeWidth={2.5} />} tone="bg-emerald-600" title="Pago recibido. Gracias.">
          <div>Recibimos {amount(status.paid)} para tu pedido <strong className="font-semibold text-[#2A2624]">{status.orderNumber}</strong> ({item}).</div>
          <div>Queda pendiente {amount(status.outstanding)} de un total de {amount(status.total)}. Te enviamos el enlace para el resto.</div>
          {help}
        </Panel>
      );
    } else {
      body = (
        <Panel icon={<Clock className="h-7 w-7" />} tone="bg-amber-500" title="Todavía no vemos tu pago">
          <div>
            {status.hasOpenLink
              ? 'Si ya pagaste, no hace falta repetirlo: una transferencia puede tardar unos minutos. Lo confirmamos en cuanto llegue y te avisamos por correo.'
              : `El pedido ${status.orderNumber} aún no tiene un pago registrado. Usa el enlace de pago que te enviamos.`}
          </div>
          {help}
        </Panel>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F0ED] text-[#2A2624] selection:bg-[#EB4C42] selection:text-white">
      <Helmet>
        <title>{`Pago de tu pedido | ${DEFAULTS.siteName}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="border-b border-[#2A2624]/10">
        <OrderHeader homeTo="/" homeLabel="Edelweiss, ir al inicio" helpMessage={`Hola, tengo una duda sobre el pago de mi pedido ${orderNumber}.`} />
      </header>
      <main aria-live="polite" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 md:py-20">{body}</main>
    </div>
  );
};

export default PedidoPago;
