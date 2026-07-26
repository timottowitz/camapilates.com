import React, { useRef, useState, useEffect } from 'react';
import type { Product } from '@/lib/shop/types';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductRail21: React.FC<{ title: string; products: Product[] }> = ({ title, products }) => {
  // Every hook below has to run before the empty-list bail out. When this returned
  // early the hook count changed with the length of `products`, and React throws
  // "Rendered more hooks than during the previous render" the moment a rail goes from
  // empty to populated — which is exactly what happens once a query resolves.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

    // Calculate active index for dots
    const cardWidth = 280 + 24; // card width + gap
    const newIndex = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(newIndex, (products?.length ?? 1) - 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [products?.length]);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 280 + 24;
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 280 + 24;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  if (!products?.length) return null;

  return (
    <section className="relative py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 px-1">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#5D5550]/60 font-bold block mb-2">
            Colección
          </span>
          <h2 className="text-2xl md:text-3xl font-serif italic text-[#2A2624]">
            {title}
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scrollBy('left')}
            disabled={!canScrollLeft}
            aria-label="Anterior"
            className={`
              h-11 w-11 rounded-full flex items-center justify-center
              border border-[#2A2624]/10 bg-white/80 backdrop-blur-sm
              transition-all duration-300
              ${canScrollLeft
                ? 'hover:bg-[#2A2624] hover:text-white hover:border-[#2A2624] hover:scale-105 cursor-pointer'
                : 'opacity-30 cursor-not-allowed'}
            `}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollBy('right')}
            disabled={!canScrollRight}
            aria-label="Siguiente"
            className={`
              h-11 w-11 rounded-full flex items-center justify-center
              border border-[#2A2624]/10 bg-white/80 backdrop-blur-sm
              transition-all duration-300
              ${canScrollRight
                ? 'hover:bg-[#2A2624] hover:text-white hover:border-[#2A2624] hover:scale-105 cursor-pointer'
                : 'opacity-30 cursor-not-allowed'}
            `}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Gradient Fades */}
        <div className={`hidden md:block absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F9F9F8] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`hidden md:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F9F9F8] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

        {/* Scrollable Area */}
        <div
          ref={scrollRef}
          className="
            flex gap-6 overflow-x-auto scroll-smooth
            snap-x snap-mandatory
            pb-4 -mb-4
            scrollbar-hide
            px-1
          "
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {products.map((product, index) => (
            <ProductRailCard key={product.slug} product={product} index={index} />
          ))}

          {/* View All Card */}
          <Link
            to="/shop"
            className="
              flex-shrink-0 w-[280px] snap-start
              flex items-center justify-center
              rounded-[1.5rem] border-2 border-dashed border-[#2A2624]/20
              bg-gradient-to-br from-white/50 to-[#F2F0ED]/50
              hover:border-[#2A2624]/40 hover:bg-white
              transition-all duration-300
              group/viewall
            "
          >
            <div className="text-center p-8">
              <div className="w-14 h-14 rounded-full bg-[#2A2624]/5 flex items-center justify-center mx-auto mb-4 group-hover/viewall:bg-[#2A2624]/10 transition-colors">
                <ChevronRight className="h-6 w-6 text-[#2A2624]/60" />
              </div>
              <span className="text-sm font-serif italic text-[#2A2624]">Ver toda la colección</span>
              <span className="block text-[10px] uppercase tracking-[0.15em] text-[#5D5550]/60 mt-2">
                {products.length}+ productos
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Pagination Dots */}
      <div className="flex md:hidden items-center justify-center gap-1.5 mt-6">
        {products.slice(0, Math.min(products.length, 8)).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            aria-label={`Ir al producto ${index + 1}`}
            className={`
              h-1.5 rounded-full transition-all duration-300
              ${activeIndex === index
                ? 'w-6 bg-[#2A2624]'
                : 'w-1.5 bg-[#2A2624]/20 hover:bg-[#2A2624]/40'}
            `}
          />
        ))}
        {products.length > 8 && (
          <span className="text-[10px] text-[#5D5550]/60 ml-2">+{products.length - 8}</span>
        )}
      </div>
    </section>
  );
};

// Individual Product Card for Rail
const ProductRailCard: React.FC<{ product: Product; index: number }> = ({ product, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={`/product/${product.slug}`}
      className="
        flex-shrink-0 w-[280px] snap-start
        group relative
        bg-white rounded-[1.5rem]
        shadow-[0_2px_20px_-8px_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]
        transition-all duration-500
        hover:-translate-y-1
      "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[1.5rem] bg-[#F2F0ED]">
        <img
          src={product.image}
          alt={`${product.name} - ${product.category === 'Reformers' ? 'cama de pilates reformer' : (product.category?.toLowerCase() || 'equipo de pilates')} Edelweiss Mexico`}
          loading="lazy"
          decoding="async"
          className={`
            h-full w-full object-cover
            transition-transform duration-700 ease-out
            ${isHovered ? 'scale-110' : 'scale-100'}
          `}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 rounded-full bg-[#2A2624] text-white text-[9px] uppercase tracking-[0.1em] font-bold shadow-lg">
              Nuevo
            </span>
          )}
          {product.bestSeller && !product.isNew && (
            <span className="px-3 py-1 rounded-full bg-[#7A8A6F] text-white text-[9px] uppercase tracking-[0.1em] font-bold shadow-lg">
              Popular
            </span>
          )}
        </div>

        {/* Quick View Overlay */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent
          flex items-end justify-center pb-4
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <span className="
            px-5 py-2 rounded-full
            bg-white/95 backdrop-blur-sm
            text-[10px] uppercase tracking-[0.15em] font-bold text-[#2A2624]
            transform transition-transform duration-300
            ${isHovered ? 'translate-y-0' : 'translate-y-4'}
          ">
            Ver detalles
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#5D5550]/60 font-bold">
          {product.category}
        </span>

        {/* Name & Price */}
        <div className="flex items-start justify-between gap-3 mt-2">
          <h3 className="font-serif italic text-base text-[#2A2624] leading-tight group-hover:text-[#EB4C42] transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="text-right flex-shrink-0">
            <span className="text-sm font-bold text-[#2A2624] font-sans whitespace-nowrap">
              ${Number(product.price).toLocaleString('es-MX')}
            </span>
            <span className="block text-[9px] text-[#5D5550]/60 uppercase">MXN</span>
          </div>
        </div>

        {/* Subtle divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#2A2624]/10 to-transparent my-3" />

        {/* Materials Preview */}
        {product.materials && product.materials.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-[#5D5550]/70">
            <span className="w-1 h-1 rounded-full bg-[#7A8A6F]" />
            <span className="truncate">{product.materials.slice(0, 2).join(' · ')}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductRail21;
