import React, { useState, useMemo, useEffect } from 'react';
import { MessageCircle, ShieldCheck, CheckCircle2, Package, Phone, FileText } from 'lucide-react';
import { ReviewsPreview } from '@/components/ui/reviews-preview';
import { Finishes, FINISHES } from '@/components/product/Finishes';
import { Helmet } from 'react-helmet-async';
import { getOrigin, DEFAULTS } from '@/lib/seo';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ContextualImage } from '@/components/ContextualImage';
import type { FinishKey, Product } from '@/lib/shop/types';
import { allProducts, getBySlug, toCategorySlug } from '@/lib/shop/catalog';
import { beginCheckout, viewItem } from '@/lib/shop/analytics';
import { productWhatsAppUrl } from '@/lib/shop/whatsapp';
import { EnhancedGallery } from '@/components/commerce21/EnhancedGallery';
import { StickyMobileCTA } from '@/components/commerce21/StickyMobileCTA';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import BackLink from '@/components/ui/back-link';
import { motion } from 'framer-motion';
import { isReformerBed, calculateBundlePrice, type BundleQuantity } from '@/lib/shop/bundles';
import { BundleSelector } from '@/components/shop/BundleSelector';
import productInternalLinks from '@/content/product-internal-links.json';
import shopPolicy from '@/content/shop-policy.json';

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const origin = getOrigin();
  const prod: Product | undefined = getBySlug(slug ?? '');

  const safeProd = prod ?? allProducts()[0];

  const [finish, setFinish] = useState<FinishKey>('walnut');
  const [agg, setAgg] = useState<{ ratingValue: string; reviewCount: number } | undefined>(undefined);
  const [selectedQuantity, setSelectedQuantity] = useState<BundleQuantity>(1);

  const isReformer = useMemo(() => isReformerBed(safeProd), [safeProd]);

  // React Router keeps this component mounted when only the slug changes, so without
  // this a pack chosen on one machine follows you to the next one: the new product
  // opens showing a multi-unit total nobody asked for instead of its unit price.
  useEffect(() => {
    setSelectedQuantity(1);
    setFinish('walnut');
  }, [slug]);

  useEffect(() => {
    if (!prod) return;
    viewItem(prod);
  }, [prod]);

  const url = `${origin}/product/${safeProd.slug}`;

  const materials = safeProd.materials?.length ? safeProd.materials : undefined;

  const specs = safeProd.specs;
  const specRows: [string, string][] = [
    ...(specs
      ? ([
          ['Modelo', specs.modelo],
          ['Estructura', specs.estructura],
          ...(specs.torre ? [['Torre', specs.torre]] : []),
          ['Resortes', specs.resortes],
          ['Tapicería', specs.tapiceria],
          ['Medidas (largo × ancho × alto)', specs.medidas],
          ...(specs.medidasPlegado ? [['Medidas plegado', specs.medidasPlegado]] : []),
          ['Peso', specs.peso],
        ] as [string, string][])
      : []),
    ...(safeProd.warranty ? ([['Garantía', safeProd.warranty]] as [string, string][]) : []),
  ];

  const activeVariant = useMemo(() => {
    return (safeProd.variants || []).find(v => v.finish === finish);
  }, [finish, safeProd]);
  const basePriceToShow = activeVariant?.price || safeProd.price;
  const displaySku = activeVariant?.sku || safeProd.sku;

  const bundleCalc = useMemo(() => {
    return calculateBundlePrice(basePriceToShow, isReformer ? selectedQuantity : 1);
  }, [basePriceToShow, isReformer, selectedQuantity]);

  const priceToShow = bundleCalc.quantity > 1 ? bundleCalc.discountedTotalPrice.toString() : basePriceToShow;
  const buyWhatsAppUrl = productWhatsAppUrl(safeProd, basePriceToShow, displaySku, isReformer ? bundleCalc : undefined);

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
      ...(safeProd.galleryImages ?? []).map((src) => origin + src)
    ],
    material: materials,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: safeProd.currency,
      price: priceToShow,
      priceValidUntil: '2026-12-31',
      availability: shopPolicy.availability,
      itemCondition: 'https://schema.org/NewCondition',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'MX',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      shippingDetails: ['MX', 'US', 'DE'].map((addressCountry) => ({
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry },
        deliveryTime: shopPolicy.shippingDeliveryTime
      }))
    }
  } as Record<string, unknown>;
  if (agg) productSchema.aggregateRating = { '@type': 'AggregateRating', ...agg };
  productSchema.additionalProperty = [
    { '@type': 'PropertyValue', name: 'finish', value: finish },
    ...(finish === 'mycelium' ? [{ '@type': 'PropertyValue', name: 'sustainable', value: 'true' }] : [])
    ,
    ...specRows.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
    ...(activeVariant?.sku ? [{ '@type': 'PropertyValue', name: 'variant_sku', value: activeVariant.sku }] : []),
    ...((finish === 'mycelium' || (safeProd.finishes || []).includes('mycelium')) ? [{ '@type': 'PropertyValue', name: 'material_brand', value: 'Mylo (micelio)' }] : []),
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Envían a cualquier estado de México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Sí. Enviamos a los 32 estados de la República Mexicana con flete especializado y empaque reforzado. Tiempo de entrega: ${shopPolicy.deliveryTime}.`
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué garantía incluye?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Garantía de ${safeProd.warranty || '1 año'} contra defectos de fabricación, con soporte en español.`
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué materiales y acabados tiene?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: specs
            ? `Estructura de ${specs.estructura.toLowerCase()}${specs.torre ? ` con torre de ${specs.torre.toLowerCase()}` : ''}. Tapicería: ${specs.tapiceria.toLowerCase()}.`
            : (materials ?? []).join(', ') || 'Consulta los materiales por WhatsApp.'
        }
      }
    ]
  };

  const galleryImages = useMemo(() => {
    if (!prod) return [];
    
    // Default fallback list of images
    const list = [];
    const mainImg = activeVariant?.image || prod.image;
    if (mainImg) {
      list.push({
        src: mainImg,
        alt: prod.finishes?.length ? `${prod.name} — ${FINISHES[finish]?.name || ''}` : prod.name,
        type: 'main' as const,
        label: 'Vista Principal'
      });
    }
    if (prod.hoverImage && prod.hoverImage !== mainImg) {
      list.push({
        src: prod.hoverImage,
        alt: `${prod.name} — Vista en estudio`,
        type: 'lifestyle' as const,
        label: 'En contexto'
      });
    }
    if (prod.galleryImages && Array.isArray(prod.galleryImages)) {
      prod.galleryImages.forEach((imgSrc) => {
        if (imgSrc && imgSrc !== mainImg && imgSrc !== prod.hoverImage) {
          // The catalogue photo is the manufacturer's own shot; the others are studio scenes.
          const isCatalogue = imgSrc.includes('-catalogo.');
          list.push({
            src: imgSrc,
            alt: `${prod.name} — ${isCatalogue ? 'foto del catálogo del fabricante' : 'vista en estudio'}`,
            type: (isCatalogue ? 'detail' : 'lifestyle') as 'detail' | 'lifestyle',
            label: isCatalogue ? 'Foto del catálogo' : 'En estudio'
          });
        }
      });
    }
    return list;
  }, [prod, activeVariant?.image, finish]);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
      { '@type': 'ListItem', position: 2, name: 'Camas de Pilates', item: `${origin}/cama-de-pilates` },
      { '@type': 'ListItem', position: 3, name: safeProd.name, item: url },
    ]
  };

  if (!prod) return <Navigate to="/shop" replace />;

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

        {/* Breadcrumb Navigation */}
        <nav aria-label="Migas de pan" className="mb-4 text-xs text-[#5D5550] flex items-center gap-2">
          <Link to="/" className="hover:text-[#2A2624] transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/cama-de-pilates" className="hover:text-[#2A2624] font-medium text-[#2A2624] transition-colors">Camas de Pilates</Link>
          <span>/</span>
          <span className="text-[#8C827A] truncate max-w-[200px] md:max-w-none">{safeProd.name}</span>
        </nav>

        <BackLink className="mb-6 hidden md:inline-flex" fallbackTo="/cama-de-pilates" label="Volver al catálogo" />

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
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-[10px] uppercase tracking-[0.2em] text-[#5D5550]">
              Entrega: {shopPolicy.deliveryTime}
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <h1 className="text-5xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9] mb-4 tracking-tight">
                {prod.name}
              </h1>
              <div className="flex items-center gap-3">
                {(prod.isNew || prod.bestSeller) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2A2624] text-[#EAE8E4] text-[10px] uppercase tracking-[0.2em]">
                    {prod.isNew ? 'Nueva Llegada' : 'Más Vendido'}
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

            <motion.div
              key={`product-pricing-${prod.slug}-${finish}-${selectedQuantity}-${basePriceToShow}`}
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col border-b border-[#2A2624]/10 pb-8 gap-2"
            >
              <div className="flex items-baseline gap-4">
                {/* translate="no": browser translation detaches React's text nodes, freezing live prices */}
                <div translate="no" className="notranslate text-4xl sm:text-5xl font-serif italic text-[#2A2624]">
                  $ {Number(priceToShow).toLocaleString('es-MX')}{' '}
                  <span className="text-sm font-sans not-italic text-[#5D5550] tracking-normal">{prod.currency}</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#3E2723] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]" /> Fabricación bajo pedido
                </div>
              </div>

              {bundleCalc.quantity > 1 ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#2A2624]">
                    Paquete de <span translate="no" className="notranslate">{bundleCalc.quantity}</span> Unidades · <span translate="no" className="notranslate font-bold text-[#3E2723]">${bundleCalc.discountedUnitPrice.toLocaleString('es-MX')} {prod.currency} / unidad</span>
                  </p>
                  <p className="text-xs text-[#5D5550]">
                    Precio regular sin descuento: <span translate="no" className="notranslate line-through">${bundleCalc.originalTotalPrice.toLocaleString('es-MX')} {prod.currency}</span> ·{' '}
                    <span className="font-bold text-emerald-700">
                      Ahorras{' '}
                      <span translate="no" className="notranslate">
                        ${bundleCalc.totalSavings.toLocaleString('es-MX')} {prod.currency}
                      </span>
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#5D5550]">
                  Precio unitario individual
                </p>
              )}
            </motion.div>

            {isReformer && (
              <div>
                <BundleSelector
                  basePrice={basePriceToShow}
                  currency={prod.currency}
                  selectedQuantity={selectedQuantity}
                  onSelectQuantity={(q) => setSelectedQuantity(q)}
                  productName={prod.name}
                />
              </div>
            )}

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-8">
              {(prod.finishes?.length ?? 0) > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium uppercase tracking-widest text-[#2A2624]">Acabado</span>
                    <Link to="/blog/cama-de-pilates-guia-de-compra" className="text-[10px] uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] underline decoration-[#2A2624]/30 hover:decoration-[#2A2624] underline-offset-4">Ver guía</Link>
                  </div>
                  <Finishes value={finish} onChange={setFinish} />
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <a
                  href={buyWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-rybbit-event="click_product_whatsapp_buy"
                  data-rybbit-prop-sku={displaySku}
                  data-rybbit-prop-price={priceToShow}
                  onClick={() => beginCheckout({ product: prod })}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] text-white rounded-full py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#20ba59] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-[#25D366]/20"
                >
                  <MessageCircle className="h-5 w-5" /> Comprar por WhatsApp
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`${buyWhatsAppUrl}%20Quisiera%20solicitar%20una%20cotizaci%C3%B3n%20formal%20en%20PDF%20con%20desglose%20de%20IVA%20y%20flete.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-rybbit-event="click_product_whatsapp_quote_pdf"
                    className="flex items-center justify-center gap-1.5 px-4 py-3 border border-[#2A2624]/20 rounded-full text-[10px] uppercase tracking-[0.15em] text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors font-medium text-center"
                  >
                    <FileText className="w-3.5 h-3.5" /> Cotización PDF
                  </a>
                  <a
                    href="tel:+525548468190"
                    data-rybbit-event="click_product_call"
                    className="flex items-center justify-center gap-1.5 px-4 py-3 border border-[#2A2624]/20 rounded-full text-[10px] uppercase tracking-[0.15em] text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors font-medium text-center"
                  >
                    <Phone className="w-3.5 h-3.5" /> Llamar (+52 55)
                  </a>
                </div>

                {/* Risk Reversals & FUD Busters */}
                <div className="mt-2 p-3.5 rounded-2xl bg-white/70 border border-[#2A2624]/10 space-y-1.5 text-xs text-[#5D5550]">
                  <div className="flex items-center gap-2 text-[#2A2624] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Factura fiscal mexicana con IVA desglosado</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2A2624] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Garantía directa de 1 año en chasis y mecanismos</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2A2624] font-medium">
                    <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Envío asegurado en huacal a los 32 estados de México</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {specRows.length > 0 && (
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="pt-8 border-t border-[#2A2624]/10">
                <h3 className="font-serif italic text-xl text-[#2A2624] mb-4">Especificaciones</h3>
                <dl className="divide-y divide-[#2A2624]/10 text-sm">
                  {specRows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-2.5">
                      <dt className="text-[#8C827A] font-light">{label}</dt>
                      <dd className="text-[#2A2624]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            )}

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

            {/* Contextual Links */}
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="p-6 bg-[#FAF9F5] rounded-sm border border-[#2A2624]/10 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#8C827A]">Guías y Comparativas</p>
              <div className="flex flex-col gap-2 text-xs">
                <Link to="/cama-de-pilates" className="text-[#2A2624] hover:text-[#9E4733] font-medium transition-colors">
                  ← Ver catálogo completo de Camas de Pilates en México
                </Link>
                <Link to="/cama-de-pilates/precio" className="text-[#5D5550] hover:text-[#2A2624] transition-colors">
                  Tabla de precios 2026
                </Link>
                <Link to="/blog/cama-de-pilates-guia-de-compra" className="text-[#5D5550] hover:text-[#2A2624] transition-colors">
                  Guía definitiva de compra de Reformer (resortes y medidas)
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* FAQ & Related */}
        <div className="mt-32 grid md:grid-cols-3 gap-16 border-t border-[#2A2624]/10 pt-16">
          <div className="md:col-span-2 space-y-12">
            <h2 className="text-4xl font-serif italic text-[#2A2624]">Preguntas frecuentes</h2>
            <div className="space-y-6">
              {[
                { q: '¿Cuánto tarda la entrega?', a: `${shopPolicy.deliveryTime}, tanto en México como en EE. UU. y Europa.` },
                { q: '¿Qué garantía incluye?', a: `Garantía de ${safeProd.warranty ?? '1 año'} contra defectos de fabricación, con soporte en español.` },
                { q: '¿De qué materiales está hecho?', a: `Materiales: ${(safeProd.materials ?? []).join(', ')}.` }
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
            <h2 className="text-4xl font-serif italic text-[#2A2624] mb-10">También te puede interesar</h2>
            <div className="space-y-10">
              {(() => {
                const rawLinks = (productInternalLinks as Record<string, Array<{ target: string; role: string; anchor?: string }>>)[safeProd.slug] || [];
                const customProducts: Product[] = [];
                const landingLinks: Array<{ target: string; title: string }> = [];

                for (const item of rawLinks) {
                  if (item.target.startsWith('/product/')) {
                    const pSlug = item.target.replace('/product/', '');
                    const found = getBySlug(pSlug);
                    if (found && !customProducts.some(p => p.slug === found.slug)) {
                      customProducts.push(found);
                    }
                  } else if (item.target === '/reformer-para-estudio') {
                    landingLinks.push({ target: item.target, title: 'Equipamiento Comercial para Estudios' });
                  }
                }

                const displayProducts = customProducts.length > 0
                  ? customProducts.slice(0, 3)
                  : allProducts().filter(p => p.slug !== safeProd.slug && p.category === safeProd.category).slice(0, 3);

                return (
                  <>
                    {displayProducts.map((p) => (
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
                    {landingLinks.map((ll) => (
                      <Link key={ll.target} to={ll.target} className="block p-4 border border-[#2A2624]/10 rounded-sm bg-[#FAF9F6] hover:bg-[#EAE8E4] transition-colors">
                        <span className="text-[10px] uppercase tracking-widest text-[#3E2723] block mb-1">Guía Relacionada</span>
                        <span className="font-serif italic text-sm text-[#2A2624] hover:text-[#3E2723]">{ll.title} →</span>
                      </Link>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <StickyMobileCTA
        productName={bundleCalc.quantity > 1 ? `${prod.name} (Pack ${bundleCalc.quantity}x)` : prod.name}
        price={Number(priceToShow)}
        currency={prod.currency}
        whatsappUrl={buyWhatsAppUrl}
        onBuy={() => beginCheckout({ product: prod })}
        warranty={prod.warranty}
        productSlug={prod.slug}
        selectedQuantity={bundleCalc.quantity}
        totalSavings={bundleCalc.totalSavings}
      />
    </LuxuryLayout >
  );
};

export default ProductPage;
