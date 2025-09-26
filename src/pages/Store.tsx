import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import React, { useMemo, useState } from 'react';

const Store = () => {
  const origin = getOrigin();
  const title = 'Tienda: Camas de Pilates y Accesorios';
  const desc = 'Compra camas de Pilates (Reformer) para casa y estudio. Envío en México.';

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
      price: '999.00',
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
      price: '1999.00',
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

  return (
    <>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/store`} />
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
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <RegionNote />
        </div>
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Mercado Pago</div>
          <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Soporte en español</div>
          <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Ensamblado en CDMX</div>
          <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Repuestos exprés</div>
          <div className="hidden lg:flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Garantía 3 años</div>
        </div>

        {/* Shop sections */}
        <section className="mb-12" id="casa">
          <h2 className="text-xl font-semibold text-foreground mb-4">Para Casa</h2>
          <div
            dangerouslySetInnerHTML={{ __html: `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c","options":{"product_to_display":"prod_6569ddc31c17b221072732","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_min_max_order_quantity":"0","show_sale":"0","show_free_shipping":"0","show_new_product":"0","show_digital_download":"0","show_pwyw":"0","image_swap":"0","show_button_icons":"1"},"product_popup":{"show_product_name":"1","show_product_price":"1","show_product_summary":"1","show_product_description":"1","show_product_image":"1","show_add_to_cart_button":"1","show_select_quantity":"1","show_image_thumbnails":"1","show_product_reviews":"1","show_product_sku":"1","show_product_categories":"1","show_social_sharing_icons":"1","show_related_products":"1","thumbnail_layout":"horizontal_below","image_dimension_value":"crop","image_aspect_ratio":"portrait","variation_styling":"","show_min_max_order_quantity":"1","show_sale":"1","show_free_shipping":"1","show_new_product":"1","show_digital_download":"1","show_pwyw":"1","show_product_tabs":"1","image_zoom":"1","show_stock":"0"},"styles":{"align_content":"center","button_background":"#ff5a3d","button_color":"#ffffff","view_product_button_background":"#ff5a3d","view_product_button_color":"#ffffff","view_cart_button_background":"#ff5a3d","view_cart_button_color":"#ffffff","product_background":"transparent","modal_background":"#ffffff","button_font_weight":"normal","popup":{"colors":{"product_title":"#111827","product_price":"#111827","product_summary":"#4b5563","button_background":"#ff5a3d","button_color":"#ffffff","product_active_tab_background":"#f5f5f5"}}}}</script>
</div>` }}
          />
        </section>

        <section className="mb-12" id="profesional">
          <h2 className="text-xl font-semibold text-foreground mb-4">Profesional</h2>
          <div
            dangerouslySetInnerHTML={{ __html: `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c","options":{"product_to_display":"prod_6569ddc31c17b221072732","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_min_max_order_quantity":"0","show_sale":"0","show_free_shipping":"0","show_new_product":"0","show_digital_download":"0","show_pwyw":"0","image_swap":"0","show_button_icons":"1"},"product_popup":{"show_product_name":"1","show_product_price":"1","show_product_summary":"1","show_product_description":"1","show_product_image":"1","show_add_to_cart_button":"1","show_select_quantity":"1","show_image_thumbnails":"1","show_product_reviews":"1","show_product_sku":"1","show_product_categories":"1","show_social_sharing_icons":"1","show_related_products":"1","thumbnail_layout":"horizontal_below","image_dimension_value":"crop","image_aspect_ratio":"portrait","variation_styling":"","show_min_max_order_quantity":"1","show_sale":"1","show_free_shipping":"1","show_new_product":"1","show_digital_download":"1","show_pwyw":"1","show_product_tabs":"1","image_zoom":"1","show_stock":"0"},"styles":{"align_content":"center","button_background":"#ff5a3d","button_color":"#ffffff","view_product_button_background":"#ff5a3d","view_product_button_color":"#ffffff","view_cart_button_background":"#ff5a3d","view_cart_button_color":"#ffffff","product_background":"transparent","modal_background":"#ffffff","button_font_weight":"normal","popup":{"colors":{"product_title":"#111827","product_price":"#111827","product_summary":"#4b5563","button_background":"#ff5a3d","button_color":"#ffffff","product_active_tab_background":"#f5f5f5"}}}}</script>
</div>` }}
          />
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Accesorios</h2>
          <div
            dangerouslySetInnerHTML={{ __html: `
<div class="sr-element sr-products" data-embed="multiple_products">
  <script type="application/json" data-config="embed">{"publishable_key":"sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c","options":{"products_to_display":"all","categories":[],"products":[],"exclude_products":[],"exclude_product_categories":[],"image_dimension_value":"crop","image_aspect_ratio":"portrait","button_style":"standard","variation_style":"on_hover","open_product_in":"in_page","button_position":"inline","product_default_sorting_order":"product_order","product_pagination_limit":"12","desktop":{"items_per_row":3},"mobile":{"items_per_row":1},"hide_out_of_stock":"0"},"includes":{"show_search_box":"1","show_sort_by":"1","show_per_page":"1","show_category_dropdown":"1","show_currency_dropdown":"1","show_language_dropdown":"1","show_product_filters":"1","show_product_name":"1","show_product_price":"1","show_product_image":"1","show_product_summary":"1","open_modal_on_image_click":"1","show_view_product_button":"1","show_add_to_cart_button":"1","show_min_max_order_quantity":"1","show_sale":"1","show_free_shipping":"1","show_new_product":"1","show_digital_download":"1","show_pwyw":"1","image_swap":"1","show_button_icons":"1","mobile":{"show_search_box":"1","show_sort_by":"1","show_per_page":"1","show_category_dropdown":"1","show_currency_dropdown":"1","show_language_dropdown":"1","show_product_filters":"1"}},"product_popup":{"show_product_name":"1","show_product_price":"1","show_product_summary":"1","show_product_description":"1","show_product_image":"1","show_add_to_cart_button":"1","show_select_quantity":"1","show_image_thumbnails":"1","show_product_reviews":"1","show_product_sku":"1","show_product_categories":"1","show_social_sharing_icons":"1","show_related_products":"1","thumbnail_layout":"horizontal_below","image_dimension_value":"crop","image_aspect_ratio":"portrait","variation_styling":"dropdown","show_min_max_order_quantity":"1","show_sale":"1","show_free_shipping":"1","show_new_product":"1","show_digital_download":"1","show_pwyw":"1","show_product_tabs":"1","image_zoom":"1","lightbox_gallery":"1","show_stock":"0"},"styles":{"align_content":"center","product_title":"#111827","product_price":"#111827","product_summary":"#4b5563","button_background":"#ff5a3d","button_color":"#ffffff","view_product_button_background":"#ff5a3d","view_product_button_color":"#ffffff","view_cart_button_background":"#ff5a3d","view_cart_button_color":"#ffffff","product_background":"#ffffff","modal_background":"#ffffff","button_font_weight":"normal","popup":{"colors":{"product_title":"#111827","product_price":"#111827","product_summary":"#4b5563","button_background":"#ff5a3d","button_color":"#ffffff","product_active_tab_background":"#f5f5f5"}}}}</script>
</div>` }}
          />
        </section>
      </div>
    </>
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
    try { if (typeof window !== 'undefined') window.localStorage.setItem('regionPref', val); } catch {}
  };
  return { region, estimate, change };
}

function RegionNote() {
  const { region, estimate, change } = useRegion();
  return (
    <div className="text-sm text-muted-foreground">
      <label htmlFor="regionStore" className="mr-2">Región:</label>
      <select id="regionStore" className="rounded-md border border-border bg-background px-2 py-1 text-foreground" value={region} onChange={(e) => change(e.target.value as any)}>
        <option value="MX">México</option>
        <option value="US">Estados Unidos</option>
        <option value="DE">Alemania / Europa</option>
      </select>
      <span className="ml-3">{estimate}</span>
    </div>
  );
}
