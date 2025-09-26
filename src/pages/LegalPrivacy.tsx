import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';

const LegalPrivacy: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/legal/privacidad`;
  return (
    <>
      <Helmet>
        <title>Aviso de Privacidad | {DEFAULTS.siteName}</title>
        <meta name="description" content="Cómo recopilamos y protegemos tus datos en Edelweiss Pilates." />
        <link rel="canonical" href={url} />
      </Helmet>
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Aviso de Privacidad</h1>
          <p className="text-muted-foreground">Usamos datos mínimos para procesar pedidos, cotizaciones y soporte. No vendemos información a terceros. Puedes solicitar acceso o eliminación de tus datos escribiendo a ventas@camadepilates.com.</p>
        </div>
      </section>
    </>
  );
};

export default LegalPrivacy;
