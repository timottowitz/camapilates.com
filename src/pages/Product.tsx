import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CreditCard, MessageCircle, Package, ShieldCheck, Info } from 'lucide-react';
import { ReviewsPreview } from '@/components/ui/reviews-preview';
import { Finishes, FINISHES, type FinishKey } from '@/components/product/Finishes';
import { Helmet } from 'react-helmet-async';
import { getOrigin, DEFAULTS } from '@/lib/seo';
import { useParams, Navigate, Link } from 'react-router-dom';
import products from '@/content/products.json';
import { ContextualImage } from '@/components/ContextualImage';
import type { FinishKey, Product as PType } from '@/lib/shop/types';
import { toCategorySlug } from '@/lib/shop/catalog';
import ShoprocketBuyButton from '@/components/commerce21/ShoprocketBuyButton';
import { beginCheckout, viewItem } from '@/lib/shop/analytics';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import TrustStrip from '@/components/ui/trust-strip';
import { EnhancedGallery } from '@/components/commerce21/EnhancedGallery';
import { FinancingDisplay } from '@/components/commerce21/FinancingDisplay';
import { StickyMobileCTA } from '@/components/commerce21/StickyMobileCTA';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

type Product = (typeof products)[number] & PType;

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const origin = getOrigin();
  const prod: Product | undefined = products.find(p => p.slug === slug);

  const initialRegion = ((): 'MX' | 'US' | 'DE' => {
    if (typeof window === 'undefined') return 'MX';
    const v = window.localStorage?.getItem('regionPref');
    return (v === 'US' || v === 'DE' || v === 'MX') ? v : 'MX';
  })();
  const [region, setRegion] = useState<'MX' | 'US' | 'DE'>(initialRegion);
  const [finish, setFinish] = useState<FinishKey>('walnut');
  const [agg, setAgg] = useState<{ ratingValue: string; reviewCount: number } | undefined>(undefined);

  const estimate = useMemo(() => {
    if (region === 'MX') return '3 semanas';
    if (region === 'US') return '4–5 semanas (estimado)';
    return '4–6 semanas (estimado)';
  }, [region]);

  const onChangeRegion = (value: 'MX' | 'US' | 'DE') => {
    setRegion(value);
    try { if (typeof window !== 'undefined') window.localStorage.setItem('regionPref', value); } catch { /* ignore */ }
  };

  if (!prod) return <Navigate to="/compare" replace />;

  const url = `${origin}/product/${prod.slug}`;

  useEffect(() => {
    viewItem(prod as any);
  }, [prod?.slug]);

  const materials = finish === 'mycelium'
    ? ['cuero de micelio (sostenible)', 'madera de nogal', 'acero estructural']
    : ['cuero genuino', 'madera de nogal', 'acero estructural'];

  const SPECS = {
    dimensions: '~245 × 70 × 40 cm',
    weight: '~70–95 kg (según acabado)',
    carriage: 'Recorrido suave y silencioso',
    warranty: '1 año',
  } as const;

  const activeVariant = useMemo(() => {
    return (prod.variants || []).find(v => v.finish === finish);
  }, [finish, prod?.slug]);
  const priceToShow = activeVariant?.price || prod.price;
  const displaySku = activeVariant?.sku || prod.sku;

  const productSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prod.name,
    description: prod.description,
    brand: { '@type': 'Brand', name: prod.brand },
    sku: displaySku,
    image: [
      ...(activeVariant?.image ? [activeVariant.image] : []),
      origin + prod.image,
      '/images/finish-walnut.jpg',
      '/images/finish-white.jpg',
      '/images/finish-black.jpg',
      '/images/finish-mycelium.webp'
    ],
    material: materials,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: prod.currency,
      price: priceToShow,
      availability: prod.availability,
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 19, maxValue: 21, unitCode: 'DAY' }
          }
        },
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 26, maxValue: 35, unitCode: 'DAY' }
          }
        },
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 26, maxValue: 42, unitCode: 'DAY' }
          }
        }
      ]
    }
  };
  if (agg) productSchema.aggregateRating = { '@type': 'AggregateRating', ...agg };
  productSchema.additionalProperty = [
    { '@type': 'PropertyValue', name: 'finish', value: finish },
    ...(finish === 'mycelium' ? [{ '@type': 'PropertyValue', name: 'sustainable', value: 'true' }] : [])
    ,
    { '@type': 'PropertyValue', name: 'dimensions', value: SPECS.dimensions },
    { '@type': 'PropertyValue', name: 'weight', value: SPECS.weight },
    { '@type': 'PropertyValue', name: 'warranty', value: SPECS.warranty },
    ...(activeVariant?.sku ? [{ '@type': 'PropertyValue', name: 'variant_sku', value: activeVariant.sku }] : []),
    ...((finish === 'mycelium' || (prod.finishes || []).includes('mycelium')) ? [{ '@type': 'PropertyValue', name: 'material_brand', value: 'Mylo (micelio)' }] : []),
  ];

  const openBuyModal = useCallback(() => {
    const root = document.getElementById('sr-buy-pdp');
    if (!root) return;
    const candidates = Array.from(root.querySelectorAll('button, a')) as HTMLElement[];
    const match = candidates.find((el) => /ver|view|producto|product|comprar|add to cart|agregar/i.test(el.textContent || ''));
    if (match) (match as HTMLButtonElement).click();
    else root.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuánto tarda la entrega?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'En México la entrega estimada es de 3 semanas. Envíos a EE. UU. y Europa entre 4–6 semanas.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué garantía incluye?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Garantía de 1 año que cubre defectos de fabricación en estructura, muelles y accesorios básicos. Incluye repuestos exprés y soporte en español.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué materiales y acabados tiene?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cuero genuino o de micelio (opción sostenible), madera de nogal y acero estructural con tolerancias precisas para un recorrido silencioso.'
        }
      }
    ]
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tienda', item: `${origin}/shop` },
      ...(prod.category ? [{ '@type': 'ListItem', position: 2, name: prod.category, item: `${origin}/shop/category/${toCategorySlug(prod.category || '')}` }] : []),
      { '@type': 'ListItem', position: prod.category ? 3 : 2, name: prod.name, item: url },
    ]
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{prod.name} | {DEFAULTS.siteName}</title>
        <meta name="description" content={prod.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={prod.name} />
        <meta property="og:description" content={prod.description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${origin}${prod.image}`} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      <div className="container mx-auto px-8 md:px-24 py-12">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <EnhancedGallery
              images={[
                {
                  src: activeVariant?.image || prod.image,
                  alt: `${prod.name} — ${FINISHES[finish]?.name || ''}`,
                  type: 'main',
                  label: 'Vista principal'
                },
                {
                  src: FINISHES[finish]?.img || prod.image,
                  alt: `Acabado ${FINISHES[finish]?.name || ''}`,
                  type: 'detail',
                  label: `Acabado ${FINISHES[finish]?.name || ''}`
                },
                {
                  src: prod.image,
                  alt: prod.name,
                  type: 'lifestyle',
                  label: 'En contexto'
                }
              ].filter(Boolean)}
              showLabels={true}
            />
            <div className="mt-8">
              <ContextualImage
                placeholderId={`product-${prod.slug}-hero-1`}
                pageType="shop"
                pageSlug={prod.slug}
                location="hero"
                aspectRatio="1:1"
                alt={prod.name}
                fallbackSrc={activeVariant?.image || prod.image}
              />
            </div>
          </div>

          <div className="space-y-8">
            {/* Region selector */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550]">
              <label htmlFor="region" className="mr-2">Región:</label>
              <select id="region" className="bg-transparent border-none focus:ring-0 p-0 text-[#2A2624] font-medium cursor-pointer" value={region} onChange={(e) => onChangeRegion(e.target.value as any)}>
                <option value="MX">México</option>
                <option value="US">USA</option>
                <option value="DE">Europe</option>
              </select>
              <span className="ml-3 opacity-50">| Entrega: {estimate}</span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] leading-tight mb-2">
                {prod.name}
              </h1>
              <div className="flex items-center gap-3">
                {(prod.isNew || prod.bestSeller) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#2A2624] text-[#EAE8E4] text-[10px] uppercase tracking-widest">
                    {prod.isNew ? 'New Arrival' : 'Best Seller'}
                  </span>
                )}
                {(/mycel/i.test(prod.name) || (prod.finishes || []).includes('mycelium')) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#3E2723] text-[#EAE8E4] text-[10px] uppercase tracking-widest">Mylo™</span>
                )}
              </div>
            </div>

            <p className="text-lg text-[#5D5550] font-light leading-relaxed">
              El último Reformer que necesitarás. Desarrolla tu gracia con materiales nobles—solo lo mejor toca tu piel.
            </p>

            <div className="border-l-2 border-[#3E2723]/20 pl-4 py-2">
              <p className="text-sm text-[#5D5550] italic">{prod.description}</p>
            </div>

            <div className="flex items-baseline gap-4 border-b border-[#2A2624]/10 pb-8">
              <div className="text-3xl font-serif italic text-[#2A2624]">$ {priceToShow} <span className="text-sm font-sans not-italic text-[#5D5550]">{prod.currency}</span></div>
              <div className="text-xs uppercase tracking-widest text-[#3E2723]">En stock</div>
            </div>

            <div className="space-y-6">
              <FinancingDisplay
                price={Number(priceToShow)}
                currency={prod.currency}
                variant="prominent"
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#2A2624]">Acabado</span>
                  <Link to="/acabados" className="text-xs text-[#3E2723] underline decoration-[#3E2723]/30 hover:decoration-[#3E2723]">Ver guía de acabados</Link>
                </div>
                <Finishes value={finish} onChange={setFinish} />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <ShoprocketBuyButton
                  rootId="sr-buy-pdp"
                  productId={prod.productId}
                  publishableKey={prod.publishableKey}
                  onBeforeOpen={() => beginCheckout({ product: prod as any })}
                  className="w-full !bg-[#2A2624] !text-[#EAE8E4] !rounded-full !py-4 !uppercase !tracking-[0.2em] !text-xs hover:!bg-[#3E2723] transition-colors"
                />

                <div className="grid grid-cols-2 gap-3">
                  <a href="https://wa.me/523222787690" className="flex items-center justify-center gap-2 px-4 py-3 border border-[#2A2624]/10 rounded-full text-xs uppercase tracking-widest text-[#2A2624] hover:bg-[#EAE8E4] transition-colors">
                    WhatsApp
                  </a>
                  <a href="tel:+523222787690" className="flex items-center justify-center gap-2 px-4 py-3 border border-[#2A2624]/10 rounded-full text-xs uppercase tracking-widest text-[#2A2624] hover:bg-[#EAE8E4] transition-colors">
                    Llamar
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 border-t border-[#2A2624]/10">
              <div>
                <h3 className="font-serif italic text-lg text-[#2A2624] mb-2">Materiales</h3>
                <ul className="text-sm text-[#5D5550] space-y-1">
                  <li>Cuero Genuino</li>
                  <li>Nogal Americano</li>
                  <li>Acero Estructural</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-[#2A2624] mb-2">Especificaciones</h3>
                <ul className="text-sm text-[#5D5550] space-y-1">
                  <li>{SPECS.dimensions}</li>
                  <li>{SPECS.weight}</li>
                  <li>{SPECS.warranty}</li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <ReviewsPreview productSlug={prod.slug} onAggregate={(avg, count) => setAgg({ ratingValue: avg.toFixed(1), reviewCount: count })} />
            </div>

            {/* Cross-sell: Find a Studio (for expensive items) */}
            {Number(priceToShow) >= 10000 && (
              <div className="p-6 bg-[#E3E0DB] rounded-sm">
                <p className="text-sm text-[#2A2624] font-medium mb-1">¿Nuevo en Pilates?</p>
                <p className="text-xs text-[#5D5550] mb-3">Prueba primero en un estudio cerca de ti antes de invertir.</p>
                <Link 
                  to="/estudios-de-pilates" 
                  className="text-xs uppercase tracking-widest text-[#3E2723] hover:underline"
                >
                  Buscar estudios en México →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-24 grid md:grid-cols-3 gap-12 border-t border-[#2A2624]/10 pt-12">
          <div className="md:col-span-2 space-y-8">
            <h2 className="text-3xl font-serif italic text-[#2A2624]">Common Questions</h2>
            <div className="space-y-4">
              {[
                { q: '¿Cuánto tarda la entrega?', a: 'En México la entrega estimada es de 3 semanas. Envíos a EE. UU. y Europa entre 4–6 semanas.' },
                { q: '¿Qué garantía incluye?', a: 'Garantía de 1 año que cubre defectos de fabricación en estructura, muelles y accesorios básicos.' },
                { q: '¿Qué materiales y acabados tiene?', a: 'Cuero genuino o de micelio (opción sostenible), madera de nogal y acero estructural.' }
              ].map((faq, i) => (
                <details key={i} className="group bg-transparent border-b border-[#2A2624]/10 pb-4">
                  <summary className="font-sans text-lg text-[#2A2624] cursor-pointer hover:text-[#3E2723] transition-colors list-none flex justify-between items-center">
                    {faq.q}
                    <span className="text-[#3E2723] group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="mt-4 text-[#5D5550] font-light leading-relaxed">
                    <p>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-8">Related</h2>
            <div className="space-y-6">
              {products.filter(p => p.slug !== prod.slug && p.category === prod.category).slice(0, 2).map((p) => (
                <Link key={p.slug} to={`/product/${p.slug}`} className="block group">
                  <div className="aspect-[4/3] overflow-hidden rounded-sm bg-[#EAE8E4] mb-3">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="font-serif italic text-lg text-[#2A2624] group-hover:text-[#3E2723]">{p.name}</div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">$ {p.price} {p.currency}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StickyMobileCTA
        productName={prod.name}
        price={Number(priceToShow)}
        currency={prod.currency}
        onAddToCart={() => {
          beginCheckout({ product: prod as any });
          openBuyModal();
        }}
        productSlug={prod.slug}
      />
    </LuxuryLayout>
  );
};

export default ProductPage;
