import React from 'react';
import { pickImage } from '@/lib/assets';
import { Link } from 'react-router-dom';

type Item = { label: string; desc: string; href: string; img?: string; alt?: string };

const SEO_ALT_MAP: Record<string, string> = {
  'Reformers': 'Camas de pilates reformer Edelweiss de madera de nogal - equipo silencioso y preciso para casa y estudio profesional',
  'Accesorios': 'Accesorios para pilates reformer - cintas de algodon organico y calcetines antideslizantes Edelweiss',
  'Ropa': 'Ropa de pilates de algodon organico Edelweiss - leggings tops y conjuntos fitted y relaxed sin plasticos',
  'Terapia de Luz': 'Paneles de luz roja e infrarroja para pilates - terapia de recuperacion muscular para estudios y casa',
};

const ExploreTiles21: React.FC<{ items: Item[] }> = ({ items }) => {
  if (!items?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-foreground mb-3">Explora nuestra gama</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((it) => (
          <Link key={it.href} to={it.href} className="group border border-border rounded-lg overflow-hidden bg-card hover:border-primary/50">
            <div className="aspect-[16/7] w-full bg-muted overflow-hidden">
              <img src={it.img || pickImage(it.label)} alt={it.alt || SEO_ALT_MAP[it.label] || `${it.label} - ${it.desc} Edelweiss Pilates Mexico`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" decoding="async" />
            </div>
            <div className="p-4">
              <div className="font-semibold text-foreground group-hover:text-primary">{it.label}</div>
              <p className="text-sm text-muted-foreground mt-1">{it.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ExploreTiles21;
