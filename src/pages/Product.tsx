import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CreditCard, MessageCircle, Package, ShieldCheck } from 'lucide-react';
import { ReviewsPreview } from '@/components/ui/reviews-preview';
import { Finishes, FINISHES, type FinishKey } from '@/components/product/Finishes';
import RibbonBanner from '@/components/ui/ribbon-banner';
import { Helmet } from 'react-helmet-async';
import { getOrigin, DEFAULTS } from '@/lib/seo';
import { useParams, Navigate, Link } from 'react-router-dom';
import products from '@/content/products.json';
import type { FinishKey, Product as PType } from '@/lib/shop/types';
import ShoprocketBuyButton from '@/components/commerce21/ShoprocketBuyButton';
import Gallery21 from '@/components/commerce21/Gallery21';
import { beginCheckout, viewItem } from '@/lib/shop/analytics';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    if (region === 'MX') return '5–7 días';
    if (region === 'US') return '12–18 días (estimado)';
    return '12–21 días (estimado)';
  }, [region]);

  const onChangeRegion = (value: 'MX' | 'US' | 'DE') => {
    setRegion(value);
    try { if (typeof window !== 'undefined') window.localStorage.setItem('regionPref', value); } catch { /* ignore */ }
  };

  if (!prod) return <Navigate to="/store" replace />;

  const url = `${origin}/product/${prod.slug}`;

  useEffect(() => {
    // Emit view_item on PDP load
    viewItem(prod as any);
  }, [prod?.slug]);

  const materials = finish === 'mycelium'
    ? ['cuero de micelio (sostenible)', 'madera de nogal', 'acero estructural']
    : ['cuero genuino', 'madera de nogal', 'acero estructural'];

  // Basic specs (public, non-medical)
  const SPECS = {
    dimensions: '~245 × 70 × 40 cm',
    weight: '~70–95 kg (según acabado)',
    carriage: 'Recorrido suave y silencioso',
    warranty: '3 años',
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
            transitTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 7, unitCode: 'DAY' }
          }
        },
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 14, unitCode: 'DAY' }
          }
        },
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 16, unitCode: 'DAY' }
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
    ...((finish === 'mycelium' || (prod.finishes||[]).includes('mycelium')) ? [{ '@type': 'PropertyValue', name: 'material_brand', value: 'Mylo (micelio)' }] : []),
  ];

  const openBuyModal = useCallback(() => {
    const root = document.getElementById('sr-buy-pdp');
    if (!root) return;
    const candidates = Array.from(root.querySelectorAll('button, a')) as HTMLElement[];
    const match = candidates.find((el) => /ver|view|producto|product|comprar|add to cart|agregar/i.test(el.textContent || ''));
    if (match) (match as HTMLButtonElement).click();
    else root.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // FAQ for Product pages (mirrors PDP info)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuánto tarda la entrega?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'En México la entrega estimada es de 5–7 días hábiles. Envíos a EE. UU. y Europa entre 12–21 días.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué garantía incluye?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Garantía de 3 años que cubre defectos de fabricación en estructura, muelles y accesorios básicos. Incluye repuestos exprés y soporte en español.'
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
      ...(prod.category ? [{ '@type': 'ListItem', position: 2, name: prod.category, item: `${origin}/shop/category/${(prod.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}` }] : []),
      { '@type': 'ListItem', position: prod.category ? 3 : 2, name: prod.name, item: url },
    ]
  };

  return (
    <>
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

      <RibbonBanner />
      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <Gallery21 images={[activeVariant?.image || '', FINISHES[finish]?.img || '', prod.image].filter(Boolean)} altPrefix={`${prod.name} — ${FINISHES[finish]?.name || ''}`} />
          </div>
          <div>
            {/* Region selector for delivery estimate */}
            <div className="mb-3 text-sm text-muted-foreground">
              <label htmlFor="region" className="mr-2">Región:</label>
              <select id="region" className="rounded-md border border-border bg-background px-2 py-1 text-foreground" value={region} onChange={(e) => onChangeRegion(e.target.value as any)}>
                <option value="MX">México</option>
                <option value="US">Estados Unidos</option>
                <option value="DE">Alemania / Europa</option>
              </select>
              <span className="ml-3">Entrega estimada: {estimate}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              {prod.name}
              {(prod.isNew || prod.bestSeller) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-[10px] px-2 py-0.5">
                  {prod.isNew ? 'Nuevo' : 'Más vendido'}
                </span>
              )}
              {(/mycel/i.test(prod.name) || (prod.finishes||[]).includes('mycelium')) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 text-white text-[10px] px-2 py-0.5">Mylo™</span>
              )}
            </h1>
            {/* Breadcrumbs inline */}
            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
              <Link to="/shop" className="hover:underline">Tienda</Link>
              {prod.category && (<>
                <span>›</span>
                <Link to={`/shop/category/${(prod.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`} className="hover:underline">{prod.category}</Link>
              </>)}
              <span>›</span>
              <span className="text-foreground">{prod.name}</span>
            </div>
            <p className="mt-2 text-sm text-foreground italic">El último Reformer que necesitarás. Desarrolla tu gracia con materiales nobles—solo lo mejor toca tu piel.</p>
            <p className="mt-4 text-muted-foreground">{prod.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="text-xl text-foreground font-semibold">$ {priceToShow} {prod.currency}</div>
              <div className="inline-flex items-center rounded-full border border-green-600/30 text-green-700 bg-green-50 px-2 py-0.5 text-xs">En stock</div>
              <div className="text-xs text-muted-foreground">SKU: {displaySku}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Entrega {estimate} • Garantía 3 años</div>
            {(finish === 'mycelium' || (prod.finishes||[]).includes('mycelium') || /mycel/i.test(prod.name)) && (
              <div className="mt-2 text-xs text-emerald-900 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-1">Edición Mylo™ (micelio)</span>
                <a
                  href="https://boltthreads.com/technology/mylo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-primary hover:underline"
                  title="Material de micelio renovable (Mylo™)"
                >Conocer Mylo</a>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="¿Qué es Mylo?" className="text-emerald-800/80 hover:text-emerald-900">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Mylo™: material de micelio con tacto premium & menor impacto ambiental.</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            {/* Desktop quick actions */}
            <div className="mt-3 hidden md:flex gap-2">
              <button onClick={(e) => { e.preventDefault(); beginCheckout({ product: prod as any }); openBuyModal(); }} className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Comprar ahora</button>
              <a href="https://wa.me/523222787690" className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">WhatsApp</a>
              <a href="tel:+523222787690" className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Llamar</a>
            </div>
            <div className="mt-2 text-sm">
              <Link to="/packs/estudio" className="text-primary hover:underline">Pack para estudios (8+) — 20% de descuento</Link>
            </div>
            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Mercado Pago</div>
              <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> Soporte en español</div>
              <div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Repuestos exprés</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Garantía 3 años</div>
            </div>
            {/* Finishes selector */}
            <div className="mt-6">
              <Finishes value={finish} onChange={setFinish} />
              {finish === 'mycelium' && (
                <div className="mt-2 inline-flex items-center rounded-md bg-emerald-50 text-emerald-800 px-2 py-1 text-xs border border-emerald-200">
                  Opción sostenible: micelio
                </div>
              )}
              <div className="mt-2 text-xs">
                <Link to="/acabados" className="text-primary hover:underline">Conocer todos los acabados</Link>
              </div>
            </div>
            {/* Materials compact moved higher (above embed) */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-foreground">Materiales y acabados</h2>
              <div className="mt-3 grid sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold text-foreground">Cuero genuino</h3>
                  <p className="text-sm text-muted-foreground mt-1">Contacto cómodo y duradero; mantiene agarre y color.</p>
                </div>
                <div className="border border-border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold text-foreground">Madera de nogal</h3>
                  <p className="text-sm text-muted-foreground mt-1">Cálida y elegante, con acabado protector que respira.</p>
                </div>
                <div className="border border-border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold text-foreground">Acero estructural</h3>
                  <p className="text-sm text-muted-foreground mt-1">Rigidez y precisión para un recorrido estable y silencioso.</p>
                </div>
              </div>
            </div>
            {/* Specs mini-block */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-foreground">Especificaciones (resumen)</h2>
              <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <dt className="font-medium text-foreground">Dimensiones</dt>
                  <dd>{SPECS.dimensions}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Peso</dt>
                  <dd>{SPECS.weight}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Recorrido del carro</dt>
                  <dd>{SPECS.carriage}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Garantía</dt>
                  <dd>{SPECS.warranty}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-8">
              <ShoprocketBuyButton rootId="sr-buy-pdp" productId={prod.productId} publishableKey={prod.publishableKey} onBeforeOpen={() => beginCheckout({ product: prod as any })} />
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">Características</h2>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>• Estabilidad y recorrido suave</li>
                <li>• Accesorios básicos incluidos</li>
                <li>• Soporte y garantía</li>
              </ul>
            </div>

            {/* Entrega y garantía (accordion) */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">Entrega y garantía</h2>
              <details className="mt-3 bg-card p-4 rounded-lg border border-border">
                <summary className="font-medium text-foreground cursor-pointer">Tiempos de entrega</summary>
                <p className="mt-2 text-sm text-muted-foreground">México: 5–7 días hábiles. EE. UU.: 12–18 días (estimado). Europa: 12–21 días (estimado).</p>
              </details>
              <details className="mt-3 bg-card p-4 rounded-lg border border-border">
                <summary className="font-medium text-foreground cursor-pointer">Garantía 3 años</summary>
                <p className="mt-2 text-sm text-muted-foreground">Cubre defectos de fabricación en estructura, muelles y accesorios básicos. Repuestos exprés y soporte en español.</p>
              </details>
              <details className="mt-3 bg-card p-4 rounded-lg border border-border">
                <summary className="font-medium text-foreground cursor-pointer">Pagos y factura</summary>
                <p className="mt-2 text-sm text-muted-foreground">Pagos seguros con Mercado Pago y tarjetas bancarias. Facturación disponible para estudios.</p>
              </details>
            </div>
          <div className="mt-10">
            <ReviewsPreview productSlug={prod.slug} onAggregate={(avg, count) => setAgg({ ratingValue: avg.toFixed(1), reviewCount: count })} />
          </div>
        </div>
      </div>
    </section>
    {/* Cross-sell blocks: Accesorios y Guías */}
    <section className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/accesorios" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Accesorios recomendados</h2>
            <p className="text-sm text-muted-foreground mt-2">Cintas, cojines, limpia‑cuero y repuestos exprés para tu Reformer.</p>
            <div className="mt-3 text-primary text-sm">Ver accesorios →</div>
          </Link>
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold text-foreground">Más guías útiles</h2>
            <div className="mt-3 grid gap-3">
              {[ 
                { slug: 'cama-de-pilates-guia-de-compra', title: 'Cama de Pilates: Guía de compra 2025' },
                { slug: 'precio-cama-de-pilates', title: 'Precio de Cama de Pilates' },
                { slug: 'reformer-casa-vs-profesional', title: 'Reformer: casa vs profesional' },
              ].map((g) => (
                <Link key={g.slug} to={`/blog/${g.slug}`} className="block group rounded-md border border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="font-medium text-foreground group-hover:text-primary">{g.title}</div>
                  <div className="text-xs text-muted-foreground">Leer guía →</div>
                </Link>
              ))}
            </div>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold text-foreground">Productos relacionados</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {products.filter(p => p.slug !== prod.slug && p.category === prod.category).slice(0, 2).map((p) => (
                <Link key={p.slug} to={`/product/${p.slug}`} className="block group rounded-md border border-border p-3 hover:border-primary/50 transition-colors">
                  <div className="aspect-square overflow-hidden rounded bg-muted border border-border">
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-2 text-sm font-medium text-foreground group-hover:text-primary">{p.name}</div>
                  <div className="text-xs text-muted-foreground">$ {p.price} {p.currency}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* Sticky mobile CTA bar */}
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <a href="#comprar" onClick={(e) => { e.preventDefault(); beginCheckout({ product: prod as any }); openBuyModal(); }} className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground">Comprar</a>
        <a href="https://wa.me/523222787690" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-white">WhatsApp</a>
        <a href="tel:+523222787690" className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-foreground">Llamar</a>
      </div>
    </div>
    </>
  );
};

export default ProductPage;
