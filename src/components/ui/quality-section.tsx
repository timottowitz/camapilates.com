import { Button } from "@/components/ui/button";

interface QualitySectionProps {
  title?: string;
  description?: string;
  mainImage?: {
    src: string;
    alt: string;
  };
  secondaryImage?: {
    src: string;
    alt: string;
  };
  breakout?: {
    src: string;
    alt: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  materialsTitle?: string;
  materials?: Array<{
    src: string;
    alt: string;
    name: string;
  }>;
  achievementsTitle?: string;
  achievementsDescription?: string;
  achievements?: Array<{
    label: string;
    value: string;
  }>;
}

const defaultMaterials = [
  {
    src: "https://images.unsplash.com/photo-1595951411755-be1f8be56d53?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    alt: "Cuero premium para acolchado",
    name: "Cuero Premium"
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    alt: "Acabado en madera natural",
    name: "Madera Natural"
  },
  {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    alt: "Manijas ergonómicas del reformer",
    name: "Manijas Ergonómicas"
  }
];

const defaultAchievements = [
  { label: "Años de Garantía", value: "5+" },
  { label: "Certificación de Calidad", value: "ISO 9001" },
  { label: "Satisfacción del Cliente", value: "98%" },
  { label: "Materiales Premium", value: "100%" },
];

export const QualitySection = ({
  title = "Desarrollado con materiales de la más alta calidad",
  description = "Cada cama de Pilates CAMA está fabricada con materiales premium seleccionados cuidadosamente: cuero genuino, maderas nobles y componentes de acero inoxidable para garantizar durabilidad, comodidad y rendimiento excepcional.",
  mainImage = {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Reformer de Pilates con acabados premium",
  },
  secondaryImage = {
    src: "https://images.unsplash.com/photo-1506629905607-d6f2a1e71d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Detalle de materiales de calidad superior",
  },
  breakout = {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    alt: "Certificación CAMA Pilates",
    title: "Certificado por los mejores estándares internacionales",
    description: "Todos nuestros equipos cumplen con las normativas ISO 9001 y están certificados para uso profesional en estudios y clínicas de fisioterapia.",
    buttonText: "Ver certificaciones",
    buttonUrl: "/store",
  },
  materialsTitle = "Materiales premium en cada detalle",
  materials = defaultMaterials,
  achievementsTitle = "Calidad garantizada en números",
  achievementsDescription = "Cada reformer pasa por rigurosos controles de calidad y está respaldado por garantías extensas y certificaciones internacionales.",
  achievements = defaultAchievements,
}: QualitySectionProps = {}) => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <div className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left">
          <h1 className="text-5xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="grid gap-7 lg:grid-cols-3">
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className="size-full max-h-[620px] rounded-xl object-cover lg:col-span-2"
          />
          <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
            <div className="flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto">
              <img
                src={breakout.src}
                alt={breakout.alt}
                className="mr-auto h-12"
              />
              <div>
                <p className="mb-2 text-lg font-semibold">{breakout.title}</p>
                <p className="text-muted-foreground">{breakout.description}</p>
              </div>
              <Button variant="outline" className="mr-auto" asChild>
                <a href={breakout.buttonUrl}>
                  {breakout.buttonText}
                </a>
              </Button>
            </div>
            <img
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              className="grow basis-0 rounded-xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto"
            />
          </div>
        </div>
        <div className="py-32">
          <p className="text-center text-xl font-semibold mb-8">{materialsTitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-12">
            {materials.map((material, idx) => (
              <div className="flex flex-col items-center gap-4" key={material.src + idx}>
                <img
                  src={material.src}
                  alt={material.alt}
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
                />
                <span className="text-sm font-medium text-center">{material.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-muted p-10 md:p-16">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-4xl font-semibold">{achievementsTitle}</h2>
            <p className="max-w-screen-sm text-muted-foreground">
              {achievementsDescription}
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-between gap-10 text-center">
            {achievements.map((item, idx) => (
              <div className="flex flex-col gap-4" key={item.label + idx}>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <span className="text-4xl font-semibold md:text-5xl text-primary">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute -top-1 right-1 z-10 hidden h-full w-full bg-[linear-gradient(to_right,hsl(var(--muted-foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted-foreground))_1px,transparent_1px)] bg-[size:80px_80px] opacity-15 [mask-image:linear-gradient(to_bottom_right,#000,transparent,transparent)] md:block"></div>
        </div>
      </div>
    </section>
  );
};