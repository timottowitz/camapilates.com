import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Package, ShieldCheck, Truck, CreditCard, CheckCircle, Phone, Star } from 'lucide-react';

const Store = () => {
  const origin = getOrigin();
  const title = 'Cama de Pilates (Reformer) en México — Tienda CAMA Pilates';
  const desc = 'Compra tu cama de Pilates (Reformer) en México. Modelos para casa y estudio: silencio total, cuero genuino, nogal y acero. Envío 5–7 días y garantía de 3 años.';

  const productCasa = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Cama de Pilates Reformer – Casa',
    description: 'Reformer compacto para casa. Estabilidad, recorrido suave y accesorios básicos.',
    brand: { '@type': 'Brand', name: 'CAMA Pilates' },
    sku: 'HOME-REFORMER-001',
    image: [`${origin}/og/cama-de-pilates-venta-mexico.png`],
    url: `${origin}/store#casa`,
    offers: {
      '@type': 'Offer',
      url: `${origin}/store#casa`,
      priceCurrency: 'MXN',
      price: '35000.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: [
        { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 7, unitCode: 'DAY' } } },
        { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 14, unitCode: 'DAY' } } },
        { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 16, unitCode: 'DAY' } } }
      ]
    }
  };
  const productPro = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Cama de Pilates Reformer – Profesional',
    description: 'Reformer profesional para estudio. Construcción robusta, accesorios y servicio.',
    brand: { '@type': 'Brand', name: 'CAMA Pilates' },
    sku: 'PRO-REFORMER-001',
    image: [`${origin}/og/cama-de-pilates-venta-mexico.png`],
    url: `${origin}/store#profesional`,
    offers: {
      '@type': 'Offer',
      url: `${origin}/store#profesional`,
      priceCurrency: 'MXN',
      price: '50000.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: [
        { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 7, unitCode: 'DAY' } } },
        { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 14, unitCode: 'DAY' } } },
        { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 16, unitCode: 'DAY' } } }
      ]
    }
  };

  const shippingItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Camas de Pilates — Envío y disponibilidad',
    itemListElement: [productPro, productCasa].map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: p }))
  };

  const keywords = [
    'cama de pilates',
    'reformer pilates',
    'cama de pilates precio',
    'reformer profesional',
    'reformer para casa',
    'cama de pilates mexico',
    'venta de reformer en mexico',
    'cama de pilates silenciosa',
  ].join(', ');

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${origin}/store` }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuál es la diferencia entre el Reformer de Estudio y el de Casa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El Reformer de Estudio está diseñado para uso intensivo con construcción más robusta y accesorios adicionales. El Reformer para Casa mantiene la misma calidad y silencio, pero en formato más compacto ideal para espacios domésticos. Ambos incluyen acabados en cuero genuino y madera de nogal.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cómo funciona la entrega y armado?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ofrecemos entrega en todo México en 5–7 días hábiles. Tu reformer llega con instructivo y herramientas para armado fácil, y nuestro equipo de soporte está listo para ayudar si lo necesitas.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué formas de pago aceptan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Aceptamos Visa, MasterCard y Mercado Pago. Para estudios ofrecemos opciones de financiamiento y descuentos por volumen. Todos los pagos son procesados de forma segura con SSL.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Ofrecen demostraciones o pruebas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, ofrecemos demostraciones en nuestro showroom en CDMX y visitas a estudios para compras de 8+ unidades. Contacta nuestro equipo vía WhatsApp para agendar una cita personalizada.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué incluye la garantía de 3 años?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nuestra garantía cubre defectos de fabricación en estructura, muelles y accesorios básicos. Incluye repuestos exprés y soporte técnico.'
        }
      }
    ]
  };

  return (
    <React.Fragment>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/store`} />
        <meta name="keywords" content={keywords} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/store`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(productCasa)}</script>
        <script type="application/ld+json">{JSON.stringify(productPro)}</script>
        <script type="application/ld+json">{JSON.stringify(shippingItemList)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        {/* Header & Introductory Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Cama de Pilates (Reformer) — CAMA Pilates
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Reformers silenciosos y precisos con cuero genuino, madera de nogal y acero.
            Entrega 5–7 días en México y soporte en español.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm mb-6">
            <Link to="/cama-de-pilates/en-venta" className="text-accent hover:underline">Cama de Pilates en venta</Link>
            <Link to="/blog/reformer-casa-vs-profesional" className="text-accent hover:underline">Reformer casa vs profesional</Link>
            <Link to="/cama-de-pilates/precio" className="text-accent hover:underline">Precio de la cama de Pilates</Link>
          </div>

          {/* Visual USP bullets */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">🔇</span>
              </div>
              <span className="font-medium">Silencio total</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">🪵</span>
              </div>
              <span className="font-medium">Cuero genuino, Madera de Nogal</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">🔩</span>
              </div>
              <span className="font-medium">Acero estructural</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium">Garantía 3 años</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Entrega 5–7 días</span>
            </div>
          </div>

          <div className="flex justify-center">
            <RegionNote />
          </div>
        </header>

        {/* Compare Casa vs Profesional */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Comparar: Casa vs Profesional</h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-foreground">
                <tr>
                  <th className="text-left p-4">Característica</th>
                  <th className="text-left p-4">Reformer Casa</th>
                  <th className="text-left p-4">Reformer Profesional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                <tr>
                  <td className="p-4">Uso recomendado</td>
                  <td className="p-4">Hogar, 1–2 personas</td>
                  <td className="p-4">Estudio, uso continuo</td>
                </tr>
                <tr>
                  <td className="p-4">Estructura</td>
                  <td className="p-4">Acero + madera de nogal</td>
                  <td className="p-4">Acero reforzado + nogal</td>
                </tr>
                <tr>
                  <td className="p-4">Silencio</td>
                  <td className="p-4">Recorrido silencioso</td>
                  <td className="p-4">Silencio total (tolerancias precisas)</td>
                </tr>
                <tr>
                  <td className="p-4">Accesorios</td>
                  <td className="p-4">Básicos</td>
                  <td className="p-4">Kit completo para clases</td>
                </tr>
                <tr>
                  <td className="p-4">Garantía</td>
                  <td className="p-4">3 años</td>
                  <td className="p-4">3 años</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-background">
              <div>
                <div className="font-semibold text-foreground">Reformer Casa</div>
                <div className="text-xs text-muted-foreground">Compacto y silencioso</div>
              </div>
              <div className="flex gap-2">
                <a href="#casa" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Comprar</a>
                <Link to="/product/reformer-casa" className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Ver en detalle</Link>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-background">
              <div>
                <div className="font-semibold text-foreground">Reformer Profesional</div>
                <div className="text-xs text-muted-foreground">Uso continuo en estudio</div>
              </div>
              <div className="flex gap-2">
                <a href="#profesional" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Comprar</a>
                <Link to="/product/reformer-profesional" className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Ver en detalle</Link>
              </div>
            </div>
          </div>
        </section>
        {/* Trust & Promotional Highlights */}
        <section className="mb-12 bg-accent/5 rounded-lg p-6 border border-accent/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-accent" />
              <span className="text-foreground font-medium">Entrega en 5–7 días en MX</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span className="text-foreground font-medium">Garantía 3 años</span>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-accent" />
              <span className="text-foreground font-medium">Repuestos exprés disponibles</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-accent" />
              <span className="text-foreground font-medium">Pagos seguros (Visa, MasterCard, Mercado Pago)</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-accent" />
              <span className="text-foreground font-medium">Soporte vía WhatsApp</span>
            </div>
          </div>

          {/* Studio Pack Promotion */}
          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
            <div className="flex items-center gap-3">
              <div className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">20% OFF</div>
              <div>
                <span className="text-foreground font-semibold">Pack para Estudios – 20% off 8+ reformers</span>
                <Link to="/packs/estudio" className="ml-2 text-accent hover:underline font-medium">
                  Ver detalles →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Product Listing Display */}
        <section className="mb-12" id="profesional">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Reformers Profesionales</h2>
          <p className="text-muted-foreground mb-6">Reformer de Estudio – Silencio total, cuero genuino & acero estructural</p>
          <div className="bg-card rounded-lg p-6 border border-border mb-4">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground ml-1">(12 reseñas)</span>
              </div>
              <span className="text-lg font-semibold text-foreground">MXN $50,000</span>
              <span className="text-sm text-muted-foreground">Acabado nogal, cuero genuino</span>
            </div>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c","options":{"product_to_display":"prod_6569ddc31c17b221072732","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_min_max_order_quantity":"0","show_sale":"0","show_free_shipping":"0","show_new_product":"0","show_digital_download":"0","show_pwyw":"0","image_swap":"0","show_button_icons":"1"},"product_popup":{"show_product_name":"1","show_product_price":"1","show_product_summary":"1","show_product_description":"1","show_product_image":"1","show_add_to_cart_button":"1","show_select_quantity":"1","show_image_thumbnails":"1","show_product_reviews":"1","show_product_sku":"1","show_product_categories":"1","show_social_sharing_icons":"1","show_related_products":"1","thumbnail_layout":"horizontal_below","image_dimension_value":"crop","image_aspect_ratio":"portrait","variation_styling":"","show_min_max_order_quantity":"1","show_sale":"1","show_free_shipping":"1","show_new_product":"1","show_digital_download":"1","show_pwyw":"1","show_product_tabs":"1","image_zoom":"1","show_stock":"0"},"styles":{"align_content":"center","button_background":"#ff5a3d","button_color":"#ffffff","view_product_button_background":"#ff5a3d","view_product_button_color":"#ffffff","view_cart_button_background":"#ff5a3d","view_cart_button_color":"#ffffff","product_background":"transparent","modal_background":"#ffffff","button_font_weight":"normal","popup":{"colors":{"product_title":"#111827","product_price":"#111827","product_summary":"#4b5563","button_background":"#ff5a3d","button_color":"#ffffff","product_active_tab_background":"#f5f5f5"}}}}</script>
</div>` }}
          />
        </section>

        <section className="mb-12" id="casa">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Reformers para Casa</h2>
          <p className="text-muted-foreground mb-6">Reformer Casa – compacto y silencioso, ideal para hogares (materiales profesionales)</p>
          <div className="bg-card rounded-lg p-6 border border-border mb-4">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground ml-1">(8 reseñas)</span>
              </div>
              <span className="text-lg font-semibold text-foreground">MXN $35,000</span>
              <span className="text-sm text-muted-foreground">Acabado nogal, cuero genuino</span>
            </div>
          <div
            dangerouslySetInnerHTML={{ __html: `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c","options":{"product_to_display":"prod_6569ddc31c17b221072732","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_min_max_order_quantity":"0","show_sale":"0","show_free_shipping":"0","show_new_product":"0","show_digital_download":"0","show_pwyw":"0","image_swap":"0","show_button_icons":"1"},"product_popup":{"show_product_name":"1","show_product_price":"1","show_product_summary":"1","show_product_description":"1","show_product_image":"1","show_add_to_cart_button":"1","show_select_quantity":"1","show_image_thumbnails":"1","show_product_reviews":"1","show_product_sku":"1","show_product_categories":"1","show_social_sharing_icons":"1","show_related_products":"1","thumbnail_layout":"horizontal_below","image_dimension_value":"crop","image_aspect_ratio":"portrait","variation_styling":"","show_min_max_order_quantity":"1","show_sale":"1","show_free_shipping":"1","show_new_product":"1","show_digital_download":"1","show_pwyw":"1","show_product_tabs":"1","image_zoom":"1","show_stock":"0"},"styles":{"align_content":"center","button_background":"#ff5a3d","button_color":"#ffffff","view_product_button_background":"#ff5a3d","view_product_button_color":"#ffffff","view_cart_button_background":"#ff5a3d","view_cart_button_color":"#ffffff","product_background":"transparent","modal_background":"#ffffff","button_font_weight":"normal","popup":{"colors":{"product_title":"#111827","product_price":"#111827","product_summary":"#4b5563","button_background":"#ff5a3d","button_color":"#ffffff","product_active_tab_background":"#f5f5f5"}}}}</script>
</div>` }}
          />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Accesorios</h2>
          <p className="text-muted-foreground mb-6">Complementa tu práctica con accesorios de calidad profesional</p>
          <div
            dangerouslySetInnerHTML={{ __html: `
<div class="sr-element sr-products" data-embed="multiple_products">
  <script type="application/json" data-config="embed">{"publishable_key":"sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c","options":{"products_to_display":"all","categories":[],"products":[],"exclude_products":[],"exclude_product_categories":[],"image_dimension_value":"crop","image_aspect_ratio":"portrait","button_style":"standard","variation_style":"on_hover","open_product_in":"in_page","button_position":"inline","product_default_sorting_order":"product_order","product_pagination_limit":"12","desktop":{"items_per_row":3},"mobile":{"items_per_row":1},"hide_out_of_stock":"0"},"includes":{"show_search_box":"1","show_sort_by":"1","show_per_page":"1","show_category_dropdown":"1","show_currency_dropdown":"1","show_language_dropdown":"1","show_product_filters":"1","show_product_name":"1","show_product_price":"1","show_product_image":"1","show_product_summary":"1","open_modal_on_image_click":"1","show_view_product_button":"1","show_add_to_cart_button":"1","show_min_max_order_quantity":"1","show_sale":"1","show_free_shipping":"1","show_new_product":"1","show_digital_download":"1","show_pwyw":"1","image_swap":"1","show_button_icons":"1","mobile":{"show_search_box":"1","show_sort_by":"1","show_per_page":"1","show_category_dropdown":"1","show_currency_dropdown":"1","show_language_dropdown":"1","show_product_filters":"1"}},"product_popup":{"show_product_name":"1","show_product_price":"1","show_product_summary":"1","show_product_description":"1","show_product_image":"1","show_add_to_cart_button":"1","show_select_quantity":"1","show_image_thumbnails":"1","show_product_reviews":"1","show_product_sku":"1","show_product_categories":"1","show_social_sharing_icons":"1","show_related_products":"1","thumbnail_layout":"horizontal_below","image_dimension_value":"crop","image_aspect_ratio":"portrait","variation_styling":"dropdown","show_min_max_order_quantity":"1","show_sale":"1","show_free_shipping":"1","show_new_product":"1","show_digital_download":"1","show_pwyw":"1","show_product_tabs":"1","image_zoom":"1","lightbox_gallery":"1","show_stock":"0"},"styles":{"align_content":"center","product_title":"#111827","product_price":"#111827","product_summary":"#4b5563","button_background":"#ff5a3d","button_color":"#ffffff","view_product_button_background":"#ff5a3d","view_product_button_color":"#ffffff","view_cart_button_background":"#ff5a3d","view_cart_button_color":"#ffffff","product_background":"#ffffff","modal_background":"#ffffff","button_font_weight":"normal","popup":{"colors":{"product_title":"#111827","product_price":"#111827","product_summary":"#4b5563","button_background":"#ff5a3d","button_color":"#ffffff","product_active_tab_background":"#f5f5f5"}}}}</script>
</div>` }}
          />
        </section>

        {/* Additional Content: FAQ and Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <details className="bg-card p-6 rounded-lg border border-border">
              <summary className="font-semibold text-foreground cursor-pointer hover:text-accent">
                ¿Cuál es la diferencia entre el Reformer de Estudio y el de Casa?
              </summary>
              <div className="mt-4 text-muted-foreground">
                <p>
                  El Reformer de Estudio está diseñado para uso intensivo con construcción más robusta y accesorios adicionales.
                  El Reformer para Casa mantiene la misma calidad y silencio, pero en formato más compacto ideal para espacios domésticos.
                  Ambos incluyen <Link to="/acabados" className="text-accent hover:underline">acabados en cuero genuino</Link> y
                  madera de nogal.
                </p>
              </div>
            </details>

            <details className="bg-card p-6 rounded-lg border border-border">
              <summary className="font-semibold text-foreground cursor-pointer hover:text-accent">
                ¿Cómo funciona la entrega y armado?
              </summary>
              <div className="mt-4 text-muted-foreground">
                <p>
                  Ofrecemos entrega en todo México en 5–7 días hábiles. Tu reformer llega con instructivo y herramientas
                  para armado fácil, y nuestro equipo de soporte está listo para ayudar si lo necesitas.
                  Para más información sobre <Link to="/cama-de-pilates/precio" className="text-accent hover:underline">precios y envío</Link>.
                </p>
              </div>
            </details>

            <details className="bg-card p-6 rounded-lg border border-border">
              <summary className="font-semibold text-foreground cursor-pointer hover:text-accent">
                ¿Qué formas de pago aceptan?
              </summary>
              <div className="mt-4 text-muted-foreground">
                <p>
                  Aceptamos Visa, MasterCard y Mercado Pago. Para estudios ofrecemos opciones de financiamiento
                  y descuentos por volumen. Todos los pagos son procesados de forma segura con SSL.
                </p>
              </div>
            </details>

            <details className="bg-card p-6 rounded-lg border border-border">
              <summary className="font-semibold text-foreground cursor-pointer hover:text-accent">
                ¿Ofrecen demostraciones o pruebas?
              </summary>
              <div className="mt-4 text-muted-foreground">
                <p>
                  Sí, ofrecemos demostraciones en nuestro showroom en CDMX y visitas a estudios para compras de 8+ unidades.
                  Contacta nuestro equipo vía WhatsApp para agendar una cita personalizada.
                </p>
              </div>
            </details>

            <details className="bg-card p-6 rounded-lg border border-border">
              <summary className="font-semibold text-foreground cursor-pointer hover:text-accent">
                ¿Qué incluye la garantía de 3 años?
              </summary>
              <div className="mt-4 text-muted-foreground">
                <p>
                  Nuestra garantía cubre defectos de fabricación en estructura, muelles y accesorios básicos.
                  Incluye repuestos exprés y soporte técnico. Visita <Link to="/accesorios" className="text-accent hover:underline">nuestra sección de accesorios</Link>
                  para piezas de mantenimiento.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="mb-12 bg-accent/5 rounded-lg p-6 border border-accent/20">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Lo que dicen nuestros clientes</h2>
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-lg text-foreground italic mb-4">
              "El reformer Edelweiss transformó mi estudio – es silencioso y elegante.
              Mis clientas están encantadas con la experiencia. La inversión se pagó sola en 6 meses."
            </blockquote>
            <cite className="text-muted-foreground font-medium">
              — Laura Martínez, Instructora de Pilates, Estudio Equilibrium CDMX
            </cite>
            <div className="flex justify-center items-center gap-1 mt-3">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        </section>

        {/* WhatsApp Support CTA */}
        <section className="text-center">
          <div className="bg-card p-6 rounded-lg border border-border inline-block">
            <h3 className="text-lg font-semibold text-foreground mb-2">¿Dudas sobre tu compra?</h3>
            <p className="text-muted-foreground mb-4">Habla con Valery ahora</p>
            <a
              href="https://wa.me/523222787690"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Chat por WhatsApp
            </a>
          </div>
        </section>
      </div>

      {/* Sticky mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <a href="#profesional" className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground">Comprar</a>
          <a href="https://wa.me/523222787690" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-white">WhatsApp</a>
          <a href="tel:+523222787690" className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border text-foreground">Llamar</a>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Store;

// Region selector inline helpers
function getInitialRegion(): 'MX' | 'US' | 'DE' {
  if (typeof window === 'undefined') return 'MX';
  const v = window.localStorage?.getItem('regionPref');
  return (v === 'US' || v === 'DE' || v === 'MX') ? v : 'MX';
}

function useRegion() {
  const [region, setRegion] = useState<'MX' | 'US' | 'DE'>(getInitialRegion());
  const estimate = useMemo(() => {
    if (region === 'MX') return 'Entrega estimada: 5–7 días';
    if (region === 'US') return 'Entrega estimada: 12–18 días (estimado)';
    return 'Entrega estimada: 12–21 días (estimado)';
  }, [region]);
  const change = (val: 'MX' | 'US' | 'DE') => {
    setRegion(val);
    try { if (typeof window !== 'undefined') window.localStorage.setItem('regionPref', val); } catch { /* ignore */ }
  };
  return { region, estimate, change };
}

function RegionNote() {
  const { region, estimate, change } = useRegion();
  return (
    <div className="text-sm text-muted-foreground">
      <label htmlFor="regionStore" className="mr-2">Región:</label>
      <select id="regionStore" className="rounded-md border border-border bg-background px-2 py-1 text-foreground" value={region} onChange={(e) => change(e.target.value as 'MX' | 'US' | 'DE')}>
        <option value="MX">México</option>
        <option value="US">Estados Unidos</option>
        <option value="DE">Alemania / Europa</option>
      </select>
      <span className="ml-3">{estimate}</span>
    </div>
  );
}
