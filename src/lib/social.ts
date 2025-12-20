function stripDiacritics(input: string): string {
  return input.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeInstagramUsername(input: string | undefined | null): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  const withoutAt = raw.replace(/^@/, '');
  const urlMatch = withoutAt.match(/instagram\.com\/([^/?#]+)/i);
  const candidate = (urlMatch?.[1] || withoutAt).trim().replace(/\/+$/, '').toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(candidate)) return null;
  return candidate;
}

export function instagramHandle(input: string | undefined | null): string | null {
  const username = normalizeInstagramUsername(input);
  return username ? `@${username}` : null;
}

export function instagramProfileUrl(input: string | undefined | null): string | null {
  const username = normalizeInstagramUsername(input);
  return username ? `https://www.instagram.com/${username}/` : null;
}

export function normalizeExternalUrl(input: string | undefined | null): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function inferCitySlugAlias(input: string | undefined | null): string | null {
  if (!input) return null;
  const raw = stripDiacritics(String(input)).toLowerCase().trim();
  if (!raw) return null;
  if (raw === 'cdmx' || raw === 'mexico-df' || raw === 'df') return 'ciudad-de-mexico';
  return raw;
}

