import React from 'react';
import { Helmet } from 'react-helmet-async';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';

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
  return (
    <LuxuryLayout>
      <Helmet>
        <title>Sobre Edelweiss Pilates | Ingeniería alemana, manufactura mexicana</title>
        <meta name="description" content="Conoce Edelweiss Pilates: Reformers silenciosos y precisos en cuero genuino, nogal y acero. Ingeniería alemana con manufactura en CDMX." />
        <link rel="canonical" href={`${window.location.origin}/about`} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <FadeIn>
          <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8">
            Our Philosophy
          </span>
          <h1 className="text-5xl md:text-8xl font-serif italic text-[#2A2624] leading-[0.9] mb-12">
            German Engineering. <br />
            <span className="not-italic font-light font-sans tracking-tight">Mexican Soul.</span>
          </h1>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 mt-24">
          <div className="md:col-span-5">
            <FadeIn delay={0.2}>
              <div className="aspect-[3/4] w-full bg-[#D6D3CD] rounded-sm overflow-hidden relative">
                <img
                  src="/images/about-hero.webp"
                  alt="Pilates Studio"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="mt-4 flex justify-between text-xs uppercase tracking-widest text-[#5D5550]">
                <span>Est. 2015</span>
                <span>Mexico City</span>
              </div>
            </FadeIn>
          </div>

          <div className="md:col-span-7 flex flex-col justify-center">
            <FadeIn delay={0.4}>
              <p className="text-xl md:text-2xl font-light text-[#5D5550] leading-relaxed mb-12">
                We unite precise German engineering with the warmth of Mexican craftsmanship.
                Our goal was simple but ambitious: to create a Reformer that is completely silent,
                vibration-free, and beautiful enough to live in your home.
              </p>
              <p className="text-lg font-light text-[#5D5550] leading-relaxed mb-12">
                Every Edelweiss Reformer is hand-assembled in Mexico City using sustainable American Walnut,
                aerospace-grade aluminum, and premium full-grain leather. We don't just build equipment;
                we craft instruments for movement.
              </p>

              <div className="grid grid-cols-2 gap-12 border-t border-[#2A2624]/10 pt-12">
                <div>
                  <span className="block text-4xl font-serif italic text-[#2A2624] mb-2">500+</span>
                  <span className="text-xs uppercase tracking-widest text-[#5D5550]">Studios Equipped</span>
                </div>
                <div>
                  <span className="block text-4xl font-serif italic text-[#2A2624] mb-2">10+</span>
                  <span className="text-xs uppercase tracking-widest text-[#5D5550]">Years Experience</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="bg-[#E3E0DB] py-32 px-8 md:px-24 mt-24">
        <div className="max-w-[1800px] mx-auto">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] mb-24 text-center">
              Honest Materials
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
                <div className="group cursor-pointer">
                  <div className="aspect-square w-full bg-[#D6D3CD] mb-8 overflow-hidden relative">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <h3 className="text-2xl font-serif italic mb-4">{item.title}</h3>
                  <p className="text-sm text-[#5D5550] leading-relaxed max-w-xs">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-32 px-8 md:px-24 max-w-[1800px] mx-auto text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] text-[#3E2723] mb-16">
            Trusted by Professional Studios
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Using text placeholders for logos to keep it clean if no SVGs available */}
            <span className="text-xl font-serif italic">Pilates Madrid</span>
            <span className="text-xl font-serif italic">Wellness BCN</span>
            <span className="text-xl font-serif italic">Core Studio</span>
            <span className="text-xl font-serif italic">Flow Space</span>
            <span className="text-xl font-serif italic">Balance Hub</span>
          </div>
        </FadeIn>
      </section>

    </LuxuryLayout>
  );
};

export default About;
