export function normalizeTeacherSlugForUrl(slug: string, citySlug: string): string {
  const safeSlug = String(slug || '').trim();
  const safeCity = String(citySlug || '').trim();
  if (!safeSlug || !safeCity) return safeSlug;
  const suffix = `-${safeCity}`;
  if (safeSlug.endsWith(suffix)) return safeSlug.slice(0, -suffix.length);
  return safeSlug;
}

