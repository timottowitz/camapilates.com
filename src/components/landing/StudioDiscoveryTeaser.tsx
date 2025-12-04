import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, ChevronRight } from 'lucide-react';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const topCities = [
  { name: 'CDMX', slug: 'ciudad-de-mexico', count: 180 },
  { name: 'Guadalajara', slug: 'guadalajara', count: 45 },
  { name: 'Monterrey', slug: 'monterrey', count: 38 },
  { name: 'Querétaro', slug: 'queretaro', count: 22 },
  { name: 'Puebla', slug: 'puebla', count: 18 },
  { name: 'Cancún', slug: 'cancun', count: 15 },
];

const StudioDiscoveryTeaser: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/estudios-de-pilates?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/estudios-de-pilates');
    }
  };

  return (
    <section className="w-full bg-[#2A2624] text-[#EAE8E4] py-20 md:py-28 overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-8 md:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left: Content */}
          <div>
            <FadeIn>
              <span className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4 block">
                Directorio de Estudios
              </span>
              <h2 className="text-3xl md:text-5xl font-serif italic leading-tight mb-6">
                Encuentra Pilates
                <br />
                <span className="text-white/70">Cerca de Ti</span>
              </h2>
              <p className="text-white/60 font-light leading-relaxed mb-8 max-w-md">
                Explora más de 500 estudios de pilates reformer en todo México. 
                Horarios, precios, reseñas y más.
              </p>
            </FadeIn>

            {/* Search Box */}
            <FadeIn delay={0.1}>
              <form onSubmit={handleSearch} className="mb-10">
                <div className="flex items-center bg-white/10 rounded-full p-1.5 max-w-md border border-white/10 focus-within:border-white/30 transition-colors">
                  <div className="pl-4 pr-2">
                    <Search className="w-5 h-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ciudad, colonia o código postal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-white/40 py-3 px-2 text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#EAE8E4] text-[#2A2624] px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] hover:bg-white transition-colors"
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </FadeIn>

            {/* Top Cities */}
            <FadeIn delay={0.2}>
              <div>
                <span className="text-xs tracking-[0.15em] uppercase text-white/40 mb-4 block">
                  Ciudades Populares
                </span>
                <div className="flex flex-wrap gap-3">
                  {topCities.map((city) => (
                    <Link
                      key={city.slug}
                      to={`/estudios-de-pilates/${city.slug}`}
                      className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                        {city.name}
                      </span>
                      <span className="text-xs text-white/40">
                        {city.count}+
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* CTA */}
            <FadeIn delay={0.3}>
              <Link
                to="/estudios-de-pilates"
                className="inline-flex items-center gap-2 mt-10 text-xs uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors group"
              >
                Ver Todos los Estudios
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </FadeIn>
          </div>

          {/* Right: Visual (Abstract Mexico map representation) */}
          <FadeIn delay={0.2}>
            <div className="relative">
              {/* Decorative circles representing cities */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent rounded-full" />
                
                {/* Mexico outline approximation with dots */}
                <div className="absolute inset-0">
                  {/* CDMX - center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-[#A0593D] rounded-full animate-pulse" />
                    <div className="absolute -inset-4 bg-[#A0593D]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  </div>
                  
                  {/* Guadalajara - west */}
                  <div className="absolute top-[45%] left-[25%]">
                    <div className="w-4 h-4 bg-[#7A8A6F] rounded-full" />
                  </div>
                  
                  {/* Monterrey - north */}
                  <div className="absolute top-[25%] left-[55%]">
                    <div className="w-4 h-4 bg-[#5D7A99] rounded-full" />
                  </div>
                  
                  {/* Cancun - east */}
                  <div className="absolute top-[55%] right-[15%]">
                    <div className="w-3 h-3 bg-[#8B7355] rounded-full" />
                  </div>
                  
                  {/* Puebla - southeast of CDMX */}
                  <div className="absolute top-[58%] left-[55%]">
                    <div className="w-3 h-3 bg-white/40 rounded-full" />
                  </div>
                  
                  {/* Queretaro - north of CDMX */}
                  <div className="absolute top-[38%] left-[45%]">
                    <div className="w-3 h-3 bg-white/40 rounded-full" />
                  </div>

                  {/* Smaller dots for other cities */}
                  <div className="absolute top-[30%] left-[20%] w-2 h-2 bg-white/20 rounded-full" />
                  <div className="absolute top-[65%] left-[30%] w-2 h-2 bg-white/20 rounded-full" />
                  <div className="absolute top-[40%] right-[30%] w-2 h-2 bg-white/20 rounded-full" />
                  <div className="absolute top-[70%] left-[50%] w-2 h-2 bg-white/20 rounded-full" />
                </div>

                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <div className="text-5xl font-serif italic text-white/90">500+</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-2">Estudios en México</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default StudioDiscoveryTeaser;
