import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-gray-900">camadepilates.com</Link>
        <nav className="flex items-center gap-6 text-sm text-gray-700">
          <Link to="/store" className="hover:text-black">Tienda</Link>
          <Link to="/blog" className="hover:text-black">Blog</Link>
          <a href="#faq" className="hover:text-black">FAQ</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

