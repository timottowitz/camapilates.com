import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';

const Support: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/soporte`;
  return (
    <>
      <Helmet>
        <title>Soporte y Garantía | {DEFAULTS.siteName}</title>
        <meta name="description" content="Garantía 3 años, repuestos exprés y atención en español. Contáctanos por email o WhatsApp." />
        <link rel="canonical" href={url} />
      </Helmet>
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Soporte y Garantía</h1>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>Garantía de 3 años para Reformers de estudio y casa.</li>
            <li>Repuestos exprés con guía de instalación en video.</li>
            <li>Atención en español. Escríbenos a ventas@camadepilates.com o vía WhatsApp.</li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default Support;
