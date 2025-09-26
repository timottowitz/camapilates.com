import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';

const LegalTerms: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/legal/terminos`;
  return (
    <>
      <Helmet>
        <title>Términos y Condiciones | {DEFAULTS.siteName}</title>
        <meta name="description" content="Términos de servicio y condiciones de compra para Edelweiss Pilates." />
        <link rel="canonical" href={url} />
      </Helmet>
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Términos y Condiciones</h1>
          <p className="text-muted-foreground">Resumen: ventas en MX con pago seguro, tiempos de envío, garantía 3 años, repuestos exprés y políticas de devolución (14 días sin uso). Para detalles operativos o cotizaciones de estudio, contáctanos.</p>
        </div>
      </section>
    </>
  );
};

export default LegalTerms;
