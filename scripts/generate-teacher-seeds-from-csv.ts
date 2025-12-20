#!/usr/bin/env tsx
/**
 * Generate `src/data/teachers_cdmx.ts` from the provided instructor CSV.
 *
 * Usage:
 *   tsx scripts/generate-teacher-seeds-from-csv.ts --input "/path/to/file.csv"
 *   tsx scripts/generate-teacher-seeds-from-csv.ts --input "/path/to/file.csv" --output src/data/teachers_cdmx.ts
 *   tsx scripts/generate-teacher-seeds-from-csv.ts --input "/path/to/file.csv" --dry-run
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

type CsvRow = Record<string, string | undefined>;

type Accumulator = {
  fullName: string;
  neighborhoods: Set<string>;
  specializations: Set<string>;
  certifications: Set<string>;
  languages: Set<string>;
  experienceYears?: number;
  description?: string;
  homeVisits?: boolean;
  onlineClasses?: boolean;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  website?: string;
};

type CliOptions = {
  input: string;
  output: string;
  dryRun: boolean;
};

const IG_HOSTS = new Set(['instagram.com', 'www.instagram.com']);
const FB_HOSTS = new Set(['facebook.com', 'www.facebook.com', 'm.facebook.com']);
const LINKEDIN_HOSTS = new Set(['linkedin.com', 'www.linkedin.com', 'mx.linkedin.com']);

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');
  const dryRun = args.includes('--dry-run');

  const input = inputIdx !== -1 && args[inputIdx + 1] ? args[inputIdx + 1] : '';
  const output =
    outputIdx !== -1 && args[outputIdx + 1] ? args[outputIdx + 1] : 'src/data/teachers_cdmx.ts';

  if (!input) {
    console.error('❌ Missing --input path to CSV');
    process.exit(1);
  }

  return { input, output, dryRun };
}

function stripDiacritics(input: string): string {
  return input.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function normalizeNameKey(name: string): string {
  const cleaned = stripDiacritics(normalizeWhitespace(name))
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

function slugifyName(name: string): string {
  const cleaned = stripDiacritics(normalizeWhitespace(name))
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || 'instructor';
}

function cleanMaybe(input: unknown): string | undefined {
  if (input === null || input === undefined) return undefined;
  const raw = String(input).trim();
  if (!raw) return undefined;
  const lowered = raw.toLowerCase();
  if (lowered === 'unknown' || lowered === 'n/a' || lowered === 'na' || lowered === 'null') return undefined;
  return raw;
}

function asStringArray(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((v) => String(v)).map(normalizeWhitespace).filter(Boolean);
  if (typeof input === 'string') {
    const trimmed = normalizeWhitespace(input);
    if (!trimmed) return [];
    return [trimmed];
  }
  return [];
}

function normalizeLanguage(input: string): string | undefined {
  const raw = normalizeWhitespace(input);
  if (!raw) return undefined;
  const lowered = stripDiacritics(raw).toLowerCase();
  if (lowered.startsWith('spanish') || lowered.startsWith('espanol') || lowered === 'es') return 'Español';
  if (lowered.startsWith('english') || lowered === 'en' || lowered === 'ingles') return 'Inglés';
  if (lowered.startsWith('french') || lowered === 'frances' || lowered === 'fr') return 'Francés';
  if (lowered.startsWith('portuguese') || lowered === 'portugues' || lowered === 'pt') return 'Portugués';
  if (lowered.startsWith('german') || lowered === 'aleman' || lowered === 'de') return 'Alemán';
  // Keep original if it looks like a language label.
  return raw.slice(0, 40);
}

function normalizeSpecialization(input: string): string | undefined {
  const raw = normalizeWhitespace(input);
  if (!raw) return undefined;
  const lowered = stripDiacritics(raw).toLowerCase();

  if (lowered.includes('reformer')) return 'Reformer';
  if (/\bmat\b/.test(lowered) || lowered.includes('mat pilates')) return 'Mat';
  if (lowered.includes('cadillac')) return 'Cadillac';
  if (lowered.includes('wunda') || lowered.includes('chair')) return 'Wunda Chair';
  if (lowered.includes('barrel')) return 'Ladder Barrel';
  if (lowered.includes('prenatal') || lowered.includes('postnatal')) return 'Prenatal/Postnatal';
  if (lowered.includes('rehab') || lowered.includes('rehabilit')) return 'Rehabilitación';
  if (lowered.includes('senior') || lowered.includes('adulto mayor')) return 'Seniors';
  if (lowered.includes('athlet') || lowered.includes('atleta')) return 'Atletas';
  if (lowered.includes('beginner') || lowered.includes('principiante')) return 'Principiantes';
  if (lowered.includes('advanced') || lowered.includes('avanzad')) return 'Avanzado';
  if (lowered.includes('classical') || lowered.includes('clasico')) return 'Pilates Clásico';
  if (lowered.includes('contemporary') || lowered.includes('contempor')) return 'Pilates Contemporáneo';
  if (lowered.includes('trainer') || lowered.includes('formacion') || lowered.includes('teacher training')) {
    return 'Formación de instructores';
  }
  if (lowered.includes('private') || lowered.includes('sesion privada')) return 'Sesiones privadas';
  if (lowered.includes('online') || lowered.includes('virtual')) return 'Online';

  // Fall back to raw (capped) if it is short enough to be useful.
  return raw.length <= 60 ? raw : raw.slice(0, 60);
}

function normalizeExternalUrl(input: unknown): string | undefined {
  const raw = cleanMaybe(input);
  if (!raw) return undefined;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function normalizeInstagramValue(input: unknown): string | undefined {
  const raw = cleanMaybe(input);
  if (!raw) return undefined;
  const trimmed = raw.trim();

  const withoutAt = trimmed.replace(/^@/, '');
  const urlMatch = withoutAt.match(/instagram\.com\/([^/?#]+)/i);
  const candidate = (urlMatch?.[1] || withoutAt).trim().replace(/\/+$/, '').toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(candidate)) return undefined;
  return `@${candidate}`;
}

function normalizeFacebookValue(input: unknown): string | undefined {
  const url = normalizeExternalUrl(input);
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!FB_HOSTS.has(parsed.hostname.toLowerCase())) return url;
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeLinkedinValue(input: unknown): string | undefined {
  const url = normalizeExternalUrl(input);
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!LINKEDIN_HOSTS.has(parsed.hostname.toLowerCase())) return url;
    return parsed.toString();
  } catch {
    return url;
  }
}

function websiteScore(url: string): number {
  try {
    const host = new URL(url).hostname.toLowerCase();
    // Prefer a dedicated site over aggregators/social.
    if (IG_HOSTS.has(host)) return -10;
    if (FB_HOSTS.has(host)) return -8;
    if (LINKEDIN_HOSTS.has(host)) return -6;
    if (host.includes('mindbody')) return -5;
    if (host.includes('linktr.ee')) return -4;
    return 0;
  } catch {
    return -20;
  }
}

function pickBetterWebsite(current: string | undefined, candidate: string | undefined): string | undefined {
  if (!candidate) return current;
  if (!current) return candidate;
  return websiteScore(candidate) > websiteScore(current) ? candidate : current;
}

function toBool(input: unknown): boolean | undefined {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'number') return input !== 0;
  if (typeof input === 'string') {
    const v = input.trim().toLowerCase();
    if (v === 'true' || v === 'yes' || v === '1') return true;
    if (v === 'false' || v === 'no' || v === '0') return false;
  }
  return undefined;
}

function toInt(input: unknown): number | undefined {
  if (typeof input === 'number' && Number.isFinite(input)) return Math.round(input);
  const raw = cleanMaybe(input);
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function splitNeighborhoods(input: unknown): string[] {
  const raw = cleanMaybe(input);
  if (!raw) return [];
  const cleaned = raw.replace(/\s*[\u2022|•]\s*/g, ',');
  return cleaned
    .split(/[,/]| y | and /i)
    .map((s) => normalizeWhitespace(s))
    .filter(Boolean)
    .slice(0, 12);
}

function safeJsonParse(raw: string): any | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function buildTeacherObject(
  input: Accumulator,
  slug: string,
  citySlug: string,
  cityName: string
): string {
  const bio = input.description ? normalizeWhitespace(input.description).slice(0, 5000) : undefined;
  const specs = Array.from(input.specializations)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'es'));
  const certifications = Array.from(input.certifications)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'es'));
  const languages = Array.from(input.languages)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'es'));

  const id = `teacher_${citySlug}_${slug}`.replace(/[^a-z0-9_]+/gi, '_');

  const lines: string[] = [];
  lines.push('  {');
  lines.push(`    _id: ${JSON.stringify(id)},`);
  lines.push(`    slug: ${JSON.stringify(slug)},`);
  lines.push(`    fullName: { value: ${JSON.stringify(input.fullName)} },`);
  lines.push(`    citySlug: ${JSON.stringify(citySlug)},`);
  lines.push(`    cityName: { value: ${JSON.stringify(cityName)} },`);
  if (bio) lines.push(`    bio: { value: ${JSON.stringify(bio)} },`);

  lines.push(`    specializations: { value: ${JSON.stringify(specs.length > 0 ? specs : ['Pilates'])} },`);

  if (typeof input.experienceYears === 'number') {
    lines.push(`    experienceYears: { value: ${input.experienceYears} },`);
  }
  if (languages.length > 0) {
    lines.push(`    languages: { value: ${JSON.stringify(languages)} },`);
  }

  if (certifications.length > 0) {
    lines.push('    certifications: [');
    for (const c of certifications) {
      lines.push(`      { name: ${JSON.stringify(c)}, organization: 'Perfil público', isVerified: false },`);
    }
    lines.push('    ],');
  } else {
    lines.push('    certifications: [],');
  }

  lines.push('    isVerified: false,');

  const hasSocial = Boolean(input.instagram || input.linkedin || input.facebook || input.website);
  if (hasSocial) {
    lines.push('    social: {');
    if (input.instagram) lines.push(`      instagram: { value: ${JSON.stringify(input.instagram)} },`);
    if (input.linkedin) lines.push(`      linkedin: { value: ${JSON.stringify(input.linkedin)} },`);
    if (input.facebook) lines.push(`      facebook: { value: ${JSON.stringify(input.facebook)} },`);
    if (input.website) lines.push(`      website: { value: ${JSON.stringify(input.website)} },`);
    lines.push('    },');
  }

  lines.push('  }');
  return lines.join('\n');
}

function generateTsFile(objects: string[]): string {
  const now = new Date().toISOString().slice(0, 10);
  return `/*\n * Auto-generated from instructor CSV on ${now}.\n * Do not edit manually — re-run scripts/generate-teacher-seeds-from-csv.ts\n */\n\nimport type { TeacherProfileLite } from './teachers';\n\nexport const TEACHERS_SEED_CDMX: TeacherProfileLite[] = [\n${objects.join(',\n')}\n];\n`;
}

function main() {
  const opts = parseArgs();
  const inputAbs = path.resolve(process.cwd(), opts.input);
  const outputAbs = path.resolve(process.cwd(), opts.output);

  if (!fs.existsSync(inputAbs)) {
    console.error(`❌ CSV not found: ${inputAbs}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputAbs, 'utf-8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true, bom: true }) as CsvRow[];

  const map = new Map<string, Accumulator>();

  for (const row of rows) {
    for (let i = 1; i <= 5; i++) {
      const nameCol = row[`Instructor ${i} Name`];
      const dataCol = row[`Instructor ${i} Data`];
      const parsed = dataCol ? safeJsonParse(dataCol) : null;

      const fullName = cleanMaybe(parsed?.full_name || parsed?.name || nameCol);
      if (!fullName) continue;

      const key = normalizeNameKey(fullName);
      const current =
        map.get(key) ||
        ({
          fullName,
          neighborhoods: new Set<string>(),
          specializations: new Set<string>(),
          certifications: new Set<string>(),
          languages: new Set<string>(),
        } satisfies Accumulator);

      const neighborhoods = [
        ...splitNeighborhoods(parsed?.neighborhood),
        ...splitNeighborhoods(parsed?.neighborhoods),
      ];
      neighborhoods.forEach((n) => current.neighborhoods.add(n));

      asStringArray(parsed?.specializations).forEach((s) => {
        const normalized = normalizeSpecialization(s);
        if (normalized) current.specializations.add(normalized);
      });

      asStringArray(parsed?.certifications).forEach((c) => {
        const normalized = normalizeWhitespace(c);
        if (normalized) current.certifications.add(normalized.slice(0, 120));
      });

      asStringArray(parsed?.languages).forEach((l) => {
        const normalized = normalizeLanguage(l);
        if (normalized) current.languages.add(normalized);
      });

      const experienceYears = toInt(parsed?.experience_years);
      if (typeof experienceYears === 'number') {
        current.experienceYears =
          typeof current.experienceYears === 'number'
            ? Math.max(current.experienceYears, experienceYears)
            : experienceYears;
      }

      const desc = cleanMaybe(parsed?.description);
      if (desc) {
        const normalized = normalizeWhitespace(desc);
        if (!current.description || normalized.length > current.description.length) {
          current.description = normalized;
        }
      }

      const homeVisits = toBool(parsed?.home_visits);
      const onlineClasses = toBool(parsed?.online_classes);
      if (homeVisits === true) current.homeVisits = true;
      if (onlineClasses === true) current.onlineClasses = true;

      current.instagram = current.instagram || normalizeInstagramValue(parsed?.instagram);
      current.linkedin = current.linkedin || normalizeLinkedinValue(parsed?.linkedin);
      current.facebook = current.facebook || normalizeFacebookValue(parsed?.facebook);

      const websiteRaw = parsed?.website;
      const websiteCandidates = Array.isArray(websiteRaw) ? websiteRaw : websiteRaw ? [websiteRaw] : [];
      for (const w of websiteCandidates) {
        const normalized = normalizeExternalUrl(w);
        current.website = pickBetterWebsite(current.website, normalized);
      }

      map.set(key, current);
    }
  }

  const teachers = Array.from(map.values()).sort((a, b) =>
    stripDiacritics(a.fullName).localeCompare(stripDiacritics(b.fullName), 'es')
  );

  // Create stable unique slugs (within a city).
  const slugCounts = new Map<string, number>();
  const objects: string[] = [];

  for (const teacher of teachers) {
    const isOnline =
      teacher.onlineClasses === true ||
      Array.from(teacher.neighborhoods).some((n) => n.toLowerCase() === 'online');

    const citySlug = isOnline ? 'online' : 'ciudad-de-mexico';
    const cityName = isOnline ? 'Online / Remoto' : 'Ciudad de México';

    const base = slugifyName(teacher.fullName);
    const key = `${citySlug}:${base}`;
    const nextCount = (slugCounts.get(key) || 0) + 1;
    slugCounts.set(key, nextCount);
    const slug = nextCount === 1 ? base : `${base}-${nextCount}`;

    objects.push(buildTeacherObject(teacher, slug, citySlug, cityName));
  }

  if (opts.dryRun) {
    const cdmxCount = objects.filter((o) => o.includes('citySlug: \"ciudad-de-mexico\"')).length;
    const onlineCount = objects.length - cdmxCount;
    console.log(`Rows: ${rows.length}`);
    console.log(`Unique instructors: ${objects.length}`);
    console.log(`CDMX: ${cdmxCount} | Online: ${onlineCount}`);
    return;
  }

  const outputDir = path.dirname(outputAbs);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputAbs, generateTsFile(objects), 'utf-8');

  console.log(`✅ Wrote ${objects.length} instructors to ${path.relative(process.cwd(), outputAbs)}`);
}

main();
