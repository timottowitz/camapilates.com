import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

const LegalPrivacy: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/legal/privacidad`;
  return (
    <LuxuryLayout>
      <Helmet>
        <title>Aviso de Privacidad | {DEFAULTS.siteName}</title>
        <meta name="description" content="Cómo recopilamos y protegemos tus datos en Edelweiss Pilates." />
        <link rel="canonical" href={url} />
      </Helmet>
      <section className="pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] mb-12">Privacy Policy</h1>
        <div className="prose prose-lg max-w-3xl text-[#5D5550] font-light">
          <p className="lead text-xl text-[#2A2624] font-normal mb-8">
            Usamos datos mínimos para procesar pedidos, cotizaciones y soporte. No vendemos información a terceros. Puedes solicitar acceso o eliminación de tus datos escribiendo a ventas@camadepilates.com.
          </p>

          <h3 className="font-serif italic text-[#2A2624] mt-12 mb-4">Recopilación de Datos</h3>
          <p>
            Recopilamos información personal que nos proporcionas voluntariamente al realizar una compra, solicitar una cotización o suscribirte a nuestro boletín. Esto incluye tu nombre, dirección de correo electrónico, dirección de envío y número de teléfono.
          </p>

          <h3 className="font-serif italic text-[#2A2624] mt-12 mb-4">Uso de la Información</h3>
          <p>
            Utilizamos tu información para procesar tus pedidos, comunicarnos contigo sobre el estado de tu compra y enviarte información relevante sobre nuestros productos y servicios.
          </p>

          <h3 className="font-serif italic text-[#2A2624] mt-12 mb-4">Seguridad</h3>
          <p>
            Tomamos medidas razonables para proteger tu información personal contra pérdida, robo y uso no autorizado. Utilizamos tecnología de encriptación SSL para proteger tus datos durante la transmisión.
          </p>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default LegalPrivacy;
