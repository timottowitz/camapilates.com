import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import LuxuryLayout from "@/components/layout/LuxuryLayout";
import products from "@/content/products.json";
import { DEFAULTS, generateBreadcrumbSchema, getOrigin } from "@/lib/seo";
import { requireRouteMeta } from "@/lib/routeMeta";
import { ArrowRight, Building2 } from "lucide-react";

type ReformerProduct = {
  slug: string;
  name: string;
  description: string;
  image: string;
  price: string;
  currency: string;
  availability: string;
  category: string;
};

const ReformerParaEstudio: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/reformer-para-estudio`;
  const { title, description } = requireRouteMeta("/reformer-para-estudio");
  const reformers = (products as ReformerProduct[]).filter(
    (product) =>
      product.category === "Reformers" &&
      product.availability === "https://schema.org/InStock",
  );

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Reformers para estudio",
    numberOfItems: reformers.length,
    itemListElement: reformers.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${origin}/product/${product.slug}`,
      name: product.name,
    })),
  };
  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Reformer para estudio",
    description,
    url,
    inLanguage: "es-MX",
    mainEntity: itemList,
  };
  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Reformer para estudio" },
  ]);

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbs)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(collectionPage)}
        </script>
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <section className="px-8 pb-20 pt-32 md:px-24">
        <div className="mx-auto max-w-[1600px]">
          <div className="max-w-4xl">
            <span className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#3E2723]">
              <Building2 className="h-4 w-4" /> Equipamiento profesional
            </span>
            <h1 className="mb-8 font-serif text-5xl italic leading-[0.9] text-[#2A2624] md:text-7xl">
              Reformer para estudio
            </h1>
            <p className="max-w-3xl text-lg font-light leading-relaxed text-[#5D5550]">
              Compara los Reformers disponibles para equipar un estudio de
              Pilates. Revisa cada ficha para confirmar materiales,
              configuración, precio y tiempo de fabricación.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop/category/reformers"
                className="inline-flex items-center gap-2 rounded-full bg-[#2A2624] px-8 py-4 text-xs uppercase tracking-[0.2em] text-[#EAE8E4] transition-colors hover:bg-[#3E2723]"
              >
                Ver colección completa <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/packs/estudio"
                className="inline-flex items-center rounded-full border border-[#2A2624]/20 px-8 py-4 text-xs uppercase tracking-[0.2em] text-[#2A2624] transition-colors hover:bg-white"
              >
                Cotizar 8 o más
              </Link>
            </div>
          </div>

          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reformers.map((product) => (
              <Link
                key={product.slug}
                to={`/product/${product.slug}`}
                className="group overflow-hidden rounded-sm border border-[#2A2624]/10 bg-white/60 transition-colors hover:bg-white"
              >
                <div className="aspect-square overflow-hidden bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-2xl italic text-[#2A2624]">
                    {product.name}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-[#5D5550]">
                    {product.description}
                  </p>
                  <p className="mt-5 text-lg text-[#2A2624]">
                    ${Number(product.price).toLocaleString("es-MX")}{" "}
                    {product.currency}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#2A2624]/10 px-8 py-20 md:px-24">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="mb-8 font-serif text-3xl italic text-[#2A2624]">
            Guías para planear tu estudio
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                to: "/blog/reformer-casa-vs-profesional",
                title: "Reformer para casa vs profesional",
                description: "Criterios de uso, estructura y mantenimiento.",
              },
              {
                to: "/blog/cama-de-pilates-guia-de-compra",
                title: "Guía de compra de cama de Pilates",
                description: "Qué revisar antes de elegir equipo.",
              },
              {
                to: "/blog/mantenimiento-cama-de-pilates",
                title: "Mantenimiento del Reformer",
                description: "Rutinas de limpieza, revisión y recambio.",
              },
            ].map((guide) => (
              <Link
                key={guide.to}
                to={guide.to}
                className="rounded-sm border border-[#2A2624]/10 p-6 transition-colors hover:bg-white"
              >
                <h3 className="font-serif text-xl italic text-[#2A2624]">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm font-light text-[#5D5550]">
                  {guide.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default ReformerParaEstudio;
