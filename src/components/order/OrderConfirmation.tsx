import { Link } from 'react-router-dom';
import { Check, MessageCircle } from 'lucide-react';
import type { Product } from '@/lib/shop/types';
import { QUOTE_RESPONSE_TIME, deliveryPlace, type OrderDraft, type OrderPricing } from '@/lib/shop/order';
import { whatsappUrl } from '@/lib/contact';
import shopPolicy from '@/content/shop-policy.json';
import OrderSummary from './OrderSummary';

export type OrderResult = {
  // Present when the order was stored; absent when it was handed to WhatsApp instead.
  orderNumber?: string;
  emailConfirmation?: boolean;
};

type Props = {
  product: Product;
  draft: OrderDraft;
  pricing: OrderPricing;
  result: OrderResult;
};

export function OrderConfirmation({ product, draft, pricing, result }: Props) {
  const firstName = draft.contact.name.trim().split(/\s+/)[0];
  const place = deliveryPlace(draft.delivery);
  const channel = draft.contact.channel === 'Correo' ? 'correo' : 'WhatsApp';
  const stored = Boolean(result.orderNumber);

  const steps = [
    { title: stored ? 'Pedido recibido' : 'Pedido enviado por WhatsApp', detail: stored ? 'Ya lo tenemos registrado.' : 'Asegúrate de haber enviado el mensaje.', done: true },
    { title: 'Cotización de envío', detail: `Te la enviamos por ${channel} en ${QUOTE_RESPONSE_TIME}.` },
    { title: 'Confirmas el total', detail: 'Si estás de acuerdo, acordamos el pago. Antes de eso no se cobra nada.' },
    { title: 'Fabricación y entrega', detail: `${shopPolicy.deliveryWindow}, en ${place}.` },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="h-7 w-7" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <h1 className="mt-6 mb-0 font-serif text-4xl italic leading-tight text-[#2A2624] md:text-5xl">
            Gracias, {firstName}.
          </h1>
          <div className="mt-4 text-lg text-[#5D5550]">
            {stored ? 'Recibimos tu pedido.' : 'Tu pedido va en el mensaje de WhatsApp.'} Ahora cotizamos el envío asegurado a{' '}
            <strong className="font-semibold text-[#2A2624]">{place}</strong> y te lo enviamos por {channel} en {QUOTE_RESPONSE_TIME}.
          </div>

          {result.orderNumber && (
            <div className="mt-6 inline-flex items-baseline gap-3 rounded-2xl bg-white px-5 py-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5D5550]">Pedido</span>
              <span translate="no" className="notranslate text-xl font-bold tracking-wide text-[#2A2624]">{result.orderNumber}</span>
            </div>
          )}
          {result.emailConfirmation && (
            <div className="mt-3 text-sm text-[#5D5550]">
              Te enviamos una copia a {draft.contact.email.trim()}. Si no la ves, revisa tu carpeta de spam.
            </div>
          )}

          <h2 className="mt-12 mb-0 text-xs font-bold uppercase tracking-[0.2em] text-[#5D5550]">Qué sigue</h2>
          <ol className="mt-5 list-none space-y-0 p-0">
            {steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
                {i < steps.length - 1 && <span aria-hidden="true" className="absolute left-[15px] top-8 h-full w-px bg-[#2A2624]/15" />}
                <span
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    step.done ? 'bg-emerald-600 text-white' : 'border border-[#2A2624]/25 bg-[#F2F0ED] text-[#5D5550]'
                  }`}
                >
                  {step.done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-[#2A2624]">{step.title}</span>
                  <span className="mt-0.5 block text-sm text-[#5D5550]">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl(
                result.orderNumber
                  ? `Hola, hice el pedido ${result.orderNumber} en camadepilates.com y tengo una pregunta.`
                  : `Hola, acabo de enviar un pedido de ${product.name} y tengo una pregunta.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              data-rybbit-event="click_order_confirmation_whatsapp"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#20ba59]"
            >
              <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
            </a>
            <Link
              to="/shop"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#2A2624]/20 px-6 text-sm font-bold text-[#2A2624] transition-colors hover:border-[#2A2624]"
            >
              Seguir viendo la tienda
            </Link>
          </div>
        </div>

        <aside className="self-start rounded-[2rem] bg-white p-6">
          <OrderSummary product={product} draft={draft} pricing={pricing} />
        </aside>
      </div>
    </div>
  );
}

export default OrderConfirmation;
