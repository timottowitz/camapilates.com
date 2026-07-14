import React, { useState, useMemo, useEffect } from 'react';
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
import { beginCheckout, viewItem } from '@/lib/shop/analytics';
import { productWhatsAppUrl } from '@/lib/shop/whatsapp';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import TrustStrip from '@/components/ui/trust-strip';
import { EnhancedGallery } from '@/components/commerce21/EnhancedGallery';
import { StickyMobileCTA } from '@/components/commerce21/StickyMobileCTA';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { useConvexAssets } from '@/lib/convexAssets';
import BackLink from '@/components/ui/back-link';
import { motion } from 'framer-motion';

type Product = (typeof products)[number] & PType;

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const origin = getOrigin();
  const prod: Product | undefined = products.find(p => p.slug === slug);
  const assets = useConvexAssets();

  const safeProd = (prod || (products[0] as Product)) as Product;

  const initialRegion = ((): 'MX' | 'US' | 'DE' => {
    if (typeof window === 'undefined') return 'MX';
    const v = window.localStorage?.getItem('regionPref');
    return (v === 'US' || v === 'DE' || v === 'MX') ? v : 'MX';
  })();
  const [region, setRegion] = useState<'MX' | 'US' | 'DE'>(initialRegion);
  const [finish, setFinish] = useState<FinishKey>('walnut');
  const [agg, setAgg] = useState<{ ratingValue: string; reviewCount: number } | undefined>(undefined);

  const estimate = useMemo(() => {
    if (region === 'MX') return safeProd.deliveryTime || '3 semanas';
    if (region === 'US') return '4–5 semanas (estimado)';
    return '4–6 semanas (estimado)';
  }, [region, safeProd]);

  const onChangeRegion = (value: 'MX' | 'US' | 'DE') => {
    setRegion(value);
    try { if (typeof window !== 'undefined') window.localStorage.setItem('regionPref', value); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!prod) return;
    viewItem(prod as PType);
  }, [prod]);

  const url = `${origin}/product/${safeProd.slug}`;

  const materials = safeProd.materials?.length
    ? safeProd.materials
    : finish === 'mycelium'
      ? ['cuero de micelio (sostenible)', 'madera de nogal', 'acero estructural']
      : ['cuero genuino', 'madera de nogal', 'acero estructural'];

  const SPECS = {
    dimensions: '~245 × 70 × 40 cm',
    weight: '~70–95 kg (según acabado)',
    carriage: 'Recorrido suave y silencioso',
    warranty: safeProd.warranty || '1 año',
  };

  const activeVariant = useMemo(() => {
    return (safeProd.variants || []).find(v => v.finish === finish);
  }, [finish, safeProd]);
  const priceToShow = activeVariant?.price || safeProd.price;
  const displaySku = activeVariant?.sku || safeProd.sku;
  const buyWhatsAppUrl = productWhatsAppUrl(safeProd, priceToShow, displaySku);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: safeProd.name,
    description: safeProd.description,
    brand: { '@type': 'Brand', name: safeProd.brand },
    sku: displaySku,
    image: [
      ...(activeVariant?.image ? [activeVariant.image] : []),
      origin + safeProd.image,
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
      priceCurrency: safeProd.currency,
      price: priceToShow,
      availability: safeProd.availability,
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: safeProd.deliveryTime
              ? { '@type': 'QuantitativeValue', minValue: 42, maxValue: 56, unitCode: 'DAY' }
              : { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: safeProd.deliveryTime ? 0 : 19, maxValue: safeProd.deliveryTime ? 7 : 21, unitCode: 'DAY' }
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
  } as Record<string, unknown>;
  if (agg) productSchema.aggregateRating = { '@type': 'AggregateRating', ...agg };
  productSchema.additionalProperty = [
    { '@type': 'PropertyValue', name: 'finish', value: finish },
    ...(finish === 'mycelium' ? [{ '@type': 'PropertyValue', name: 'sustainable', value: 'true' }] : [])
    ,
    { '@type': 'PropertyValue', name: 'dimensions', value: SPECS.dimensions },
    { '@type': 'PropertyValue', name: 'weight', value: SPECS.weight },
    { '@type': 'PropertyValue', name: 'warranty', value: SPECS.warranty },
    ...(activeVariant?.sku ? [{ '@type': 'PropertyValue', name: 'variant_sku', value: activeVariant.sku }] : []),
    ...((finish === 'mycelium' || (safeProd.finishes || []).includes('mycelium')) ? [{ '@type': 'PropertyValue', name: 'material_brand', value: 'Mylo (micelio)' }] : []),
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuánto tarda la entrega?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: safeProd.deliveryTime
            ? `Este equipo se fabrica bajo pedido: el tiempo de producción y entrega es de 6 a 8 semanas a cualquier parte de México.`
            : 'En México la entrega estimada es de 3 semanas. Envíos a EE. UU. y Europa entre 4–6 semanas.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué garantía incluye?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Garantía de ${safeProd.warranty || '1 año'} que cubre defectos de fabricación en estructura, muelles y accesorios básicos. Incluye repuestos exprés y soporte en español.`
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

  const galleryImages = useMemo(() => {
    if (!prod) return [];
    
    if (prod.slug === 'reformer-casa') {
      return [
        {
          src: '/images/reformer-home-wide.webp',
          alt: `${prod.name} — Vista panorámica en estudio`,
          type: 'main' as const,
          label: 'Vista Principal (Estudio)'
        },
        {
          src: '/images/reformer-home-medium.webp',
          alt: `${prod.name} — Vista media de la cama y muelles`,
          type: 'lifestyle' as const,
          label: 'Vista Media'
        },
        {
          src: '/images/reformer-home-detail.webp',
          alt: `${prod.name} — Detalle de ensamble en madera nogal`,
          type: 'detail' as const,
          label: 'Detalle de Madera'
        }
      ];
    }
    
    if (prod.slug === 'reformer-profesional') {
      return [
        {
          src: '/images/reformer-pro-wide.webp',
          alt: `${prod.name} — Reformer profesional de estudio`,
          type: 'main' as const,
          label: 'Vista Principal (Estudio)'
        },
        {
          src: '/images/reformer-pro-medium.webp',
          alt: `${prod.name} — Vista media de la estructura y barandilla`,
          type: 'lifestyle' as const,
          label: 'Vista Media'
        },
        {
          src: '/images/reformer-pro-detail.webp',
          alt: `${prod.name} — Detalle del sistema de muelles de precisión`,
          type: 'detail' as const,
          label: 'Mecánica de Precisión'
        }
      ];
    }

    if (prod.slug === 'reformer-mycelium') {
      return [
        {
          src: '/images/reformer-mycelium-wide.webp',
          alt: `${prod.name} — Cama de Pilates ecológica con cuero Mylo`,
          type: 'main' as const,
          label: 'Vista Principal'
        },
        {
          src: '/images/reformer-mycelium-detail.webp',
          alt: `${prod.name} — Close-up del material de micelio biodegradable`,
          type: 'detail' as const,
          label: 'Textura Micelio (Mylo)'
        }
      ];
    }

    // Default fallback list of images
    const list = [];
    const mainImg = activeVariant?.image || prod.image;
    if (mainImg) {
      list.push({
        src: mainImg,
        alt: `${prod.name} — ${FINISHES[finish]?.name || ''}`,
        type: 'main' as const,
        label: 'Vista Principal'
      });
    }
    if (prod.hoverImage && prod.hoverImage !== mainImg) {
      list.push({
        src: prod.hoverImage,
        alt: `${prod.name} — Alternativa`,
        type: 'lifestyle' as const,
        label: 'En contexto'
      });
    }
    return list;
  }, [prod, activeVariant?.image, finish]);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tienda', item: `${origin}/shop` },
      ...(safeProd.category ? [{ '@type': 'ListItem', position: 2, name: safeProd.category, item: `${origin}/shop/category/${toCategorySlug(safeProd.category || '')}` }] : []),
      { '@type': 'ListItem', position: safeProd.category ? 3 : 2, name: safeProd.name, item: url },
    ]
  };

  if (!prod) return <Navigate to="/products" replace />;

  return (
    <LuxuryLayout headerTheme="light">
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

      {/* Main Content */}
      <div className="relative container mx-auto px-8 md:px-24 py-12 min-h-screen">
        {/* Subtle Background Mesh */}
        <div className="absolute top-[20%] right-0 -z-10 h-[500px] w-[500px] opacity-20 blur-3xl pointer-events-none">
          <div className="h-full w-full bg-gradient-to-l from-[#e0dcd9] to-transparent rounded-full" />
        </div>

        <BackLink className="mb-6 hidden md:inline-flex" fallbackTo="/shop" label="Volver" />

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left Column: Gallery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <EnhancedGallery
              images={galleryImages}
              showLabels={true}
            />
            <div className="mt-8 hidden md:block">
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
          </motion.div>

          {/* Right Column: Info */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-8 md:sticky md:top-32"
          >
            {/* Region selector */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#5D5550]">
              <label htmlFor="region" className="mr-2">Región:</label>
              <select id="region" className="bg-transparent border-none focus:ring-0 p-0 text-[#2A2624] font-medium cursor-pointer" value={region} onChange={(e) => onChangeRegion(e.target.value as 'MX' | 'US' | 'DE')}>
                <option value="MX">México</option>
                <option value="US">USA</option>
                <option value="DE">Europe</option>
              </select>
              <span className="ml-3 opacity-50 border-l border-[#2A2624]/20 pl-3">Entrega: {estimate}</span>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <h1 className="text-5xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9] mb-4 tracking-tight">
                {prod.name}
              </h1>
              <div className="flex items-center gap-3">
                {(prod.isNew || prod.bestSeller) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2A2624] text-[#EAE8E4] text-[10px] uppercase tracking-[0.2em]">
                    {prod.isNew ? 'New Arrival' : 'Best Seller'}
                  </span>
                )}
                {(/mycel/i.test(prod.name) || (prod.finishes || []).includes('mycelium')) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#3E2723] text-[#EAE8E4] text-[10px] uppercase tracking-[0.2em]">Mylo™</span>
                )}
              </div>
            </motion.div>

            <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-lg text-[#5D5550] font-light leading-relaxed max-w-md">
              El último Reformer que necesitarás. Desarrolla tu gracia con materiales nobles—solo lo mejor toca tu piel.
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="border-l-2 border-[#2A2624] pl-5 py-1">
              <p className="text-sm text-[#5D5550] italic leading-relaxed">{prod.description}</p>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex items-baseline gap-4 border-b border-[#2A2624]/10 pb-8">
              <div className="text-4xl font-serif italic text-[#2A2624]">$ {priceToShow} <span className="text-sm font-sans not-italic text-[#5D5550] tracking-normal">{prod.currency}</span></div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#3E2723] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723] animate-pulse" /> En stock
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-8">
              {(prod.finishes?.length ?? 0) > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium uppercase tracking-widest text-[#2A2624]">Acabado</span>
                    <Link to="/acabados" className="text-[10px] uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] underline decoration-[#2A2624]/30 hover:decoration-[#2A2624] underline-offset-4">Ver guía</Link>
                  </div>
                  <Finishes value={finish} onChange={setFinish} />
                </div>
              )}

              <div className="flex flex-col gap-4 pt-2">
                <a
                  href={buyWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => beginCheckout({ product: prod as PType })}
                  className="w-full flex items-center justify-center gap-2 bg-[#2A2624] text-[#EAE8E4] rounded-full py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#3E2723] hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-[#2A2624]/10"
                >
                  <MessageCircle className="h-4 w-4" /> Comprar por WhatsApp
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a href={buyWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 border border-[#2A2624]/20 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors">
                    WhatsApp
                  </a>
                  <a href="tel:+525548468190" className="flex items-center justify-center gap-2 px-4 py-3 border border-[#2A2624]/20 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors">
                    Llamar
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 gap-x-8 gap-y-8 pt-8 border-t border-[#2A2624]/10">
              <div>
                <h3 className="font-serif italic text-xl text-[#2A2624] mb-3">Materiales</h3>
                <ul className="text-sm text-[#5D5550] space-y-2 font-light">
                  <li>Cuero Genuino</li>
                  <li>Nogal Americano</li>
                  <li>Acero Estructural</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif italic text-xl text-[#2A2624] mb-3">Especificaciones</h3>
                <ul className="text-sm text-[#5D5550] space-y-2 font-light">
                  <li>{SPECS.dimensions}</li>
                  <li>{SPECS.weight}</li>
                  <li>{SPECS.warranty}</li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="pt-4">
              <ReviewsPreview productSlug={prod.slug} onAggregate={(avg, count) => setAgg({ ratingValue: avg.toFixed(1), reviewCount: count })} />
            </motion.div>

            {/* Cross-sell: Find a Studio */}
            {Number(priceToShow) >= 10000 && (
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="p-6 bg-[#F5F4F0] rounded-sm border border-[#2A2624]/5">
                <p className="text-sm text-[#2A2624] font-medium mb-1">¿Nuevo en Pilates?</p>
                <p className="text-xs text-[#5D5550] mb-3 font-light">Prueba primero en un estudio cerca de ti antes de invertir.</p>
                <Link
                  to="/estudios-de-pilates"
                  className="text-[10px] uppercase tracking-[0.2em] text-[#3E2723] hover:text-[#2A2624] border-b border-[#3E2723] pb-0.5"
                >
                  Buscar estudios en México →
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* FAQ & Related */}
        <div className="mt-32 grid md:grid-cols-3 gap-16 border-t border-[#2A2624]/10 pt-16">
          <div className="md:col-span-2 space-y-12">
            <h2 className="text-4xl font-serif italic text-[#2A2624]">Common Questions</h2>
            <div className="space-y-6">
              {[
                { q: '¿Cuánto tarda la entrega?', a: 'En México la entrega estimada es de 3 semanas. Envíos a EE. UU. y Europa entre 4–6 semanas.' },
                { q: '¿Qué garantía incluye?', a: 'Garantía de 1 año que cubre defectos de fabricación en estructura, muelles y accesorios básicos.' },
                { q: '¿Qué materiales y acabados tiene?', a: 'Cuero genuino o de micelio (opción sostenible), madera de nogal y acero estructural.' }
              ].map((faq, i) => (
                <details key={i} className="group bg-transparent border-b border-[#2A2624]/10 pb-6">
                  <summary className="font-serif italic text-xl text-[#2A2624] cursor-pointer hover:text-[#3E2723] transition-colors list-none flex justify-between items-center">
                    {faq.q}
                    <span className="text-[#3E2723] group-open:rotate-45 transition-transform text-2xl font-light">+</span>
                  </summary>
                  <div className="mt-4 text-[#5D5550] font-light leading-relaxed text-lg">
                    <p>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-serif italic text-[#2A2624] mb-10">Related</h2>
            <div className="space-y-10">
              {products.filter(p => p.slug !== prod.slug && p.category === prod.category).slice(0, 2).map((p) => (
                <Link key={p.slug} to={`/product/${p.slug}`} className="block group">
                  <div className="aspect-[4/3] overflow-hidden rounded-sm bg-[#EAE8E4] mb-4 relative">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>
                  <div className="flex justify-between items-baseline">
                    <div className="font-serif italic text-xl text-[#2A2624] group-hover:text-[#3E2723] transition-colors">{p.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[#5D5550]">$ {p.price} {p.currency}</div>
                  </div>
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
        whatsappUrl={buyWhatsAppUrl}
        onBuy={() => beginCheckout({ product: prod as PType })}
        warranty={prod.warranty}
        productSlug={prod.slug}
      />
    </LuxuryLayout >
  );
};

export default ProductPage;
