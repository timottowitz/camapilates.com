import React from 'react';
import { Sparkles, Check, Building2, Tag } from 'lucide-react';
import {
  REFORMER_BUNDLES,
  calculateBundlePrice,
  type BundleQuantity,
} from '@/lib/shop/bundles';

interface BundleSelectorProps {
  basePrice: number | string;
  currency?: string;
  selectedQuantity: BundleQuantity;
  onSelectQuantity: (q: BundleQuantity) => void;
  productName?: string;
}

export const BundleSelector: React.FC<BundleSelectorProps> = ({
  basePrice,
  currency = 'MXN',
  selectedQuantity,
  onSelectQuantity,
  productName = 'Equipos',
}) => {
  const currentCalc = calculateBundlePrice(basePrice, selectedQuantity);

  return (
    <div className="space-y-4 my-6 p-6 rounded-2xl bg-[#F8F7F5] border border-[#2A2624]/10 shadow-sm">
      {/* Header Banner */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#3E2723]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2A2624]">
              The Studio Pack · El Pack Estudio
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#3E2723] text-[#EAE8E4] font-medium">
            Hasta 20% OFF
          </span>
        </div>
        <p className="text-xs text-[#5D5550] italic font-light pl-6">
          ¿Construyendo un nuevo Estudio? Obtén un gran descuento en equipos Edelweiss al equipar tu espacio.
        </p>
      </div>

      {/* Grid of Bundle Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {REFORMER_BUNDLES.map((bundle) => {
          const isSelected = selectedQuantity === bundle.quantity;
          const calc = calculateBundlePrice(basePrice, bundle.quantity);

          return (
            <button
              key={bundle.quantity}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectQuantity(bundle.quantity);
              }}
              className={`
                relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer
                ${
                  isSelected
                    ? 'border-[#2A2624] bg-white ring-2 ring-[#2A2624]/20 shadow-md transform scale-[1.02]'
                    : 'border-[#2A2624]/15 bg-white/60 hover:bg-white hover:border-[#2A2624]/40'
                }
              `}
            >
              {/* Badge for discount / best value */}
              {bundle.badge && (
                <span
                  className={`
                    absolute -top-2.5 right-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs pointer-events-none
                    ${
                      bundle.isBestValue
                        ? 'bg-[#3E2723] text-[#EAE8E4]'
                        : 'bg-[#2A2624] text-[#EAE8E4]'
                    }
                  `}
                >
                  {bundle.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif italic text-lg text-[#2A2624]">
                    {bundle.label}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#2A2624] text-[#EAE8E4] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-wider text-[#5D5550] mb-2 font-medium">
                  {bundle.sublabel}
                </p>
              </div>

              <div className="pt-2 border-t border-[#2A2624]/10">
                {bundle.discountPercentage > 0 ? (
                  <>
                    <div className="text-xs font-bold text-[#2A2624]">
                      ${calc.discountedUnitPrice.toLocaleString('es-MX')}
                      <span className="text-[9px] font-normal text-[#5D5550]"> / u.</span>
                    </div>
                    <div className="text-[10px] text-[#5D5550] line-through">
                      ${calc.originalUnitPrice.toLocaleString('es-MX')}
                    </div>
                  </>
                ) : (
                  <div className="text-xs font-bold text-[#2A2624]">
                    ${calc.originalUnitPrice.toLocaleString('es-MX')}
                    <span className="text-[9px] font-normal text-[#5D5550]"> / u.</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Rebated Price Summary Panel */}
      {selectedQuantity > 1 && (
        <div className="mt-4 p-4 rounded-xl bg-[#2A2624] text-[#EAE8E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-medium uppercase tracking-wider text-amber-200">
                The Studio Pack ({selectedQuantity}x {productName} · {currentCalc.discountPercentage}% OFF)
              </span>
            </div>
            <p className="text-xs text-[#EAE8E4]/80">
              Precio Unitario Rebajado: <span className="font-semibold text-white">${currentCalc.discountedUnitPrice.toLocaleString('es-MX')} {currency}</span>
            </p>
          </div>

          <div className="text-right sm:text-right border-t sm:border-t-0 border-[#EAE8E4]/15 pt-2 sm:pt-0">
            <div className="text-[11px] text-[#EAE8E4]/60 line-through">
              Original: ${currentCalc.originalTotalPrice.toLocaleString('es-MX')} {currency}
            </div>
            <div className="text-xl font-serif italic font-bold text-white">
              Total: ${currentCalc.discountedTotalPrice.toLocaleString('es-MX')} <span className="text-xs font-sans not-italic text-[#EAE8E4]/80">{currency}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
              <Tag className="w-3 h-3" /> Ahorro total: ${currentCalc.totalSavings.toLocaleString('es-MX')} {currency}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleSelector;
