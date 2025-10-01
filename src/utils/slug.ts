export function slugify(input: string): string {
  return (input || '')
    .normalize('NFD') // split accented chars
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics to hyphen
    .replace(/^-+|-+$/g, ''); // trim hyphens
}

export const citySlug = slugify;

