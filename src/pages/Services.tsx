import React from 'react';
import { Helmet } from 'react-helmet-async';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { generateServicesSchema } from '@/lib/seo';

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

const Services = () => {
  const servicesSchema = generateServicesSchema();

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>Servicios | Edelweiss Pilates</title>
        <meta name="description" content="Servicios profesionales para estudios de Pilates: Diseño, Mantenimiento y Capacitación." />
        <link rel="canonical" href={`${window.location.origin}/services`} />
        <script type="application/ld+json">
          {JSON.stringify(servicesSchema)}
        </script>
      </Helmet>

      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-24 max-w-[1800px] mx-auto overflow-hidden">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-40 left-1/2 -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <FadeIn>
          <span className="block text-xs font-bold font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8 opacity-60">
            Expertise
          </span>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif italic text-[#2A2624] leading-[0.85] mb-12 tracking-tighter">
            Beyond the <br />
            <span className="not-italic font-light font-sans tracking-tight text-[#5D5550]">Equipment<span className="text-[#EB4C42]">.</span></span>
          </h1>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {[
            {
              title: "Studio Design",
              desc: "We help you plan your space for optimal flow and aesthetic harmony. From layout to lighting.",
              link: "/contact",
              linkText: "Start a Project"
            },
            {
              title: "Maintenance",
              desc: "Keep your reformers gliding silently. Annual service packages and express parts delivery.",
              link: "/contact",
              linkText: "Schedule Service"
            },
            {
              title: "Education",
              desc: "Certification programs for instructors on Edelweiss equipment. Master the mechanics of movement.",
              link: "/certificacion-pilates",
              linkText: "View Courses"
            }
          ].map((service, i) => (
            <FadeIn delay={i * 0.2} key={i}>
              <div className="group h-full p-8 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-[#2A2624]/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-serif italic text-[#2A2624] mb-6 group-hover:text-[#EB4C42] transition-colors">{service.title}</h3>
                  <p className="text-[#5D5550] font-light leading-relaxed mb-8">
                    {service.desc}
                  </p>
                </div>
                <Link
                  to={service.link}
                  className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#3E2723] group-hover:text-[#EB4C42] transition-colors"
                >
                  {service.linkText} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-[#2A2624] text-[#EAE8E4] py-32 px-8 md:px-24 mt-24">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-serif italic mb-8">
              Partner with <br />
              <span className="font-sans not-italic font-light">Perfection.</span>
            </h2>
            <p className="text-white/60 font-light leading-relaxed mb-12 max-w-md">
              Whether you are opening a new studio or upgrading your home practice,
              we are here to support your journey with technical expertise and design guidance.
            </p>
            <Link
              to="/contact"
              className="inline-block px-10 py-4 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
            >
              Contact Us
            </Link>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="aspect-square bg-white/5 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3E2723]/50 to-transparent" />
              <span className="font-serif italic text-9xl opacity-10">E</span>
            </div>
          </FadeIn>
        </div>
      </section>

    </LuxuryLayout>
  );
};

export default Services;
