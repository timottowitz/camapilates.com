import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

const LegalTerms: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/legal/terminos`;
  return (
    <LuxuryLayout>
      <Helmet>
        <title>Términos y Condiciones | {DEFAULTS.siteName}</title>
        <meta name="description" content="Términos de servicio y condiciones de compra para Edelweiss Pilates." />
        <link rel="canonical" href={url} />
      </Helmet>
      <section className="pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] mb-12">Terms & Conditions</h1>
        <div className="prose prose-lg max-w-3xl text-[#5D5550] font-light">
          <p className="lead text-xl text-[#2A2624] font-normal mb-8">
            Resumen: ventas en MX con pago seguro, tiempos de envío, garantía 1 año, repuestos exprés y políticas de devolución (14 días sin uso). Para detalles operativos o cotizaciones de estudio, contáctanos.
          </p>

          <h3 className="font-serif italic text-[#2A2624] mt-12 mb-4">1. General</h3>
          <p>
            Bienvenido a Edelweiss Pilates. Al utilizar nuestro sitio web y realizar compras, aceptas estos términos y condiciones en su totalidad. Nos reservamos el derecho de modificar estos términos en cualquier momento.
          </p>

          <h3 className="font-serif italic text-[#2A2624] mt-12 mb-4">2. Envíos y Entregas</h3>
          <p>
            Realizamos envíos a todo México. El tiempo estimado de entrega es de 3 semanas hábiles para pedidos estándar. Para pedidos de estudio o personalizados, el tiempo puede variar y se confirmará al momento de la compra.
          </p>

          <h3 className="font-serif italic text-[#2A2624] mt-12 mb-4">3. Garantía</h3>
          <p>
            Ofrecemos una garantía de 1 año contra defectos de fabricación en estructura, muelles y componentes mecánicos. Esta garantía no cubre el desgaste normal por uso, daños accidentales o uso indebido del equipo.
          </p>

          <h3 className="font-serif italic text-[#2A2624] mt-12 mb-4">4. Devoluciones</h3>
          <p>
            Aceptamos devoluciones dentro de los 14 días posteriores a la recepción del producto, siempre y cuando el equipo no haya sido utilizado y se encuentre en su empaque original. Los costos de envío de la devolución corren por cuenta del cliente, salvo en casos de defecto de fábrica.
          </p>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default LegalTerms;
