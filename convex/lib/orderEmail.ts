// Email plumbing shared by the order functions.

export const SITE_URL = 'https://camadepilates.com';
export const TEAM_EMAIL = 'hello@camadepilates.com';
export const TEAM_WHATSAPP = '525548468190';
const FROM_EMAIL = 'Edelweiss Pilates <noreply@camadepilates.com>';

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);

export function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2A2624; max-width: 600px; margin: 0 auto; padding: 24px;">
  <p style="font-family: Georgia, serif; font-style: italic; font-size: 24px; margin: 0 0 24px;">Edelweiss</p>
  ${body}
</body>
</html>`;
}

export function teamInbox(): string {
  return process.env.ORDER_NOTIFY_EMAIL || TEAM_EMAIL;
}

// Sends through Resend. Returns false, after logging, when the key is missing or Resend refuses.
export async function sendEmail(to: string, subject: string, html: string, replyTo?: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured; email not sent:', subject);
    return false;
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!response.ok) console.error('Resend API error:', await response.text());
  return response.ok;
}
