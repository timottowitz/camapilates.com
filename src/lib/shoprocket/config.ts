export const SHOPROCKET_PUBLISHABLE_KEY =
  import.meta.env.VITE_SHOPROCKET_PK ?? 'sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c';

export const SHOPROCKET_ENABLED = import.meta.env.VITE_SHOPROCKET_ENABLED === 'true';

export const SHOPROCKET_BASKET_CONFIG = {
  options: {
    basket_style: 'bubble',
    basket_position: 'bottom-right',
  },
  includes: {
    show_pop_up_adding_item_to_cart: '1',
    show_image_thumbnails: '1',
    show_select_quantity: '1',
    show_overlay_when_open: '1',
    show_cart_count: '1',
    show_cart_total: '0',
  },
  styles: {
    basket_background: '#ffffff',
    basket_color: '#2A2624',
    basket_text_color: '#2A2624',
    basket_counter_background: '#A0593D',
    basket_counter_color: '#ffffff',
    cart_background: '#EAE8E4',
    cart_text_color: '#2A2624',
    cart_button_background: '#B8735F',
    cart_button_color: '#ffffff',
    cart_links_text_color: '#7A8A6F',
    cart_border_color: '#C9A875',
  },
};
