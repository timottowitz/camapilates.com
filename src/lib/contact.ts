export const WHATSAPP_NUMBER = '525548468190';
export const CONTACT_EMAIL = 'hello@camadepilates.com';

export function whatsappUrl(message: string, number: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
