/**
 * Script to update Convex site_images metadata for SEO optimization
 * 
 * This script updates the alt text and descriptions of images in Convex
 * to be more SEO-friendly with relevant keywords for the Mexican Pilates market.
 * 
 * Run with: deno run --allow-all scripts/update-image-seo-metadata.ts
 */

import { ConvexHttpClient } from "convex/browser";
// @ts-ignore - Deno TS doesn't understand Convex generated types
import { api } from "../convex/_generated/api.js";
import { getAdminToken } from "./lib/adminAuth.js";

const CONVEX_URL = Deno.env.get("VITE_CONVEX_URL");

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  Deno.exit(1);
}

interface ImageSeoUpdate {
  name: string;
  alt: string;
  description: string;
}

const SEO_UPDATES: ImageSeoUpdate[] = [
  {
    name: "heroEdelweiss",
    alt: "Mujer practicando pilates en cama de pilates reformer Edelweiss de madera de nogal con luz natural - equipo premium libre de plasticos para casa y estudio en Mexico",
    description: "Imagen hero principal de la pagina de inicio mostrando mujer en reformer Edelweiss con luz matutina natural - cama de pilates de madera de nogal americano y cuero genuino"
  },
  {
    name: "shopHero",
    alt: "Cama de pilates reformer profesional Edelweiss en acabado nogal - equipo de pilates premium para estudio y casa en Mexico con envio incluido",
    description: "Hero de la tienda mostrando reformer profesional Edelweiss - cama de pilates de madera de nogal con cuero genuino y acero estructural"
  },
  {
    name: "featuredProducts",
    alt: "Cama de pilates reformer Edelweiss para casa - equipo compacto de pilates de madera de nogal libre de plasticos con garantia de 1 ano en Mexico",
    description: "Producto destacado reformer para casa Edelweiss - cama de pilates silenciosa y precisa con materiales premium organicos"
  },
  {
    name: "reformerEditorial1",
    alt: "Fotografia editorial de mujer en cama de pilates reformer Edelweiss con tocado floral - campaña lifestyle de pilates premium en Mexico",
    description: "Imagen editorial artistica de campaña para Reformer Casa - sesion fotografica de estilo de vida con reformer de madera de nogal"
  },
  {
    name: "catReformers",
    alt: "Icono de categoria camas de pilates reformer Edelweiss - equipos de pilates de madera de nogal para casa y estudio profesional",
    description: "Icono de categoria para seccion de reformers - camas de pilates premium con acabados de madera de nogal"
  },
  {
    name: "catAccessories",
    alt: "Icono de categoria accesorios para pilates - cintas de algodon organico y calcetines antideslizantes Edelweiss",
    description: "Icono de categoria para accesorios de pilates - productos organicos y libre de plasticos para reformer"
  },
  {
    name: "catRopa",
    alt: "Icono de categoria ropa de pilates de algodon organico - leggings y tops Edelweiss sin materiales sinteticos",
    description: "Icono de categoria para ropa de pilates - coleccion fitted y relaxed de algodon organico certificado GOTS"
  },
  {
    name: "catLuz",
    alt: "Icono de categoria terapia de luz roja e infrarroja para pilates - paneles de recuperacion muscular Edelweiss",
    description: "Icono de categoria para terapia de luz - sistemas de luz roja 660nm e infrarroja 850nm para estudios y casa"
  },
  {
    name: "finishMycelium",
    alt: "Acabado Mylo micelio para cama de pilates reformer Edelweiss - material renovable no toxico alternativa al cuero sostenible",
    description: "Acabado especial Mylo de micelio para reformers - material sostenible de Bolt Threads con tacto premium y origen renovable"
  },
  {
    name: "myloBadge",
    alt: "Insignia Mylo certificacion de material de micelio sostenible - cuero renovable para camas de pilates Edelweiss",
    description: "Badge de certificacion Mylo - indica productos con material de micelio sostenible de Bolt Threads"
  },
  {
    name: "myloSpecial",
    alt: "Edicion especial Mylo de cama de pilates reformer Edelweiss - version premium con micelio sostenible",
    description: "Badge especial para edicion Mylo - reformers con material de micelio como alternativa al cuero tradicional"
  },
  {
    name: "featureSilence",
    alt: "Hombre practicando plancha lateral en cama de pilates reformer Edelweiss - ejercicio de pilates para fuerza y equilibrio con equipo premium de madera de nogal",
    description: "Imagen de seccion Detox Your Movement - practica de pilates en reformer con materiales organicos libre de plasticos"
  },
  {
    name: "heroVideo",
    alt: "Video de cama de pilates reformer Edelweiss en uso - demostracion de equipo premium de pilates para casa y estudio",
    description: "Video hero mostrando reformer Edelweiss en accion - demostracion del sistema Whisper Glide silencioso"
  }
];

async function updateImageSeoMetadata() {
  const client = new ConvexHttpClient(CONVEX_URL!);
  const token = await getAdminToken(client);

  console.log("🔍 Fetching current site images from Convex...");
  
  const activeImages = await client.query(api.siteImages.listActive, {});
  
  if (!activeImages || activeImages.length === 0) {
    console.log("⚠️  No active images found in Convex");
    return;
  }

  console.log(`📊 Found ${activeImages.length} active images`);

  for (const update of SEO_UPDATES) {
    const image = activeImages.find((img: any) => img.name === update.name);
    
    if (!image) {
      console.log(`⏭️  Skipping ${update.name} - not found in Convex`);
      continue;
    }

    console.log(`\n🖼️  Updating ${update.name}...`);
    console.log(`   Old alt: ${image.alt || '(none)'}`);
    console.log(`   New alt: ${update.alt.substring(0, 60)}...`);

    try {
      await client.mutation(api.siteImages.updateMetadata, {
        token,
        id: image._id,
        alt: update.alt,
        description: update.description,
      });
      console.log(`   ✅ Updated successfully`);
    } catch (error) {
      console.error(`   ❌ Error updating ${update.name}:`, error);
    }
  }

  console.log("\n✅ SEO metadata update complete!");
  console.log("\n📝 Summary of SEO improvements:");
  console.log("   - Added Spanish keywords (cama de pilates, reformer, Mexico)");
  console.log("   - Added material keywords (madera de nogal, cuero genuino, algodon organico)");
  console.log("   - Added brand name (Edelweiss) for brand recognition");
  console.log("   - Added location keywords (Mexico, casa, estudio)");
  console.log("   - Added feature keywords (libre de plasticos, premium, silencioso)");
}

updateImageSeoMetadata().catch((error) => {
  console.error("❌ Error:", error);
  Deno.exit(1);
});
