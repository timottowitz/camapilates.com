import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import type { FinishKey } from '@/lib/shop/types';

type FilterSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  // Categories
  categories: { slug: string; name: string; count: number }[];
  activeCats: string[];
  setActiveCats: React.Dispatch<React.SetStateAction<string[]>>;
  // Finishes
  finishes: FinishKey[];
  activeFinishes: FinishKey[];
  setActiveFinishes: React.Dispatch<React.SetStateAction<FinishKey[]>>;
  // Price
  minPrice: string;
  maxPrice: string;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
  // Results count
  resultsCount: number;
  // Clear all
  onClearAll: () => void;
};

const MobileFilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  categories,
  activeCats,
  setActiveCats,
  finishes,
  activeFinishes,
  setActiveFinishes,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  resultsCount,
  onClearAll,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>('categories');
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle touch gestures for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 100) {
      onClose();
    }
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
  };

  const hasActiveFilters = activeCats.length > 0 || activeFinishes.length > 0 || minPrice || maxPrice;

  const toggleCategory = (name: string) => {
    setActiveCats(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const toggleFinish = (finish: FinishKey) => {
    setActiveFinishes(prev =>
      prev.includes(finish) ? prev.filter(f => f !== finish) : [...prev, finish]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[2rem] shadow-2xl max-h-[85vh] flex flex-col transition-transform duration-300 ease-out"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#2A2624]/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-[#2A2624]/10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-[#2A2624]" />
            <h2 className="text-lg font-serif italic text-[#2A2624]">Filtros</h2>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={onClearAll}
                className="text-[10px] uppercase tracking-[0.15em] text-[#EB4C42] font-bold"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-[#2A2624]/5 flex items-center justify-center hover:bg-[#2A2624]/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Categories Section */}
          <FilterSection
            title="Categorías"
            isOpen={activeSection === 'categories'}
            onToggle={() => setActiveSection(activeSection === 'categories' ? null : 'categories')}
            count={activeCats.length}
          >
            <div className="grid grid-cols-2 gap-2 p-4 pt-0">
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.name)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl
                    border transition-all duration-200
                    ${activeCats.includes(cat.name)
                      ? 'bg-[#2A2624] text-white border-[#2A2624]'
                      : 'bg-white text-[#2A2624] border-[#2A2624]/10 hover:border-[#2A2624]/30'}
                  `}
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className={`text-xs ${activeCats.includes(cat.name) ? 'text-white/60' : 'text-[#5D5550]/60'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Finishes Section */}
          <FilterSection
            title="Acabados"
            isOpen={activeSection === 'finishes'}
            onToggle={() => setActiveSection(activeSection === 'finishes' ? null : 'finishes')}
            count={activeFinishes.length}
          >
            <div className="flex flex-wrap gap-2 p-4 pt-0">
              {finishes.map(finish => (
                <button
                  key={finish}
                  onClick={() => toggleFinish(finish)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full
                    border transition-all duration-200
                    ${activeFinishes.includes(finish)
                      ? 'bg-[#2A2624] text-white border-[#2A2624]'
                      : 'bg-white text-[#2A2624] border-[#2A2624]/10 hover:border-[#2A2624]/30'}
                  `}
                >
                  {activeFinishes.includes(finish) && <Check className="h-3 w-3" />}
                  <span className="text-sm">{finish}</span>
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Price Section */}
          <FilterSection
            title="Precio"
            isOpen={activeSection === 'price'}
            onToggle={() => setActiveSection(activeSection === 'price' ? null : 'price')}
            count={minPrice || maxPrice ? 1 : 0}
          >
            <div className="p-4 pt-0 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-[#5D5550]/60 font-bold mb-2 block">
                    Mínimo
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5D5550]/60">$</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="
                        w-full pl-8 pr-4 py-3 rounded-xl
                        border border-[#2A2624]/10 bg-white
                        text-[#2A2624] placeholder:text-[#5D5550]/40
                        focus:outline-none focus:border-[#2A2624]/30 focus:ring-2 focus:ring-[#2A2624]/5
                        transition-all
                      "
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-[#5D5550]/60 font-bold mb-2 block">
                    Máximo
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5D5550]/60">$</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="100,000"
                      className="
                        w-full pl-8 pr-4 py-3 rounded-xl
                        border border-[#2A2624]/10 bg-white
                        text-[#2A2624] placeholder:text-[#5D5550]/40
                        focus:outline-none focus:border-[#2A2624]/30 focus:ring-2 focus:ring-[#2A2624]/5
                        transition-all
                      "
                    />
                  </div>
                </div>
              </div>

              {/* Quick Price Ranges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '< $1,000', min: '', max: '1000' },
                  { label: '$1k - $10k', min: '1000', max: '10000' },
                  { label: '$10k - $50k', min: '10000', max: '50000' },
                  { label: '> $50k', min: '50000', max: '' },
                ].map(range => (
                  <button
                    key={range.label}
                    onClick={() => { setMinPrice(range.min); setMaxPrice(range.max); }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624]/10 transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="border-t border-[#2A2624]/10 p-4 pb-8 bg-white">
          <button
            onClick={onClose}
            className="
              w-full py-4 rounded-2xl
              bg-[#2A2624] text-white
              text-sm font-bold uppercase tracking-[0.15em]
              hover:bg-[#EB4C42] active:scale-[0.98]
              transition-all duration-200
              shadow-lg shadow-[#2A2624]/20
            "
          >
            Ver {resultsCount} {resultsCount === 1 ? 'resultado' : 'resultados'}
          </button>
        </div>
      </div>
    </>
  );
};

// Collapsible Section Component
const FilterSection: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}> = ({ title, isOpen, onToggle, count, children }) => (
  <div className="border-b border-[#2A2624]/10">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#2A2624]">{title}</span>
        {count > 0 && (
          <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#EB4C42] text-white text-[10px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </div>
      <ChevronDown className={`h-4 w-4 text-[#5D5550] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      {children}
    </div>
  </div>
);

// Mobile Filter Trigger Button
export const MobileFilterTrigger: React.FC<{
  onClick: () => void;
  activeCount: number;
}> = ({ onClick, activeCount }) => (
  <button
    onClick={onClick}
    className="
      md:hidden fixed bottom-6 right-6 z-40
      h-14 px-5 rounded-full
      bg-[#2A2624] text-white
      shadow-xl shadow-[#2A2624]/30
      flex items-center gap-2
      hover:bg-[#EB4C42] active:scale-95
      transition-all duration-200
    "
  >
    <SlidersHorizontal className="h-4 w-4" />
    <span className="text-sm font-bold">Filtros</span>
    {activeCount > 0 && (
      <span className="h-5 min-w-5 px-1.5 rounded-full bg-white text-[#2A2624] text-[10px] font-bold flex items-center justify-center">
        {activeCount}
      </span>
    )}
  </button>
);

export default MobileFilterSheet;
