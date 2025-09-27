import React, { useState, useMemo, useCallback } from 'react';
import { CreditCard, MessageCircle, Package, ShieldCheck } from 'lucide-react';
import { ReviewsPreview } from '@/components/ui/reviews-preview';
import { Finishes, FINISHES, type FinishKey } from '@/components/product/Finishes';
import RibbonBanner from '@/components/ui/ribbon-banner';
import { Helmet } from 'react-helmet-async';
import { getOrigin, DEFAULTS } from '@/lib/seo';
import { useParams, Navigate, Link } from 'react-router-dom';
import products from '@/content/products.json';

type Product = (typeof products)[number];

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

  const productSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prod.name,
    description: prod.description,
    brand: { '@type': 'Brand', name: prod.brand },
    sku: prod.sku,
    image: [origin + prod.image, '/images/finish-walnut.jpg', '/images/finish-white.jpg', '/images/finish-black.jpg', '/images/finish-mycelium.webp'],
    material: materials,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: prod.currency,
      price: prod.price,
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
  ];

  const embedHtml = `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"${prod.publishableKey}","options":{"product_to_display":"${prod.productId}","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_button_icons":"1"}}</script>
</div>`;

  const openBuyModal = useCallback(() => {
    const root = document.getElementById('buy-widget');
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
      </Helmet>

      <RibbonBanner />
      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <img src={FINISHES[finish]?.img || prod.image} alt={`${prod.name} — ${FINISHES[finish]?.name || ''}`} className="w-full h-auto rounded-lg border border-border" loading="eager" onError={(e) => (e.currentTarget.src = prod.image)} />
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
            <h1 className="text-3xl font-bold text-foreground">{prod.name}</h1>
            <p className="mt-2 text-sm text-foreground italic">El último Reformer que necesitarás. Desarrolla tu gracia con materiales nobles—solo lo mejor toca tu piel.</p>
            <p className="mt-4 text-muted-foreground">{prod.description}</p>
            <div className="mt-6 text-xl text-foreground font-semibold">$ {prod.price} {prod.currency}</div>
            {/* Desktop quick actions */}
            <div className="mt-3 hidden md:flex gap-2">
              <button onClick={(e) => { e.preventDefault(); openBuyModal(); }} className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Comprar ahora</button>
              <a href="tel:+523222787690" className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Llamar</a>
              <a href="https://wa.me/523222787690" className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">WhatsApp</a>
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
            <div id="buy-widget" className="mt-8" dangerouslySetInnerHTML={{ __html: embedHtml }} />

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
    {/* Sticky mobile CTA bar */}
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <a href="#comprar" onClick={(e) => { e.preventDefault(); openBuyModal(); }} className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground">Comprar</a>
        <a href="tel:+523222787690" className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-foreground">Llamar</a>
        <a href="https://wa.me/523222787690" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-white">WhatsApp</a>
      </div>
    </div>
    </>
  );
};

export default ProductPage;
