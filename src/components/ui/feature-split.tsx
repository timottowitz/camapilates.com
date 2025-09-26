import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  copy: string;
  cta?: { href: string; label: string };
  image?: { src: string; alt: string };
}

export const FeatureSplit: React.FC<Props> = ({ title, copy, cta, image }) => {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center rounded-2xl border border-border bg-white/70 backdrop-blur p-6">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h2>
            <p className="text-muted-foreground mb-4">{copy}</p>
            {cta && (
              <Link to={cta.href} className="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                {cta.label}
              </Link>
            )}
          </div>
          <div className="order-1 md:order-2">
            <div className="relative overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-video w-full">
                {image ? (
                  <img src={image.src} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid place-content-center h-full w-full text-sm text-muted-foreground">Imagen del Reformer</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
