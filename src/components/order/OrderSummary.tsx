import { Clock, FileText, ShieldCheck, Truck } from 'lucide-react';
import type { Product } from '@/lib/shop/types';
import { formatAmount, hasUpholsteryChoice, type OrderDraft, type OrderPricing } from '@/lib/shop/order';
import { stateForPostalCode } from '@/lib/shipping/postalCodes';
import shopPolicy from '@/content/shop-policy.json';

type Props = {
  product: Product;
  draft: OrderDraft;
  pricing: OrderPricing;
};

export function OrderSummary({ product, draft, pricing }: Props) {
  const state = stateForPostalCode(draft.delivery.postalCode);

  return (
    <div className="text-sm text-[#2A2624]">
      <div className="flex gap-4">
        <img
          src={product.image}
          alt=""
          width={88}
          height={88}
          className="h-[88px] w-[88px] shrink-0 rounded-2xl bg-[#EAE8E4] object-cover"
        />
        <div className="min-w-0">
          <div className="font-serif text-lg italic leading-snug">{product.name}</div>
          <div className="mt-1 text-[#5D5550]">
            {/* translate="no": browser translation freezes values React re-renders */}
            <span translate="no" className="notranslate">{pricing.quantity}</span>{' '}
            {pricing.quantity === 1 ? 'unidad' : 'unidades'}
            {hasUpholsteryChoice(product) && <> · Tapicería {draft.upholstery.toLowerCase()}</>}
          </div>
        </div>
      </div>

      <dl className="mt-6 space-y-3 border-t border-[#2A2624]/10 pt-5">
        <div className="flex justify-between gap-4">
          <dt className="text-[#5D5550]">Precio por unidad</dt>
          <dd translate="no" className="notranslate m-0 text-right">
            {pricing.savings > 0 && (
              <span className="mr-2 text-[#8C827A] line-through">{formatAmount(pricing.listUnitPrice, pricing.currency)}</span>
            )}
            {formatAmount(pricing.unitPrice, pricing.currency)}
          </dd>
        </div>
        {pricing.savings > 0 && (
          <div className="flex justify-between gap-4 text-emerald-700">
            <dt>Ahorro por pack</dt>
            <dd translate="no" className="notranslate m-0">−{formatAmount(pricing.savings, pricing.currency)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-[#5D5550]">Envío asegurado{state ? ` a ${state}` : ''}</dt>
          <dd className="m-0 text-right">Te lo cotizamos</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-[#2A2624]/10 pt-4">
          <dt className="font-semibold">Subtotal <span className="font-normal text-[#5D5550]">(IVA incluido)</span></dt>
          <dd translate="no" className="notranslate m-0 text-xl font-bold">{formatAmount(pricing.subtotal, pricing.currency)}</dd>
        </div>
        <div className="flex justify-between gap-4 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-900">
          <dt className="font-semibold">Hoy pagas</dt>
          <dd className="m-0 font-bold">$0</dd>
        </div>
      </dl>

      <ul className="mt-6 list-none space-y-3 p-0 text-[#5D5550]">
        <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Entrega en {shopPolicy.deliveryWindow}, fabricación bajo pedido</li>
        <li className="flex gap-3"><Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Envío asegurado a los 32 estados</li>
        <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Garantía de {product.warranty ?? '1 año'}</li>
        <li className="flex gap-3"><FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Factura fiscal con IVA desglosado</li>
      </ul>
    </div>
  );
}

export default OrderSummary;
