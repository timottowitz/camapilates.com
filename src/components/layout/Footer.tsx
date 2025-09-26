
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/brand/edelweiss.svg" alt="Edelweiss Pilates" className="h-8 w-auto" />
            <span className="text-base font-semibold text-foreground">Edelweiss Pilates</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Reformers silenciosos y precisos con cuero genuino, madera de nogal y acero. Ingeniería alemana, manufactura mexicana.
          </p>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-primary"><Instagram className="h-5 w-5" /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-primary"><Youtube className="h-5 w-5" /></a>
            <a href="mailto:ventas@camadepilates.com" className="hover:text-primary"><Mail className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Comprar */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">Comprar</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/cama-de-pilates/en-venta" className="hover:text-primary">Cama de Pilates en venta</Link></li>
            <li><Link to="/product/reformer-profesional" className="hover:text-primary">Reformer de Estudio</Link></li>
            <li><Link to="/product/reformer-casa" className="hover:text-primary">Reformer para Casa</Link></li>
            <li><Link to="/packs/estudio" className="hover:text-primary">Paquete de Estudio (8+)</Link></li>
            <li><Link to="/acabados" className="hover:text-primary">Acabados</Link></li>
            <li><Link to="/store" className="hover:text-primary">Tienda</Link></li>
          </ul>
        </div>

        {/* Guías */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">Guías</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/cama-de-pilates/precio" className="hover:text-primary">Precio de cama de Pilates</Link></li>
            <li><Link to="/blog/dimensiones-cama-de-pilates" className="hover:text-primary">Dimensiones y espacios</Link></li>
            <li><Link to="/blog/accesorios-cama-de-pilates" className="hover:text-primary">Accesorios imprescindibles</Link></li>
            <li><Link to="/blog/reformer-casa-vs-profesional" className="hover:text-primary">Casa vs Estudio</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Ver blog</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="mailto:ventas@camadepilates.com" className="hover:text-primary">ventas@camadepilates.com</a></li>
            <li><a href="https://wa.me/5210000000000" className="hover:text-primary">WhatsApp</a></li>
            <li>CDMX • Envío nacional 5–7 días</li>
          </ul>
          <div className="mt-4">
            <Link to="/packs/estudio" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm">Cotizar pack de estudio</Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Edelweiss Pilates</div>
          <div className="flex items-center gap-4">
            <Link to="/legal/terminos" className="hover:text-primary">Términos</Link>
            <Link to="/legal/privacidad" className="hover:text-primary">Privacidad</Link>
            <Link to="/soporte" className="hover:text-primary">Soporte</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
