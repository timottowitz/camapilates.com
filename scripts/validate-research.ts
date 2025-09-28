// deno run --allow-read scripts/validate-research.ts [--slug slug1,slug2]
// Validates research files in blog-planning/research per Blog Research Agent spec.

function usage() {
  console.log("Usage: validate-research.ts [--slug slug1,slug2]");
}

function parseArgs() {
  const args = new Map<string, string | boolean>();
  for (let i = 0; i < Deno.args.length; i++) {
    const a = Deno.args[i];
    if (a === "--help") return { help: true } as any;
    if (a === "--slug") args.set("slug", Deno.args[++i]);
  }
  return args;
}

function listResearchFiles() {
  const dir = "blog-planning/research";
  const out: string[] = [];
  for (const e of Deno.readDirSync(dir)) {
    if (e.isFile && e.name.endsWith(".md")) out.push(`${dir}/${e.name}`);
  }
  return out;
}

function wordCount(md: string): number {
  // strip code fences and frontmatter-ish blocks
  const cleaned = md.replace(/```[\s\S]*?```/g, "");
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.length;
}

function hasHeading(md: string, rx: RegExp) {
  return rx.test(md);
}

let _productSlugs: string[] | null = null;
function loadProductSlugs(): string[] {
  if (_productSlugs) return _productSlugs;
  try {
    const raw = Deno.readTextFileSync('src/content/products.json');
    const data = JSON.parse(raw) as Array<{ slug: string }>;
    _productSlugs = Array.isArray(data) ? data.map((p) => p.slug) : [];
  } catch {
    _productSlugs = [];
  }
  return _productSlugs;
}

function sectionBetween(md: string, rx: RegExp): string {
  const m = md.match(rx);
  if (!m) return '';
  const start = (m.index ?? 0) + m[0].length;
  const rest = md.slice(start);
  const n = rest.search(/^##\s+/m);
  return n === -1 ? rest : rest.slice(0, n);
}

function validateOne(path: string): { ok: boolean; warnings: string[]; errors: string[] } {
  const raw = Deno.readTextFileSync(path);
  const warnings: string[] = [];
  const errors: string[] = [];
  const wc = wordCount(raw);
  if (wc < 1000) errors.push(`Word count ${wc} < 1000`);
  if (!hasHeading(raw, /^##\s+Keywords|^##\s+Palabras clave/im)) warnings.push("Missing Keywords section");
  if (!hasHeading(raw, /^##\s+(Estructura|Structure)/im)) warnings.push("Missing Structure/Estructura section");
  if (!hasHeading(raw, /^##\s+(Shortcodes|Plan de shortcodes|Plan de shortcodes)/im)) warnings.push("Missing Shortcodes plan");
  if (!hasHeading(raw, /^##\s+FAQ/im)) warnings.push("Missing FAQ plan");
  if (!hasHeading(raw, /^##\s+(CTAs|Enlaces|Interlink)/im)) warnings.push("Missing CTAs/Enlaces plan");
  if (!hasHeading(raw, /^##\s+(Imagen|Imagenes|Image plan)/im)) warnings.push("Missing Image plan");
  if (!/\/product\//.test(raw) && !/\[\/products\]/.test(raw)) warnings.push("No PDP/hub link mentioned");
  if (!/books_md\b|Herman|Pilates|Lea|Wells/i.test(raw)) warnings.push("No books_md references found (Herman/Pilates/Lea/Wells)");

  // Enhanced checks
  // 1) FAQ count >= 5
  const faqSec = sectionBetween(raw, /^##\s+FAQ\s*$/im);
  if (faqSec) {
    const faqCount = (faqSec.match(/^###\s+/gm)?.length || 0)
      + (faqSec.match(/^[-*]\s+/gm)?.length || 0)
      + (faqSec.match(/^\d+\)\s+/gm)?.length || 0);
    if (faqCount < 5) warnings.push(`FAQ section has ${faqCount} items (<5)`);
  }

  // 2) Mexican market focus indicators
  if (!/(México|Mexico|MXN|pesos|CDMX|GDL|Guadalajara|MTY|Monterrey|garantía|envío|repuestos|factura|IVA)/i.test(raw)) {
    warnings.push("Missing explicit Mexico/MXN context cues");
  }

  // 3) Verify PDP links reference real product slugs
  const slugs = loadProductSlugs();
  if (slugs.length) {
    const mentioned = new Set<string>();
    for (const s of slugs) if (new RegExp(`/product/${s}\\b`).test(raw)) mentioned.add(s);
    if (mentioned.size === 0) warnings.push("No real PDP slug referenced from products.json");
  }

  // 4) Shortcode examples present and self-closed
  const scSec = sectionBetween(raw, /^##\s+(Shortcodes|Plan de shortcodes)/im);
  if (scSec) {
    if (!/(<see-also\b|<hub-list\b|<shoprocket-button\b)/.test(scSec)) warnings.push("Shortcodes plan lacks concrete examples");
    const hasSee = /<see-also\b[^>]*>/i.test(scSec);
    const selfSee = /<see-also\b[^>]*\/>/i.test(scSec);
    const hasHub = /<hub-list\b[^>]*>/i.test(scSec);
    const selfHub = /<hub-list\b[^>]*\/>/i.test(scSec);
    if ((hasSee && !selfSee) || (hasHub && !selfHub)) warnings.push("Shortcodes should be self-closing: use />");
  }

  // 5) Image plan depth (hero + at least 2 sections)
  const imgSec = sectionBetween(raw, /^##\s+(Imagen|Imagenes|Image plan)/im);
  if (imgSec) {
    const hasHero = /Hero\s*:/i.test(imgSec);
    const bullets = imgSec.match(/^[-*]\s+/gm)?.length || 0;
    if (!hasHero) warnings.push("Image plan: missing Hero: item");
    if (bullets < 2) warnings.push("Image plan: fewer than 2 section images planned");
  }
  return { ok: errors.length === 0, warnings, errors };
}

function slugFromPath(p: string) {
  return p.replace(/^.*\//, "").replace(/\.md$/, "");
}

async function main() {
  const args = parseArgs();
  if ((args as any).help) return usage();
  const files = listResearchFiles();
  const slugArg = args.get("slug") as string | undefined;
  const targets = slugArg ? files.filter(f => new Set(slugArg.split(/[,\s]+/)).has(slugFromPath(f))) : files;
  let hasErrors = false;
  for (const f of targets) {
    const { ok, warnings, errors } = validateOne(f);
    console.log(`\n== ${f} ==`);
    if (errors.length) { hasErrors = true; console.log("Errors:", errors.join("; ")); }
    if (warnings.length) console.log("Warnings:", warnings.join("; "));
    if (!errors.length && !warnings.length) console.log("OK");
  }
  if (hasErrors) Deno.exit(1);
}

if (import.meta.main) main();
