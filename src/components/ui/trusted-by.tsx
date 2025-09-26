import React from 'react';

type Logo = { src: string; alt: string };

export const TrustedBy: React.FC<{ title?: string; items?: string[]; logos?: Logo[] }> = ({ title = 'Confiado por estudios e instructoras en México', items, logos }) => {
  const list = items && items.length > 0 ? items : ['CDMX', 'Guadalajara', 'Monterrey', 'Querétaro', 'Puebla', 'Mérida'];
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-10">
        <p className="text-center text-sm text-muted-foreground mb-6">{title}</p>
        {logos && logos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {logos.map((l, i) => (
              <div key={i} className="rounded-xl bg-white border border-border shadow-sm py-6 grid place-content-center">
                <img src={l.src} alt={l.alt} className="h-6 w-auto opacity-80" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {list.map((x) => (
              <div key={x} className="rounded-xl bg-white border border-border shadow-sm py-6 text-center text-sm font-medium text-foreground">
                {x}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
