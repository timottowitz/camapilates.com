import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import ShoprocketCart from '@/components/commerce21/ShoprocketCart';
import { allProducts } from '@/lib/shop/catalog';
import { getVersionedImageUrl } from '@/hooks/useVersionedImage';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3" onClick={closeMenu}>
          <img src={getVersionedImageUrl('/brand/edelweiss.svg')} alt="CAMA Pilates" className="h-6 w-auto md:h-7" />
          <span className="text-xs sm:text-sm md:text-base font-semibold tracking-tight text-gray-900">
            <span className="hidden sm:inline">Edelweiss Pilates</span>
            <span className="sm:hidden">Edelweiss</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm text-gray-700">
          <Link to="/about" className="hover:text-black transition-colors">Acerca de</Link>
          <Link to="/shop" className="hover:text-black transition-colors">Tienda</Link>
          <Link to="/blog" className="hover:text-black transition-colors">Blog</Link>
          <Link to="/estudios-de-pilates" className="hover:text-black transition-colors">Estudios</Link>
          <Link to="/packs/estudio" className="hover:text-black transition-colors">Paquete de Estudio (8+)</Link>
          <Link to="/certificacion-pilates" className="hover:text-black transition-colors">Certificación</Link>
        </nav>

        {/* Desktop Cart & Mobile Menu Button */}
        <div className="flex items-center gap-2">
          {/* Desktop Cart */}
          <div className="hidden md:block">
            {(() => {
              const p = allProducts()[0];
              return p ? <ShoprocketCart publishableKey={p.publishableKey} /> : null;
            })()}
          </div>

          {/* Mobile Cart Icon */}
          <div className="md:hidden">
            {(() => {
              const p = allProducts()[0];
              return p ? (
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                  <ShoprocketCart publishableKey={p.publishableKey} />
                </div>
              ) : (
                <ShoppingCart className="h-5 w-5 text-gray-700" />
              );
            })()}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-white/95 backdrop-blur">
          <nav className="container py-4 flex flex-col space-y-3">
            <Link
              to="/about"
              className="px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              Acerca de
            </Link>
            <Link
              to="/shop"
              className="px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              Tienda
            </Link>
            <Link
              to="/blog"
              className="px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              Blog
            </Link>
            <Link
              to="/estudios-de-pilates"
              className="px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              Estudios
            </Link>
            <Link
              to="/packs/estudio"
              className="px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              Paquete de Estudio (8+)
            </Link>
            <Link
              to="/certificacion-pilates"
              className="px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              Certificación
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
