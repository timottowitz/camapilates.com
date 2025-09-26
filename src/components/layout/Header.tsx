import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/brand/edelweiss.svg" alt="CAMA Pilates" className="h-7 w-auto" />
          <span className="text-sm md:text-base font-semibold tracking-tight text-gray-900">CAMA Pilates</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gray-700">
          <Link to="/about" className="hover:text-black">Acerca de</Link>
          <Link to="/store" className="hover:text-black">Tienda</Link>
          <Link to="/acabados" className="hover:text-black">Acabados</Link>
          <Link to="/accesorios" className="hover:text-black">Accesorios</Link>
          <Link to="/blog" className="hover:text-black">Blog</Link>
          <Link to="/packs/estudio" className="hover:text-black">Paquete de Estudio (8+)</Link>
          <Link to="/certificacion-pilates" className="hover:text-black">Certificación</Link>
          <a href="#faq" className="hover:text-black">FAQ</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
