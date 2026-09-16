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

            {/* Comprehensive SEO & Internal Linking Footer */}
            <footer className="bg-[#2A2624] text-[#EAE8E4] py-20 px-8 md:px-24 mt-24">
                <div className="max-w-[1800px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                        <div className="lg:col-span-1">
                            <h3 className="text-3xl font-serif italic mb-6">Edelweiss</h3>
                            <p className="text-white/60 font-light text-sm leading-relaxed mb-6">
                                El primer ecosistema de Pilates Reformer libre de plásticos en México.
                                Maderas nobles, cuero genuino e ingeniería alemana.
                            </p>
                            <div className="space-y-2 text-xs text-white/60">
                                <p><a href="mailto:hello@camadepilates.com" className="hover:text-white transition-colors">hello@camadepilates.com</a></p>
                                <p><a href="https://wa.me/525548468190" className="hover:text-white transition-colors">WhatsApp: +52 55 4846 8190</a></p>
                                <p>Ciudad de México · Envíos a todo el país</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 text-white/40 font-semibold">Equipamiento</h4>
                            <ul className="space-y-3 text-xs font-light text-white/80">
                                <li><Link to="/cama-de-pilates" className="hover:text-white transition-colors">Camas de Pilates en México</Link></li>
                                <li><Link to="/cama-de-pilates/precio" className="hover:text-white transition-colors">Precios de Camas de Pilates</Link></li>
                                <li><Link to="/reformer-para-casa" className="hover:text-white transition-colors">Reformer para Casa</Link></li>
                                <li><Link to="/reformer-para-estudio" className="hover:text-white transition-colors">Reformer para Estudio</Link></li>
                                <li><Link to="/packs/estudio" className="hover:text-white transition-colors">Packs Estudio (8+ Camas)</Link></li>
                                <li><Link to="/shop/category/reformers" className="hover:text-white transition-colors">Catálogo de Reformers</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 text-white/40 font-semibold">Certificaciones</h4>
                            <ul className="space-y-3 text-xs font-light text-white/80">
                                <li><Link to="/certificacion-pilates" className="hover:text-white transition-colors">Certificación Reformer México</Link></li>
                                <li><Link to="/certificacion-pilates/monterrey" className="hover:text-white transition-colors">Sede Monterrey (NL)</Link></li>
                                <li><Link to="/certificacion-pilates/queretaro" className="hover:text-white transition-colors">Sede Querétaro</Link></li>
                                <li><Link to="/certificacion-pilates/puebla" className="hover:text-white transition-colors">Sede Puebla</Link></li>
                                <li><Link to="/certificacion-pilates/guadalajara" className="hover:text-white transition-colors">Sede Guadalajara</Link></li>
                                <li><Link to="/certificacion-pilates/cdmx" className="hover:text-white transition-colors">STOTT CDMX</Link></li>
                                <li><Link to="/app" className="hover:text-white transition-colors">Campus Virtual & Whop Hub</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 text-white/40 font-semibold">Directorio</h4>
                            <ul className="space-y-3 text-xs font-light text-white/80">
                                <li><Link to="/estudios-de-pilates" className="hover:text-white transition-colors">Directorio de Estudios México</Link></li>
                                <li><Link to="/estudios-de-pilates/ciudad-de-mexico" className="hover:text-white transition-colors">Estudios en CDMX</Link></li>
                                <li><Link to="/estudios-de-pilates/monterrey" className="hover:text-white transition-colors">Estudios en Monterrey</Link></li>
                                <li><Link to="/estudios-de-pilates/guadalajara" className="hover:text-white transition-colors">Estudios en Guadalajara</Link></li>
                                <li><Link to="/pilates-reformer-cdmx" className="hover:text-white transition-colors">Pilates Reformer CDMX</Link></li>
                                <li><Link to="/instructores-pilates" className="hover:text-white transition-colors">Directorio de Instructores</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 text-white/40 font-semibold">Recursos & Tienda</h4>
                            <ul className="space-y-3 text-xs font-light text-white/80">
                                <li><Link to="/blog" className="hover:text-white transition-colors">The Journal</Link></li>
                                <li><Link to="/blog/category/guias-de-compra" className="hover:text-white transition-colors">Guías de Compra</Link></li>
                                <li><Link to="/blog/category/comparativas" className="hover:text-white transition-colors">Comparativas de Reformer</Link></li>
                                <li><Link to="/shop" className="hover:text-white transition-colors">Tienda Online</Link></li>
                                <li><Link to="/shop/category/ropa" className="hover:text-white transition-colors">Ropa & Calcetines</Link></li>
                                <li><Link to="/mapa-del-sitio" className="hover:text-white transition-colors">Mapa del Sitio</Link></li>
                                <li><Link to="/about" className="hover:text-white transition-colors">Sobre Edelweiss</Link></li>
                                <li><Link to="/soporte" className="hover:text-white transition-colors">Garantía & Soporte</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 uppercase tracking-widest gap-4">
                        <p>&copy; {new Date().getFullYear()} Edelweiss Pilates · CAMA Pilates México</p>
                        <div className="flex gap-6">
                            <Link to="/mapa-del-sitio" className="hover:text-white transition-colors">Mapa del Sitio</Link>
                            <Link to="/legal/terminos" className="hover:text-white transition-colors">Términos</Link>
                            <Link to="/legal/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LuxuryLayout;
