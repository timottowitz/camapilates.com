import { Helmet } from 'react-helmet-async';
import { ShoprocketMultipleProducts, ShoprocketSingleProduct, ShoprocketButton } from '@/integrations/shoprocket';

const Store = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const title = 'Tienda: Camas de Pilates y Accesorios';
  const desc = 'Compra camas de Pilates (Reformer) para casa y estudio. Envío en México.';

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/store`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/store`} />
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>

        {/* Shop sections */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Para Casa</h2>
          <ShoprocketButton publishableKey="sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c" productId="prod_6569ddc31c17b221072732" />
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Profesional</h2>
          <ShoprocketButton publishableKey="sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c" productId="prod_6569ddc31c17b221072732" />
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Accesorios</h2>
          <ShoprocketMultipleProducts
            config={{
              publishable_key: 'sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c',
              options: {
                products_to_display: 'all',
                categories: [],
                products: [],
                exclude_products: [],
                exclude_product_categories: [],
                image_dimension_value: 'crop',
                image_aspect_ratio: 'portrait',
                button_style: 'standard',
                variation_style: 'on_hover',
                open_product_in: 'in_page',
                button_position: 'inline',
                product_default_sorting_order: 'product_order',
                product_pagination_limit: '12',
                desktop: { items_per_row: 3 },
                mobile: { items_per_row: 1 },
                hide_out_of_stock: '0'
              },
              includes: {
                show_search_box: '1',
                show_sort_by: '1',
                show_per_page: '1',
                show_category_dropdown: '1',
                show_currency_dropdown: '1',
                show_language_dropdown: '1',
                show_product_filters: '1',
                show_product_name: '1',
                show_product_price: '1',
                show_product_image: '1',
                show_product_summary: '1',
                open_modal_on_image_click: '1',
                show_view_product_button: '1',
                show_add_to_cart_button: '1',
                show_min_max_order_quantity: '1',
                show_sale: '1',
                show_free_shipping: '1',
                show_new_product: '1',
                show_digital_download: '1',
                show_pwyw: '1',
                image_swap: '1',
                show_button_icons: '1',
                mobile: {
                  show_search_box: '1',
                  show_sort_by: '1',
                  show_per_page: '1',
                  show_category_dropdown: '1',
                  show_currency_dropdown: '1',
                  show_language_dropdown: '1',
                  show_product_filters: '1'
                }
              },
              product_popup: {
                show_product_name: '1',
                show_product_price: '1',
                show_product_summary: '1',
                show_product_description: '1',
                show_product_image: '1',
                show_add_to_cart_button: '1',
                show_select_quantity: '1',
                show_image_thumbnails: '1',
                show_product_reviews: '1',
                show_product_sku: '1',
                show_product_categories: '1',
                show_social_sharing_icons: '1',
                show_related_products: '1',
                thumbnail_layout: 'horizontal_below',
                image_dimension_value: 'crop',
                image_aspect_ratio: 'portrait',
                variation_styling: 'dropdown',
                show_min_max_order_quantity: '1',
                show_sale: '1',
                show_free_shipping: '1',
                show_new_product: '1',
                show_digital_download: '1',
                show_pwyw: '1',
                show_product_tabs: '1',
                image_zoom: '1',
                lightbox_gallery: '1',
                show_stock: '0'
              },
              styles: {
                align_content: 'center',
                product_title: '#314d5d',
                product_price: '#2d2d2d',
                product_summary: '#777777',
                button_background: '#233642',
                button_color: '#ffffff',
                view_product_button_background: '#233642',
                view_product_button_color: '#ffffff',
                view_cart_button_background: '#233642',
                view_cart_button_color: '#ffffff',
                product_background: '#ffffff',
                modal_background: '#ffffff',
                button_font_weight: 'normal',
                popup: {
                  colors: {
                    product_title: '#333',
                    product_price: '#666666',
                    product_summary: '#666666',
                    button_background: '#233642',
                    button_color: '#ffffff',
                    product_active_tab_background: '#f5f5f5'
                  }
                }
              }
            }}
          />
        </section>
      </div>
    </>
  );
};

export default Store;
