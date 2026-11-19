import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleCheck, Loader2, MessageCircle, Minus, Plus, TriangleAlert } from 'lucide-react';
import type { Product } from '@/lib/shop/types';
import { REFORMER_BUNDLES, isReformerBed } from '@/lib/shop/bundles';
import {
  ACCESS_TYPES,
  CONTACT_CHANNELS,
  MAX_ACCESSORY_QUANTITY,
  PLACE_TYPES,
  QUOTE_RESPONSE_TIME,
  UPHOLSTERY_OPTIONS,
  formatAmount,
  hasUpholsteryChoice,
  priceOrder,
  type FieldErrors,
  type OrderContact,
  type OrderDelivery,
  type OrderDraft,
} from '@/lib/shop/order';
import { isPostalCodeFormat, stateForPostalCode } from '@/lib/shipping/postalCodes';
import shopPolicy from '@/content/shop-policy.json';
import { ChoiceGroup, TextAreaField, TextField } from './fields';

type StepProps = {
  product: Product;
  draft: OrderDraft;
  setDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
};

const primaryButton =
  'inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#EB4C42] px-8 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#EB4C42]/20 transition-all hover:bg-[#D43D33] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
const backButton =
  'inline-flex h-14 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-[#5D5550] transition-colors hover:text-[#2A2624]';

function StepHeading({ title, lead }: { title: string; lead: React.ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="m-0 font-serif text-4xl italic leading-tight text-[#2A2624] md:text-5xl">{title}</h1>
      <div className="mt-3 text-base text-[#5D5550] md:text-lg">{lead}</div>
    </header>
  );
}

function StepActions({ onBack, children }: { onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="mt-10 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <button type="button" onClick={onBack} className={backButton}>
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
      ) : (
        <span />
      )}
      {children}
    </div>
  );
}

export function StepProduct({ product, draft, setDraft, onContinue }: StepProps & { onContinue: () => void }) {
  const setQuantity = (quantity: number) => setDraft((d) => ({ ...d, quantity }));

  return (
    <form
      id="pedido-producto"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onContinue();
      }}
    >
      <StepHeading
        title="Tu pedido"
        lead={<>Elige cantidad y acabado de tu {product.name}. Hoy no se cobra nada.</>}
      />

      <div className="space-y-8">
        {isReformerBed(product) ? (
          <ChoiceGroup
            legend="¿Cuántos necesitas?"
            name="quantity"
            columns="one"
            value={draft.quantity}
            onChange={setQuantity}
            options={REFORMER_BUNDLES.map((bundle) => {
              const pricing = priceOrder(product, bundle.quantity);
              return {
                value: bundle.quantity,
                label: bundle.label,
                detail: pricing.savings > 0
                  ? <>{bundle.sublabel} · ahorras <span translate="no" className="notranslate">{formatAmount(pricing.savings, pricing.currency)}</span></>
                  : bundle.sublabel,
                aside: (
                  <span translate="no" className="notranslate">
                    <span className="block font-bold text-[#2A2624]">{formatAmount(pricing.unitPrice, pricing.currency)}</span>
                    <span className="text-xs text-[#5D5550]">por unidad</span>
                  </span>
                ),
              };
            })}
            hint={<>¿Otra cantidad? Escríbenos y armamos tu pack.</>}
          />
        ) : (
          <div>
            <div className="mb-2 text-sm font-semibold text-[#2A2624]">Cantidad</div>
            <div className="inline-flex items-center rounded-full border border-[#2A2624]/15 bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, draft.quantity - 1))}
                disabled={draft.quantity <= 1}
                className="flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-30"
                aria-label="Quitar una unidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span translate="no" aria-live="polite" className="notranslate w-10 text-center text-base font-bold">{draft.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(MAX_ACCESSORY_QUANTITY, draft.quantity + 1))}
                disabled={draft.quantity >= MAX_ACCESSORY_QUANTITY}
                className="flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-30"
                aria-label="Agregar una unidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {hasUpholsteryChoice(product) && (
          <ChoiceGroup
            legend="Color de tapicería"
            name="upholstery"
            columns="auto"
            value={draft.upholstery}
            onChange={(upholstery) => setDraft((d) => ({ ...d, upholstery }))}
            options={UPHOLSTERY_OPTIONS.map((value) => ({ value, label: value }))}
            hint={draft.upholstery === 'Otro color' ? 'Otros colores son bajo pedido; lo vemos contigo al confirmar.' : undefined}
          />
        )}
      </div>

      <StepActions>
        <button type="submit" className={primaryButton}>
          Continuar con la entrega <ArrowRight className="h-4 w-4" />
        </button>
      </StepActions>
    </form>
  );
}

type DeliveryProps = StepProps & {
  errors: FieldErrors<OrderDelivery>;
  onBack: () => void;
  onContinue: () => void;
};

export function StepDelivery({ draft, setDraft, errors, onBack, onContinue }: DeliveryProps) {
  const { delivery } = draft;
  const set = <K extends keyof OrderDelivery>(key: K, value: OrderDelivery[K]) =>
    setDraft((d) => ({ ...d, delivery: { ...d.delivery, [key]: value } }));
  const state = stateForPostalCode(delivery.postalCode);
  const unknownPrefix = isPostalCodeFormat(delivery.postalCode) && !state;

  return (
    <form
      id="pedido-entrega"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onContinue();
      }}
    >
      <StepHeading
        title="¿A dónde lo enviamos?"
        lead={<>Con tu dirección cotizamos el envío asegurado y te lo enviamos en {QUOTE_RESPONSE_TIME}.</>}
      />

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
          <TextField
            label="Código postal"
            name="postal-code"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="44100"
            value={delivery.postalCode}
            // No maxLength: a pasted "C.P. 44100" would be cut before the digits are picked out.
            onChange={(event) => set('postalCode', event.target.value.replace(/\D/g, '').slice(0, 5))}
            error={errors.postalCode}
          />
          <TextField
            label="Ciudad o municipio"
            name="city"
            autoComplete="address-level2"
            value={delivery.city}
            onChange={(event) => set('city', event.target.value)}
            error={errors.city}
          />
        </div>

        <div aria-live="polite">
          {state && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" /> Enviamos a {state}.
            </div>
          )}
          {unknownPrefix && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              No reconocimos el estado de este código postal. Revísalo; si es correcto, continúa y lo confirmamos contigo.
            </div>
          )}
        </div>

        <TextField
          label="Calle y número"
          name="street-address"
          autoComplete="address-line1"
          value={delivery.street}
          onChange={(event) => set('street', event.target.value)}
          error={errors.street}
        />
        <TextField
          label="Colonia"
          optional
          name="neighborhood"
          autoComplete="address-line2"
          value={delivery.neighborhood}
          onChange={(event) => set('neighborhood', event.target.value)}
        />

        <ChoiceGroup
          legend="¿Qué tipo de lugar es?"
          name="place-type"
          value={delivery.placeType}
          onChange={(value) => set('placeType', value)}
          options={PLACE_TYPES.map((value) => ({ value, label: value }))}
        />
        <ChoiceGroup
          legend="¿Cómo es el acceso?"
          name="access"
          columns="three"
          value={delivery.access}
          onChange={(value) => set('access', value)}
          options={ACCESS_TYPES.map((value) => ({ value, label: value }))}
          hint="Nos ayuda a cotizar la entrega correcta."
        />
        <TextAreaField
          label="Indicaciones para la entrega"
          optional
          name="delivery-notes"
          maxLength={600}
          value={delivery.notes}
          onChange={(event) => set('notes', event.target.value)}
        />
      </div>

      <StepActions onBack={onBack}>
        <button type="submit" className={primaryButton}>
          Continuar <ArrowRight className="h-4 w-4" />
        </button>
      </StepActions>
    </form>
  );
}

type ContactProps = StepProps & {
  errors: FieldErrors<OrderContact>;
  submitting: boolean;
  submitFailed: boolean;
  whatsappHandoffUrl: string;
  onWhatsAppHandoff: () => void;
  honeypot: string;
  setHoneypot: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export function StepContact({
  draft,
  setDraft,
  errors,
  submitting,
  submitFailed,
  whatsappHandoffUrl,
  onWhatsAppHandoff,
  honeypot,
  setHoneypot,
  onBack,
  onSubmit,
}: ContactProps) {
  const { contact } = draft;
  const set = <K extends keyof OrderContact>(key: K, value: OrderContact[K]) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, [key]: value } }));

  return (
    <form
      id="pedido-contacto"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <StepHeading
        title="¿A quién le enviamos la cotización?"
        lead={<>Último paso. Te contactamos solo por este pedido; entrega en {shopPolicy.deliveryWindow} una vez confirmado.</>}
      />

      <div className="space-y-5">
        <TextField
          label="Nombre completo"
          // Not name="name": a field with that name replaces form.name, and the analytics
          // script's form tracking then chokes on it.
          name="full-name"
          autoComplete="name"
          value={contact.name}
          onChange={(event) => set('name', event.target.value)}
          error={errors.name}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Celular con WhatsApp"
            name="tel"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            placeholder="55 1234 5678"
            value={contact.phone}
            onChange={(event) => set('phone', event.target.value)}
            error={errors.phone}
            hint="10 dígitos"
          />
          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={contact.email}
            onChange={(event) => set('email', event.target.value)}
            error={errors.email}
          />
        </div>

        <ChoiceGroup
          legend="¿Por dónde prefieres recibirla?"
          name="channel"
          value={contact.channel}
          onChange={(value) => set('channel', value)}
          options={CONTACT_CHANNELS.map((value) => ({ value, label: value }))}
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#2A2624]/12 bg-white/60 p-4">
          <input
            type="checkbox"
            checked={draft.invoiceRequired}
            onChange={(event) => setDraft((d) => ({ ...d, invoiceRequired: event.target.checked }))}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#2A2624]"
          />
          <span>
            <span className="block text-sm font-semibold text-[#2A2624]">Necesito factura</span>
            <span className="mt-0.5 block text-sm text-[#5D5550]">Te pedimos tus datos fiscales al confirmar el pedido.</span>
          </span>
        </label>

        {/* Left empty by people; filled by form-filling bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Sitio web
            <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
          </label>
        </div>
      </div>

      {submitFailed && (
        <div role="alert" className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <div className="font-semibold text-amber-950">No pudimos registrar tu pedido en línea.</div>
          <div className="mt-1 text-sm text-amber-900">
            Tus datos siguen aquí. Envíalo por WhatsApp con un toque: el mensaje ya lleva el pedido completo.
          </div>
          <a
            href={whatsappHandoffUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsAppHandoff}
            data-rybbit-event="click_order_whatsapp_handoff"
            className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#20ba59]"
          >
            <MessageCircle className="h-4 w-4" /> Enviar pedido por WhatsApp
          </a>
        </div>
      )}

      <StepActions onBack={onBack}>
        <button type="submit" disabled={submitting} className={primaryButton}>
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</>
          ) : submitFailed ? (
            'Intentar de nuevo'
          ) : (
            <>Enviar pedido <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </StepActions>

      <div className="mt-4 text-sm text-[#5D5550] sm:text-right">
        Sin cobro hoy. Al enviar aceptas nuestro{' '}
        <Link to="/legal/privacidad" target="_blank" className="underline underline-offset-2 hover:text-[#2A2624]">aviso de privacidad</Link>.
      </div>
    </form>
  );
}
