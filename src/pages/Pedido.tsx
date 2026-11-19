import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { convexClient } from '@/lib/convexProvider';
import { whatsappUrl } from '@/lib/contact';
import { stateForPostalCode } from '@/lib/shipping/postalCodes';
import {
  orderFieldError,
  orderStepCompleted,
  orderStepViewed,
  orderSubmitted,
  type OrderStep,
} from '@/lib/shop/analytics';
import {
  EMPTY_DRAFT,
  allowedQuantities,
  findProduct,
  formatAmount,
  hasUpholsteryChoice,
  orderMessage,
  priceOrder,
  validateContact,
  validateDelivery,
  type OrderDraft,
} from '@/lib/shop/order';
import type { Product } from '@/lib/shop/types';
import { DEFAULTS } from '@/lib/seo';
import OrderConfirmation, { type OrderResult } from '@/components/order/OrderConfirmation';
import OrderSummary from '@/components/order/OrderSummary';
import { StepContact, StepDelivery, StepProduct } from '@/components/order/OrderSteps';

const STEPS: Array<{ id: OrderStep; label: string }> = [
  { id: 'producto', label: 'Pedido' },
  { id: 'entrega', label: 'Entrega' },
  { id: 'contacto', label: 'Contacto' },
];

const SUBMIT_TIMEOUT_MS = 12000;

type Saved = { draft: OrderDraft; result?: OrderResult };

// The draft lives in sessionStorage so a reload or a trip back to the product page keeps what the
// buyer typed. Storage can be unavailable (private mode), in which case the form just starts empty.
function loadSaved(key: string): Saved | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: Saved) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing to do: the form still works without it.
  }
}

function newClientRef(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

const confirmationId = (result: OrderResult) => result.orderNumber ?? 'whatsapp';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

function OrderFlow({ product }: { product: Product }) {
  const storageKey = `edw-order:${product.slug}`;
  const [params, setParams] = useSearchParams();
  const quantities = allowedQuantities(product);

  const [saved] = useState(() => loadSaved(storageKey));
  const [draft, setDraft] = useState<OrderDraft>(() => {
    const requested = Number(params.get('cantidad'));
    const base = saved?.draft ?? EMPTY_DRAFT;
    const quantity = quantities.includes(requested) ? requested : quantities.includes(base.quantity) ? base.quantity : quantities[0];
    return { ...base, quantity };
  });
  const [result, setResult] = useState<OrderResult | null>(saved?.result ?? null);
  // Errors appear after the first attempt to continue, then follow the fields as they are fixed.
  const [deliveryAttempted, setDeliveryAttempted] = useState(false);
  const [contactAttempted, setContactAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const clientRef = useRef(newClientRef());

  const pricing = useMemo(() => priceOrder(product, draft.quantity), [product, draft.quantity]);
  // The confirmation is tied to the URL: a fresh visit from the product page starts a new order
  // even if an earlier one from this session is still saved.
  const confirmed = result && params.get('pedido') === confirmationId(result) ? result : null;
  const deliveryProblems = validateDelivery(draft.delivery);
  const contactProblems = validateContact(draft.contact);
  const deliveryValid = Object.keys(deliveryProblems).length === 0;

  // The step is in the URL so the browser's back button moves between steps instead of leaving.
  const requestedStep = Math.min(Math.max(Number(params.get('paso')) || 1, 1), 3);
  const stepIndex = (requestedStep === 3 && !deliveryValid ? 2 : requestedStep) - 1;
  const step = STEPS[stepIndex];

  const goTo = useCallback(
    (index: number) => {
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set('paso', String(index + 1));
        return next;
      });
      window.scrollTo(0, 0);
    },
    [setParams],
  );

  useEffect(() => {
    save(storageKey, { draft, result: result ?? undefined });
  }, [storageKey, draft, result]);

  const isConfirmed = Boolean(confirmed);
  useEffect(() => {
    if (!isConfirmed) orderStepViewed(step.id, product, pricing.quantity, pricing.subtotal);
    // One event per step shown; quantity changes within a step are not new views.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, isConfirmed]);

  const state = stateForPostalCode(draft.delivery.postalCode) ?? 'sin identificar';

  const completeProduct = () => {
    orderStepCompleted('producto', product, pricing.quantity, pricing.subtotal, {
      ...(hasUpholsteryChoice(product) ? { upholstery: draft.upholstery } : {}),
    });
    goTo(1);
  };

  const focusFirstInvalid = (formId: string) => {
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`#${formId} [aria-invalid="true"]`)?.focus());
  };

  const completeDelivery = () => {
    if (!deliveryValid) {
      setDeliveryAttempted(true);
      orderFieldError('entrega', Object.keys(deliveryProblems));
      focusFirstInvalid('pedido-entrega');
      return;
    }
    orderStepCompleted('entrega', product, pricing.quantity, pricing.subtotal, {
      state,
      place_type: draft.delivery.placeType,
      access: draft.delivery.access,
    });
    goTo(2);
  };

  const finish = (orderResult: OrderResult, via: 'stored' | 'whatsapp') => {
    orderStepCompleted('contacto', product, pricing.quantity, pricing.subtotal, {
      channel: draft.contact.channel,
      invoice: draft.invoiceRequired,
    });
    orderSubmitted(product, pricing.quantity, pricing.subtotal, state, via);
    setResult(orderResult);
    setParams({ pedido: confirmationId(orderResult) }, { replace: true });
    window.scrollTo(0, 0);
  };

  const submit = async () => {
    if (Object.keys(contactProblems).length > 0) {
      setContactAttempted(true);
      orderFieldError('contacto', Object.keys(contactProblems));
      focusFirstInvalid('pedido-contacto');
      return;
    }
    setSubmitting(true);
    setSubmitFailed(false);
    try {
      if (!convexClient) throw new Error('backend unavailable');
      const response = await withTimeout(
        convexClient.mutation(api.orderRequests.submit, {
          clientRef: clientRef.current,
          productSlug: product.slug,
          quantity: draft.quantity,
          upholstery: hasUpholsteryChoice(product) ? draft.upholstery : undefined,
          contact: draft.contact,
          delivery: draft.delivery,
          invoiceRequired: draft.invoiceRequired,
          sourcePath: window.location.pathname,
          website: honeypot || undefined,
        }),
        SUBMIT_TIMEOUT_MS,
      );
      finish(response, 'stored');
    } catch {
      // The order must not be lost because storing it failed: offer the same order over WhatsApp.
      setSubmitFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const helpUrl = whatsappUrl(`Hola, estoy haciendo un pedido de ${product.name} en camadepilates.com y tengo una pregunta.`);

  return (
    <div className="min-h-screen bg-[#F2F0ED] text-[#2A2624] selection:bg-[#EB4C42] selection:text-white">
      <Helmet>
        <title>{`Tu pedido: ${product.name} | ${DEFAULTS.siteName}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-[#2A2624]/10 bg-[#F2F0ED]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
          <Link to={`/product/${product.slug}`} className="flex items-baseline gap-0.5" aria-label="Edelweiss, volver al producto">
            <span className="font-serif text-xl italic tracking-tight sm:text-2xl">Edelweiss</span>
            <span className="mb-0.5 h-1.5 w-1.5 rounded-full bg-[#EB4C42]" />
          </Link>

          {!confirmed && (
            <ol className="m-0 hidden list-none items-center gap-2 p-0 md:flex">
              {STEPS.map((item, i) => {
                const reachable = i < stepIndex;
                const current = i === stepIndex;
                return (
                  <li key={item.id} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true" className="h-px w-8 bg-[#2A2624]/20" />}
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => goTo(i)}
                      aria-current={current ? 'step' : undefined}
                      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] ${
                        current ? 'text-[#2A2624]' : reachable ? 'text-[#5D5550] hover:text-[#2A2624]' : 'text-[#8C827A]'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                          current ? 'bg-[#2A2624] text-white' : reachable ? 'bg-emerald-600 text-white' : 'border border-[#2A2624]/25'
                        }`}
                      >
                        {i + 1}
                      </span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-rybbit-event="click_order_help_whatsapp"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366] hover:text-white"
          >
            <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">¿Dudas?</span> WhatsApp
          </a>
        </div>

        {!confirmed && (
          <div className="md:hidden">
            <div className="px-4 pb-3 text-xs font-bold uppercase tracking-[0.15em] text-[#5D5550]">
              Paso {stepIndex + 1} de {STEPS.length} · {step.label}
            </div>
            <div className="h-1 bg-[#2A2624]/10" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={stepIndex + 1}>
              <div className="h-full bg-[#EB4C42] transition-[width] duration-300" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 md:py-14">
        {confirmed ? (
          <OrderConfirmation product={product} draft={draft} pricing={pricing} result={confirmed} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
            <details className="group rounded-2xl bg-white lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  Resumen del pedido <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                </span>
                <span translate="no" className="notranslate font-bold">{formatAmount(pricing.subtotal, pricing.currency)}</span>
              </summary>
              <div className="border-t border-[#2A2624]/10 p-5">
                <OrderSummary product={product} draft={draft} pricing={pricing} />
              </div>
            </details>

            <div className="min-w-0">
              {step.id === 'producto' && <StepProduct product={product} draft={draft} setDraft={setDraft} onContinue={completeProduct} />}
              {step.id === 'entrega' && (
                <StepDelivery
                  product={product}
                  draft={draft}
                  setDraft={setDraft}
                  errors={deliveryAttempted ? deliveryProblems : {}}
                  onBack={() => goTo(0)}
                  onContinue={completeDelivery}
                />
              )}
              {step.id === 'contacto' && (
                <StepContact
                  product={product}
                  draft={draft}
                  setDraft={setDraft}
                  errors={contactAttempted ? contactProblems : {}}
                  submitting={submitting}
                  submitFailed={submitFailed}
                  whatsappHandoffUrl={whatsappUrl(orderMessage(product, draft, pricing))}
                  onWhatsAppHandoff={() => finish({}, 'whatsapp')}
                  honeypot={honeypot}
                  setHoneypot={setHoneypot}
                  onBack={() => goTo(1)}
                  onSubmit={submit}
                />
              )}
            </div>

            <aside className="hidden self-start rounded-[2rem] bg-white p-6 lg:sticky lg:top-8 lg:block">
              <h2 className="mt-0 mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#5D5550]">Resumen del pedido</h2>
              <OrderSummary product={product} draft={draft} pricing={pricing} />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

const Pedido: React.FC = () => {
  const { slug = '' } = useParams();
  const product = findProduct(slug);
  if (!product) return <Navigate to="/shop" replace />;
  return <OrderFlow key={product.slug} product={product} />;
};

export default Pedido;
