import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface CTASectionProps {
  title?: string;
  description?: string;
  variant?: "default" | "compact" | "inline";
  className?: string;
}

const CTASection = ({
  title = "¿Buscas una cama de Pilates?",
  description = "Te ayudamos a elegir la cama de Pilates ideal para casa o estudio. Compara modelos, accesorios y precios con envíos en México.",
  variant = "default",
  className = ""
}: CTASectionProps) => {

  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 my-8 ${className}`}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">{description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/products">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ver productos
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/store">
              <ArrowRight className="mr-2 h-4 w-4" />
              Ir a la tienda
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 my-12 ${className}`}>
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
          <p className="text-muted-foreground mb-6">{description}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/products" className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Ver productos
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/blog/cama-de-pilates-guia-de-compra" className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Guía de compra
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - full featured CTA
  return (
    <div className={`bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 rounded-xl p-8 my-12 shadow-lg ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Schedule Button */}
          <div className="text-center">
            <Button size="lg" className="w-full mb-2 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link to="/products">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ver productos
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">Explora modelos y accesorios</p>
          </div>

          {/* Call Button */}
          <div className="text-center">
            <Button size="lg" variant="outline" className="w-full mb-2" asChild>
              <Link to="/store">
                <ArrowRight className="mr-2 h-4 w-4" />
                Ir a la tienda
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">Compra con envío en México</p>
          </div>

          {/* Get Legal Help Button */}
          <div className="text-center">
            <Button size="lg" variant="outline" className="w-full mb-2" asChild>
              <Link to="/blog/cama-de-pilates-guia-de-compra">
                <Info className="mr-2 h-4 w-4" />
                Ver guía de compra
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">Consejos para elegir tu cama</p>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>Asesoría imparcial: casa vs. profesional, accesorios y servicio.</p>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
