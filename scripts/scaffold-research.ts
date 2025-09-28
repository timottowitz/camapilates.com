// deno run --allow-read --allow-write scripts/scaffold-research.ts -- --slug <slug> --title "<Title>"

function parseArgs() {
  const out: Record<string, string> = {} as any;
  for (let i = 0; i < Deno.args.length; i++) {
    const a = Deno.args[i];
    if (a === "--slug") out.slug = Deno.args[++i];
    else if (a === "--title") out.title = Deno.args[++i];
  }
  return out as { slug: string; title?: string };
}

const TEMPLATE = (slug: string, title?: string) => `# ${title || slug} — Research (MX 2025)\n\n## Keywords\n- Primary: \n- Secondary: \n\n## Estructura (H2/H3)\n1) Resumen\n2) ...\n\n## Plan de shortcodes\n- <see-also /> spots\n- <hub-list /> config\n- <shoprocket-button /> when applicable\n\n## CTAs / Enlaces internos\n- PDPs: /product/...\n- Hubs: /cama-de-pilates/...\n\n## Imagenes (hero + 2 secciones)\n- Hero: reflects title\n- Section images: H2 contextual\n\n## Referencias (books_md / expertos)\n- Herman / Pilates / Lea / Wells\n\n## FAQ\n1) ...\n2) ...\n`;

async function main() {
  const { slug, title } = parseArgs();
  if (!slug) {
    console.log("Usage: scaffold-research.ts -- --slug <slug> --title \"<Title>\"");
    Deno.exit(1);
  }
  const path = `blog-planning/research/${slug}.md`;
  try {
    await Deno.stat(path);
    console.log(`Research file exists: ${path}`);
    return;
  } catch {}
  await Deno.writeTextFile(path, TEMPLATE(slug, title));
  console.log(`Scaffolded: ${path}`);
}

if (import.meta.main) main();

