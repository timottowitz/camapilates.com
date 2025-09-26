import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS } from '@/lib/seo';
import { Link } from 'react-router-dom';
import products from '@/content/products.json';
import { QualitySection } from '@/components/ui/quality-section';
import { CheckCircle2, Truck, ShieldCheck, ArrowRight, CreditCard, MessageCircle, Package, Building2 } from 'lucide-react';
import { TrustedBy } from '@/components/ui/trusted-by';
import { FeatureSplit } from '@/components/ui/feature-split';
import RibbonBanner from '@/components/ui/ribbon-banner';

const Index = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const title = 'Cama de Pilates (Reformer) en México — Casa y Estudio';
  const desc = 'Cama de Pilates en venta: Reformers silenciosos con cuero genuino, madera de nogal y acero. Precios 2025, entrega 5–7 días desde CDMX y garantía 3 años.';

  const productPk = 'sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c'; // TODO: replace with real key
  const productId = 'prod_6569ddc31c17b221072732'; // TODO: replace with real product id

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Edelweiss Pilates',
    url: origin,
    logo: `${origin}/brand/edelweiss.svg`
  };
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'camadepilates.com',
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/blog?query={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué cama de Pilates es mejor para casa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Busca tamaño compacto, estabilidad y accesorios esenciales. Compara 2–3 opciones y revisa garantía y servicio.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta una cama de Pilates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Depende del uso (casa vs profesional), materiales y accesorios. Consulta nuestra guía de precios para rangos orientativos.'
        }
      }
    ]
  };
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Cama de Pilates Reformer – Casa',
    description: 'Reformer compacto para casa. Recorrido suave, estabilidad y accesorios esenciales.',
    brand: { '@type': 'Brand', name: 'CAMA Pilates' },
    sku: 'HOME-REFORMER-001',
    image: [`${origin}/og/cama-de-pilates-venta-mexico.png`],
    url: `${origin}/store#casa`,
    offers: {
      '@type': 'Offer',
      url: `${origin}/store#casa`,
      priceCurrency: 'MXN',
      price: '999.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };

  const featured = products.slice(0, 2);
  const featuredListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: featured.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${origin}/product/${p.slug}`,
      name: p.name,
    })),
  };

  const guides = [
    { slug: 'cama-de-pilates-guia-de-compra', title: 'Cama de Pilates: Guía de compra 2025' },
    { slug: 'precio-cama-de-pilates', title: 'Precio de Cama de Pilates' },
    { slug: 'accesorios-cama-de-pilates', title: 'Accesorios para Cama de Pilates' },
    { slug: 'reformer-casa-vs-profesional', title: 'Reformer para casa vs profesional' },
  ];
  const guidesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: guides.map((g, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${origin}/blog/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={origin} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={origin} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(siteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(featuredListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(guidesListSchema)}</script>
      </Helmet>

      <RibbonBanner />

      {/* Hero */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">Cama de Pilates (Reformer)</h1>
            <p className="mt-6 text-xl text-muted-foreground">Cama de Pilates para casa y estudio con <strong>silencio total</strong> y <strong>estabilidad sin vibraciones</strong>. Acabados premium en <strong>cuero genuino</strong>, <strong>madera de nogal</strong> y <strong>acero estructural</strong>. Entrega <strong>5–7 días</strong> desde CDMX y <strong>garantía 3 años</strong>.</p>
            <p className="mt-3 text-sm text-muted-foreground">Ingeniería alemana • Manufactura mexicana • Ajustada por instructoras</p>
            <p className="mt-4 text-base text-foreground italic">El último Reformer que necesitarás. Desarrolla tu gracia con materiales nobles—solo lo mejor toca tu piel.</p>
            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <Link to="/product/reformer-profesional" className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Comprar Reformer de Estudio</Link>
              <Link to="/product/reformer-casa" className="inline-flex items-center px-6 py-3 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Comprar Reformer para Casa</Link>
              <Link to="/packs/estudio" className="inline-flex items-center px-6 py-3 rounded-md bg-[#6B4F3B] text-white hover:bg-[#5f4636]">Paquete de Estudio (8+) <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> Silencio total</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Truck className="h-5 w-5 text-primary" /> Envío MX 5–7 días</div>
              <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-5 w-5 text-primary" /> Garantía 3 años</div>
            </div>
          </div>
        </div>
      </section>

      <TrustedBy items={["CDMX","Guadalajara","Monterrey","Querétaro","Puebla","Mérida"]} />

      {/* Materials grid */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Materiales y acabados que perduran</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="font-semibold text-foreground">Cuero genuino</h3>
              <p className="text-sm text-muted-foreground mt-2">Contacto agradable y resistente. Mantiene agarre y color con el uso.</p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="font-semibold text-foreground">Madera de nogal</h3>
              <p className="text-sm text-muted-foreground mt-2">Cálida y elegante. Acabado protector que respira y luce mejor con el tiempo.</p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="font-semibold text-foreground">Acero estructural</h3>
              <p className="text-sm text-muted-foreground mt-2">Rigidez y precisión para un recorrido estable y silencioso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable leather option */}
      <FeatureSplit
        title="Nuevo acabado: cuero de micelio (sostenible)"
        copy="Incorporamos una opción de cuero a base de micelio —una alternativa de origen renovable— con tacto cálido y estética refinada. Diseñada para uso intensivo en estudio: sometida a pruebas de flexión y abrasión, resistente a la decoloración y fácil de mantener. Un material alineado con una energía femenina de protección y gracia: sin plásticos en contacto directo con la piel y con menor impacto ambiental."
        cta={{ href: '/product/reformer-profesional', label: 'Ver acabados disponibles' }}
        image={{ src: '/images/finish-mycelium.webp', alt: 'Acabado de cuero de micelio en Reformer' }}
      />

      {/* Trust badges */}
      <section className="bg-background border-t border-border/60">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Mercado Pago</div>
          <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> Soporte en español</div>
          <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Ensamblado en CDMX</div>
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Repuestos exprés</div>
          <div className="hidden lg:flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Garantía 3 años</div>
        </div>
      </section>

      {/* Top Guides */}
      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Top guías sobre Cama de Pilates</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {guides.map((g) => (
              <Link key={g.slug} to={`/blog/${g.slug}`} className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground group-hover:text-primary">{g.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">Lee nuestra guía sobre {g.title.toLowerCase()} y elige tu cama de Pilates con seguridad.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FeatureSplit
        title="Silencio que se siente en cada repetición"
        copy="Nuestras tolerancias precisas eliminan crujidos y vibraciones para una experiencia de estudio impecable. Cuero genuino y madera de nogal que elevan tu espacio."
        cta={{ href: '/cama-de-pilates/en-venta', label: 'Cama de Pilates en venta' }}
        image={{ src: '/og/cama-de-pilates-venta-mexico.png', alt: 'Cama de Pilates Edelweiss' }}
      />

      {/* Why Edelweiss */}
      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">¿Por qué elegir Edelweiss?</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong>Silencio total</strong> gracias a tolerancias precisas: sin crujidos, sin distracciones.</li>
              <li>Estética que eleva tu espacio: cuero genuino, nogal y acero con líneas limpias.</li>
              <li>Construcción DE/MX y <strong>garantía 3 años</strong> con repuestos exprés en español.</li>
              <li>Entrega nacional <strong>5–7 días</strong> desde CDMX y soporte cercano.</li>
              <li>Para estudios: <strong>Pack 8+ con 20% descuento</strong> e instalación coordinada.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/product/reformer-profesional" className="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Ver Reformer de Estudio</Link>
              <Link to="/packs/estudio" className="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Pack para estudios (8+)</Link>
            </div>
          </div>
          {/* Decibel "silence test" placeholder */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-card">
            <div className="aspect-video w-full">
              <video
                className="h-full w-full object-cover"
                src="/videos/silence-test.mp4"
                poster="/og/cama-de-pilates-venta-mexico.png"
                muted
                loop
                playsInline
                autoPlay
                controls
              >
                Tu navegador no soporta video HTML5.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          {[
            { t: 'Cama de Pilates para Casa', d: 'Compacta y silenciosa. Cuero genuino, estructura de madera y entrega 5–7 días.', link: '/product/reformer-casa' },
            { t: 'Cama de Pilates de Estudio', d: 'Silencio total y tolerancias precisas. Cuero, nogal y acero estructural.', link: '/product/reformer-profesional' },
            { t: 'Cama de Pilates en Venta', d: 'Compra con garantía 3 años y repuestos exprés. Ver disponibilidad en México.', link: '/cama-de-pilates/en-venta' }
          ].map((x) => (
            <Link key={x.t} to={x.link} className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-card block group">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary">{x.t}</h3>
              <p className="text-muted-foreground mt-2">{x.d}</p>
              <span className="inline-block mt-3 text-primary">Ver más →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Buyer guide block */}
      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Guía de compra de Cama de Pilates</h2>
            <p className="text-muted-foreground mb-6">Cómo elegir tu cama de Pilates: dimensiones y espacios, estabilidad (tolerancias), materiales (cuero/nogal/acero), muelles y garantía. Consulta <Link to="/cama-de-pilates/precio" className="text-primary hover:underline">precios</Link> y <Link to="/blog/cama-de-pilates-guia-de-compra" className="text-primary hover:underline">guía completa</Link>.</p>
            <div className="flex gap-3">
              <Link to="/cama-de-pilates/en-venta" className="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Cama de Pilates en venta</Link>
              <Link to="/cama-de-pilates/precio" className="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Precios</Link>
            </div>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="font-semibold text-foreground">Preguntas frecuentes</h3>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>• ¿Cuál es la mejor cama de Pilates para casa?</li>
              <li>• ¿Cuánto espacio necesito?</li>
              <li>• ¿Qué accesorios son imprescindibles?</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Camas de Pilates destacadas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featured.map((p) => (
              <Link key={p.slug} to={`/product/${p.slug}`} className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
                <img src={p.image} alt={p.name} className="w-full h-auto rounded mb-4 border border-border" />
                <h3 className="font-semibold text-foreground group-hover:text-primary">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
                <div className="mt-3 font-semibold text-foreground">$ {p.price} {p.currency}</div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/products" className="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Ver todos los productos</Link>
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <QualitySection />
    </>
  );
};

export default Index;
