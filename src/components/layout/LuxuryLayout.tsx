import React from 'react';
import { Link } from 'react-router-dom';
import EdelweissNav from './EdelweissNav';

interface LuxuryLayoutProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    /** Set to 'dark' for pages with dark hero backgrounds that need light nav text */
    headerTheme?: 'light' | 'dark';
}

const LuxuryLayout = ({ children, className = "", noPadding = false, headerTheme }: LuxuryLayoutProps) => {
    return (
        <div className={`min-h-screen bg-[#EAE8E4] text-[#2A2624] font-sans selection:bg-[#3E2723] selection:text-white ${className}`}>
            <EdelweissNav darkBackground={headerTheme === 'dark'} />

            <main className={noPadding ? "" : "pt-20 sm:pt-24"}>
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
                                <li><Link to="/shop/category/reformers" className="hover:text-white transition-colors">Reformers</Link></li>
                                <li><Link to="/reformer-para-casa" className="hover:text-white transition-colors">Reformer para Casa</Link></li>
                                <li><Link to="/reformer-para-estudio" className="hover:text-white transition-colors">Reformer para Estudio</Link></li>
                                <li><Link to="/about" className="hover:text-white transition-colors">Nuestra Historia</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 text-white/40">Contacto</h4>
                            <ul className="space-y-4 text-sm font-light text-white/80">
                                <li><a href="mailto:hello@camadepilates.com" className="hover:text-white transition-colors">hello@camadepilates.com</a></li>
                                <li><a href="https://wa.me/525548468190" className="hover:text-white transition-colors">Soporte WhatsApp</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between text-xs text-white/40 uppercase tracking-widest">
                        <p>&copy; {new Date().getFullYear()} Edelweiss</p>
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
