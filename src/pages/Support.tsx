import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { requireRouteMeta } from '@/lib/routeMeta';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { MessageCircle, Mail, Shield, Wrench } from 'lucide-react';

const Support: React.FC = () => {
  const { title, description: desc } = requireRouteMeta('/soporte');
  const origin = getOrigin();
  const url = `${origin}/soporte`;
  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
      </Helmet>

      <section className="pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              Customer Care
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
              We're Here <br />
              <span className="not-italic font-light font-sans tracking-tight">to Help.</span>
            </h1>
            <p className="text-lg text-[#5D5550] font-light max-w-xl leading-relaxed mb-12">
              Nuestro compromiso no termina con la venta. Ofrecemos soporte técnico, repuestos y garantía para asegurar que tu experiencia sea impecable.
            </p>

            <div className="flex flex-col gap-6">
              <a href="https://wa.me/525548468190" className="group flex items-center gap-4 p-6 border border-[#2A2624]/10 rounded-sm hover:bg-white transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#2A2624] flex items-center justify-center text-[#EAE8E4] group-hover:bg-[#3E2723] transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif italic text-xl text-[#2A2624]">WhatsApp Support</h3>
                  <p className="text-sm text-[#5D5550] font-light">Respuesta inmediata en horario laboral</p>
                </div>
              </a>

              <a href="mailto:ventas@camadepilates.com" className="group flex items-center gap-4 p-6 border border-[#2A2624]/10 rounded-sm hover:bg-white transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#EAE8E4] flex items-center justify-center text-[#2A2624] border border-[#2A2624] group-hover:bg-[#2A2624] group-hover:text-[#EAE8E4] transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif italic text-xl text-[#2A2624]">Email Us</h3>
                  <p className="text-sm text-[#5D5550] font-light">ventas@camadepilates.com</p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white/50 border border-[#2A2624]/10 p-8 md:p-12 rounded-sm backdrop-blur-sm">
            <h2 className="text-2xl font-serif italic text-[#2A2624] mb-8">Warranty & Service</h2>

            <div className="space-y-8">
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-[#3E2723] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-[#2A2624] mb-2">1 Year Warranty</h3>
                  <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                    Cobertura completa contra defectos de fabricación en estructura, soldaduras y componentes mecánicos principales.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Wrench className="w-6 h-6 text-[#3E2723] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-[#2A2624] mb-2">Express Parts</h3>
                  <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                    Mantenemos stock de repuestos en CDMX para envío inmediato. Incluimos guías de instalación en video para mantenimiento sencillo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default Support;
