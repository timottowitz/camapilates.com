import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import LuxuryLayout from "@/components/layout/LuxuryLayout";
import products from "@/content/products.json";
import { DEFAULTS, generateBreadcrumbSchema, getOrigin } from "@/lib/seo";
import { requireRouteMeta } from "@/lib/routeMeta";
import { ArrowRight, Building2, MessageCircle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

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
              Compara los Reformers diseñados para resistir uso continuo de 8 a 12 horas diarias en estudios de Pilates.
              Ingeniería con cero holguras mecánicas, roble o aluminio aeroespacial, y fletes directos asegurados en todo México.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={`https://wa.me/525548468190?text=${encodeURIComponent("Hola, me interesa equipar un estudio de Pilates en México. Quisiera asesoría técnica en modelos, cotización por volumen y tiempos de entrega.")}`}
                target="_blank"
                rel="noopener noreferrer"
                data-rybbit-event="click_studio_hero_whatsapp"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all shadow-md hover:bg-[#20ba59] hover:scale-105"
              >
                <MessageCircle className="h-4 w-4" /> Cotizar para Estudio por WhatsApp
              </a>
              <Link
                to="/packs/estudio"
                className="inline-flex items-center gap-2 rounded-full bg-[#2A2624] px-8 py-4 text-xs uppercase tracking-[0.2em] text-[#EAE8E4] transition-colors hover:bg-[#3E2723]"
              >
                Packs de Estudio (8+ uds) <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/cama-de-pilates/precio"
                className="inline-flex items-center rounded-full border border-[#2A2624]/20 px-8 py-4 text-xs uppercase tracking-[0.2em] text-[#2A2624] transition-colors hover:bg-white"
              >
                Precios y 12 MSI
              </Link>
            </div>
          </div>

          {/* Commercial Studio Advantage Bar */}
          <div className="mt-14 rounded-2xl border border-[#2A2624]/10 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#25D366] shrink-0" />
                <span className="text-xs font-medium text-[#2A2624]">Descuento especial por volumen a partir de 3 unidades</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#3E2723] shrink-0" />
                <span className="text-xs font-medium text-[#2A2624]">Garantía de 3 años y bodega de refacciones en México</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#D9865B] shrink-0" />
                <span className="text-xs font-medium text-[#2A2624]">Facturación fiscal mexicana (CFDI con IVA desglosado)</span>
              </div>
            </div>
          </div>

          {/* Reformer Grid with Clear Per-Bed CTAs */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reformers.map((product) => (
              <div
                key={product.slug}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#2A2624]/10 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <Link to={`/product/${product.slug}`} className="block">
                  <div className="aspect-square overflow-hidden bg-[#F5F4F0]">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <Link to={`/product/${product.slug}`}>
                      <h2 className="font-serif text-2xl italic text-[#2A2624] group-hover:text-[#EB4C42] transition-colors">
                        {product.name}
                      </h2>
                    </Link>
                    <p className="mt-3 line-clamp-2 text-sm font-light leading-relaxed text-[#5D5550]">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-baseline justify-between border-t border-[#2A2624]/10 pt-3">
                      <div>
                        <span className="text-xl font-serif italic text-[#2A2624]">
                          ${Number(product.price).toLocaleString("es-MX")} {product.currency}
                        </span>
                        <span className="block text-[11px] text-[#128C7E] font-medium">
                          12 MSI disponibles
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-[#5D5550] bg-[#F2F0ED] px-2.5 py-1 rounded-full font-semibold">
                        Garantía 3 años
                      </span>
                    </div>
                  </div>

                  {/* Dual Action CTAs per bed */}
                  <div className="mt-6 space-y-2">
                    <Link
                      to={`/product/${product.slug}`}
                      className="w-full py-2.5 px-4 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs font-semibold text-center group-hover:bg-[#3E2723] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Ver Ficha Técnica y Acabados</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <a
                      href={`https://wa.me/525548468190?text=${encodeURIComponent(`Hola, me interesa cotizar el modelo ${product.name} para equipar mi estudio (solicito precio por volumen, flete y tiempos de entrega).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-rybbit-event="click_studio_card_whatsapp"
                      data-rybbit-prop-reformer={product.name}
                      className="w-full py-2.5 px-4 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Cotizar Lote para Estudio</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Studio Project Advisory Callout */}
          <div className="mt-16 rounded-3xl bg-[#2A2624] p-8 md:p-12 text-[#EAE8E4] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D9865B]">
                Equipamiento Integral de Estudios
              </span>
              <h3 className="text-2xl md:text-3xl font-serif italic text-white">
                ¿Planeando abrir o renovar tu estudio de Pilates?
              </h3>
              <p className="text-sm text-[#EAE8E4]/80 font-light max-w-xl">
                Te asesoramos en el layout del espacio según metros cuadrados, selección de camas (madera o aluminio), media torre o torres completas, y cronograma de entrega por lotes.
              </p>
            </div>
            <a
              href={`https://wa.me/525548468190?text=${encodeURIComponent("Hola, estoy planeando un proyecto de estudio de Pilates y quisiera asesoría técnica de distribución de espacio y cotización de equipos.")}`}
              target="_blank"
              rel="noopener noreferrer"
              data-rybbit-event="click_studio_project_whatsapp"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:bg-[#20ba59] hover:scale-105 shrink-0"
            >
              <MessageCircle className="h-4 w-4" /> Hablar con Asesor de Estudios
            </a>
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
                to: "/cama-de-pilates",
                title: "Catálogo Completo de Camas",
                description: "Modelos, especificaciones técnicas y acabados en México.",
              },
              {
                to: "/cama-de-pilates/precio",
                title: "Precios y Financiamiento 12 MSI",
                description: "Tabla comparativa de costos y retorno de inversión.",
              },
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
