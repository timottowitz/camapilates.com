import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface LuxuryLayoutProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

const LuxuryLayout = ({ children, className = "", noPadding = false }: LuxuryLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    
    // Pages with dark hero backgrounds that need white text initially
    const darkHeroPages = ['/', '/compare'];
    const hasDarkHero = darkHeroPages.includes(location.pathname);

    useEffect(() => {
        const handleScroll = () => {
            // Switch to blend mode after scrolling past hero (~500px)
            setIsScrolled(window.scrollY > 500);
        };
        
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/shop', label: 'Tienda' },
        { to: '/compare', label: 'Comparar' },
        { to: '/blog', label: 'Blog' },
        { to: '/estudios-de-pilates', label: 'Buscar Estudio' },
        { to: '/certificacion-pilates', label: 'Certificación' },
        { to: '/about', label: 'Nosotros' },
    ];

    return (
        <div className={`min-h-screen bg-[#EAE8E4] text-[#2A2624] font-sans selection:bg-[#3E2723] selection:text-white ${className}`}>
            {/* Minimal Header */}
            {/* On dark hero pages: white text until scrolled, then blend mode */}
            {/* On other pages: always use blend mode */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center transition-colors duration-300 ${
                    hasDarkHero && !isScrolled 
                        ? 'text-white' 
                        : 'mix-blend-difference text-[#EAE8E4]'
                }`}
            >
                <Link to="/" className="text-xl font-serif italic tracking-tight z-50 relative">
                    Edelweiss
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex gap-8 text-xs uppercase tracking-[0.2em]">
                    {navLinks.map(link => (
                        <Link key={link.to} to={link.to} className="hover:opacity-70 transition-opacity">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile Nav Toggle */}
                <button
                    className={`lg:hidden z-50 relative hover:opacity-70 transition-opacity ${
                        hasDarkHero && !isScrolled ? 'text-white' : 'text-[#EAE8E4]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 bg-[#2A2624] text-[#EAE8E4] flex flex-col items-center justify-center z-40"
                        >
                            <nav className="flex flex-col gap-8 text-center">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="text-2xl font-serif italic hover:text-[#EAE8E4]/70 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className={noPadding ? "" : "pt-24"}>
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="bg-[#2A2624] text-[#EAE8E4] py-24 px-8 md:px-24 mt-24">
                <div className="max-w-[1800px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-3xl font-serif italic mb-8">Edelweiss</h3>
                            <p className="text-white/60 font-light max-w-md">
                                El primer ecosistema de pilates libre de plásticos.
                                Forma pura. Materiales puros. Piel sana.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 text-white/40">Explorar</h4>
                            <ul className="space-y-4 text-sm font-light text-white/80">
                                <li><Link to="/shop" className="hover:text-white transition-colors">Ver Colección</Link></li>
                                <li><Link to="/compare" className="hover:text-white transition-colors">Comparar Modelos</Link></li>
                                <li><Link to="/about" className="hover:text-white transition-colors">Nuestra Historia</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 text-white/40">Contacto</h4>
                            <ul className="space-y-4 text-sm font-light text-white/80">
                                <li><a href="mailto:hello@camadepilates.com" className="hover:text-white transition-colors">hello@camadepilates.com</a></li>
                                <li><a href="https://wa.me/523222787690" className="hover:text-white transition-colors">Soporte WhatsApp</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between text-xs text-white/40 uppercase tracking-widest">
                        <p>&copy; 2025 Edelweiss</p>
                        <div className="flex gap-8 mt-4 md:mt-0">
                            <Link to="/legal/terminos">Términos</Link>
                            <Link to="/legal/privacidad">Privacidad</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LuxuryLayout;
