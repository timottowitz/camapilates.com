import React from 'react';
import { Helmet } from 'react-helmet-async';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';
import { generateAboutPageSchema } from '@/lib/seo';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const About = () => {
  const aboutSchema = generateAboutPageSchema();

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>Sobre Edelweiss Pilates | Ingeniería alemana, manufactura mexicana</title>
        <meta name="description" content="Conoce Edelweiss Pilates: Reformers silenciosos y precisos en cuero genuino, nogal y acero. Ingeniería alemana con manufactura en CDMX." />
        <link rel="canonical" href={`${window.location.origin}/about`} />
        <script type="application/ld+json">
          {JSON.stringify(aboutSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-24 max-w-[1800px] mx-auto overflow-hidden">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <FadeIn>
          <span className="block text-xs font-bold font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8 opacity-60">
            Our Philosophy
          </span>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif italic text-[#2A2624] leading-[0.85] mb-12 tracking-tighter">
            German Engineering<span className="text-[#EB4C42]">.</span> <br />
            <span className="not-italic font-light font-sans tracking-tight text-[#5D5550]">Mexican Soul</span>
          </h1>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 mt-24">
          <div className="md:col-span-5">
            <FadeIn delay={0.2}>
              <div className="aspect-[3/4] w-full bg-[#D6D3CD] rounded-[2rem] overflow-hidden relative shadow-2xl">
                <img
                  src="/images/about-hero.webp"
                  alt="Pilates Studio"
                  className="absolute inset-0 w-full h-full object-cover opacity-95 hover:scale-105 transition-transform duration-[1.5s]"
                />
              </div>
              <div className="mt-6 flex justify-between text-[10px] uppercase tracking-widest text-[#5D5550] font-bold opacity-60">
                <span>Est. 2015</span>
                <span>Mexico City</span>
              </div>
            </FadeIn>
          </div>

          <div className="md:col-span-7 flex flex-col justify-center">
            <FadeIn delay={0.4}>
              <p className="text-xl md:text-3xl font-light text-[#2A2624] leading-relaxed mb-12 tracking-tight">
                We unite <span className="font-normal border-b border-[#EB4C42]">precise German engineering</span> with the warmth of Mexican craftsmanship.
                Our goal was simple: a Reformer that is completely silent,
                vibration-free, and beautiful enough to live in your home.
              </p>
              <p className="text-lg font-light text-[#5D5550] leading-relaxed mb-12 max-w-2xl">
                Every Edelweiss Reformer is hand-assembled in Mexico City using sustainable American Walnut,
                aerospace-grade aluminum, and premium full-grain leather. We don't just build equipment;
                we craft instruments for movement.
              </p>

              <div className="grid grid-cols-2 gap-12 border-t border-[#2A2624]/10 pt-12">
                <div>
                  <span className="block text-5xl md:text-6xl font-serif italic text-[#2A2624] mb-2">500<span className="text-[#EB4C42] text-3xl align-top">+</span></span>
                  <span className="text-[10px] uppercase tracking-widest text-[#5D5550] font-bold">Studios Equipped</span>
                </div>
                <div>
                  <span className="block text-5xl md:text-6xl font-serif italic text-[#2A2624] mb-2">10<span className="text-[#EB4C42] text-3xl align-top">+</span></span>
                  <span className="text-[10px] uppercase tracking-widest text-[#5D5550] font-bold">Years Experience</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="bg-[#EAE8E4] py-32 px-6 md:px-24 mt-0 relative">
        <div className="max-w-[1800px] mx-auto">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] mb-24 text-center">
              Honest Materials<span className="text-[#EB4C42]">.</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "American Walnut",
                desc: "Sourced from sustainable forests. Dense, stable, and naturally shock-absorbing.",
                img: "/images/feature_1.webp"
              },
              {
                title: "Surgical Steel",
                desc: "Structural integrity that lasts a lifetime. Precision-welded for zero flex.",
                img: "https://images.unsplash.com/photo-1535069898890-5a72d920334c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "Full Grain Leather",
                desc: "Hand-stitched upholstery that breathes and improves with age.",
                img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              }
            ].map((item, i) => (
              <FadeIn delay={i * 0.2} key={i}>
                <div className="group cursor-pointer bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-[#2A2624]/5">
                  <div className="aspect-square w-full bg-[#D6D3CD] mb-8 overflow-hidden rounded-[1.5rem] relative">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-2xl font-serif italic mb-4 text-[#2A2624] group-hover:text-[#EB4C42] transition-colors">{item.title}</h3>
                  <p className="text-sm text-[#5D5550] leading-relaxed max-w-xs opacity-80 group-hover:opacity-100">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-32 px-8 md:px-24 max-w-[1800px] mx-auto text-center border-t border-[#2A2624]/5">
        <FadeIn>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#3E2723] mb-16 opacity-50 font-bold">
            Trusted by Professional Studios
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 text-[#2A2624]">
            {/* Using text placeholders for logos to keep it clean if no SVGs available */}
            <span className="text-xl md:text-2xl font-serif italic">Pilates Madrid</span>
            <span className="text-xl md:text-2xl font-serif italic">Wellness BCN</span>
            <span className="text-xl md:text-2xl font-serif italic">Core Studio</span>
            <span className="text-xl md:text-2xl font-serif italic">Flow Space</span>
            <span className="text-xl md:text-2xl font-serif italic">Balance Hub</span>
          </div>
        </FadeIn>
      </section>

    </LuxuryLayout>
  );
};

export default About;
