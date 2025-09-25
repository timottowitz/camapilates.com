
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-gray-700">© {new Date().getFullYear()} camadepilates.com</div>
        <nav className="flex items-center gap-6 text-sm text-gray-700">
          <a href="/store" className="hover:text-black">Tienda</a>
          <a href="/blog" className="hover:text-black">Blog</a>
          <a href="#faq" className="hover:text-black">FAQ</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
