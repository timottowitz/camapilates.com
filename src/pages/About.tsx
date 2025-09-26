
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { About3 } from '@/components/ui/about-3';

const About = () => {


  return (
    <>
      <Helmet>
        <title>Sobre Edelweiss Pilates | Ingeniería alemana, manufactura mexicana</title>
        <meta name="description" content="Conoce Edelweiss Pilates: Reformers silenciosos y precisos en cuero genuino, nogal y acero. Ingeniería alemana con manufactura en CDMX." />
        <meta name="keywords" content="Edelweiss Pilates, cama de pilates, reformer estudio, cuero genuino, nogal, acero" />
        <link rel="canonical" href={`${window.location.origin}/about`} />

        {/* Open Graph */}
        <meta property="og:title" content="Sobre Edelweiss Pilates | Equipos de Pilates" />
        <meta property="og:description" content="Conoce nuestra historia y compromiso con la calidad en equipos de Pilates profesionales." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/about`} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "mainEntity": {
              "@type": "Organization",
              "name": "Edelweiss Pilates",
              "description": "Reformers silenciosos y precisos para casa y estudio",
              "areaServed": "México",
              "specialty": "Cama de Pilates (Reformer)"
            }
          })}
        </script>
      </Helmet>

      <About3
        title="Sobre Edelweiss Pilates"
        description="Unimos ingeniería alemana y manufactura mexicana para crear Reformers silenciosos y precisos. Materiales nobles —cuero genuino, nogal y acero— ajustados con feedback de instructoras para elevar cada clase."
        mainImage={{
          src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          alt: "Estudio de Pilates profesional con reformer"
        }}
        secondaryImage={{
          src: "https://images.unsplash.com/photo-1506629905607-d6f2a1e71d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          alt: "Clase de Pilates en reformer"
        }}
        breakout={{
          src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
          alt: "Logo Edelweiss",
          title: "Hecho en CDMX, probado por instructoras",
          description: "Entrega nacional 5–7 días, garantía 3 años y repuestos exprés. Silencio total y estabilidad sin vibraciones.",
          buttonText: "Ver nuestros productos",
          buttonUrl: "/store"
        }}
        companiesTitle="Confianza de estudios profesionales"
        companies={[
          {
            src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            alt: "Estudio Pilates Madrid"
          },
          {
            src: "https://images.unsplash.com/photo-1566889596784-d9e0bb5f88e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            alt: "Centro Wellness Barcelona"
          },
          {
            src: "https://images.unsplash.com/photo-1506629905607-d6f2a1e71d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            alt: "Fisioterapia Valencia"
          },
          {
            src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            alt: "Gimnasio Premium Sevilla"
          },
          {
            src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            alt: "Clínica Rehabilitación Bilbao"
          },
          {
            src: "https://images.unsplash.com/photo-1506629905607-d6f2a1e71d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            alt: "Centro Pilates Málaga"
          }
        ]}
        achievementsTitle="Nuestros logros en cifras"
        achievementsDescription="Más de 10 años proporcionando equipos de Pilates de calidad superior, con un servicio excepcional y la confianza de profesionales en toda España."
        achievements={[
          { label: "Equipos Instalados", value: "500+" },
          { label: "Estudios Atendidos", value: "200+" },
          { label: "Clientes Satisfechos", value: "98%" },
          { label: "Años de Experiencia", value: "10+" }
        ]}
      />
    </>
  );
};

export default About;
