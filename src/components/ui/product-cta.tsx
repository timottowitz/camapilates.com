import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCTAProps {
  title?: string;
  description?: string;
  productId?: string;
  publishableKey?: string;
  className?: string;
}

const DEFAULT_PK = "sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c";
const DEFAULT_PRODUCT = "prod_6569ddc31c17b221072732";

const ProductCTA = ({
  title = "Compra tu Cama de Pilates (Reformer)",
  description = "Pago seguro y envío en México. Abre el producto para ver fotos, especificaciones y opciones.",
  productId = DEFAULT_PRODUCT,
  publishableKey = DEFAULT_PK,
  className = ""
}: ProductCTAProps) => {
  const embedHtml = `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"${publishableKey}","options":{"product_to_display":"${productId}","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_min_max_order_quantity":"0","show_sale":"0","show_free_shipping":"0","show_new_product":"0","show_digital_download":"0","show_pwyw":"0","image_swap":"0","show_button_icons":"1"}}</script>
</div>`;

  return (
    <section className={`bg-white border rounded-xl p-8 shadow-sm my-12 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>

        <div className="flex justify-center mb-6">
          <Button className="bg-bennett-navy hover:bg-bennett-navy/90 text-white" asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Ver producto
            </a>
          </Button>
        </div>

        <div className="not-prose" dangerouslySetInnerHTML={{ __html: embedHtml }} />
        <p className="text-xs text-muted-foreground mt-4">Haz clic en “View Product” o “Add to Cart” para abrir el popup.</p>
      </div>
    </section>
  );
};

export default ProductCTA;

