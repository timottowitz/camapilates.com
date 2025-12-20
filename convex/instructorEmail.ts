import { action } from './_generated/server';
import { v } from 'convex/values';

const SITE_URL = 'https://camadepilates.com';
const FROM_EMAIL = 'CAMA Pilates <noreply@camadepilates.com>';

// =============================================
// EMAIL TEMPLATES
// =============================================

function welcomeEmailHtml(teacherName: string, setupUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #8B7355; margin: 0;">CAMA Pilates</h1>
  </div>

  <h2 style="color: #333;">¡Hola ${teacherName}!</h2>

  <p>Tu perfil de instructor ha sido <strong>verificado</strong> en el directorio de CAMA Pilates. ¡Felicidades!</p>

  <p>Ahora tienes acceso a tu propia cuenta donde puedes:</p>

  <ul style="color: #555; padding-left: 20px;">
    <li>Actualizar tu biografía y especialidades</li>
    <li>Subir y organizar tus fotos de perfil</li>
    <li>Agregar tu WhatsApp, Instagram y enlaces de reserva</li>
    <li>Mantener tu información siempre actualizada</li>
  </ul>

  <p><strong>Primer paso:</strong> Crea tu contraseña para activar tu cuenta:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${setupUrl}" style="background-color: #8B7355; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
      Configurar mi cuenta
    </a>
  </div>

  <div style="background-color: #f8f6f4; padding: 16px; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 0; color: #555; font-size: 14px;">
      <strong>¿Cómo acceder después?</strong><br>
      Una vez que configures tu contraseña, podrás iniciar sesión en cualquier momento en:<br>
      <a href="${SITE_URL}/mi-perfil" style="color: #8B7355;">camadepilates.com/mi-perfil</a>
    </p>
  </div>

  <p style="color: #666; font-size: 14px;">
    Este enlace de configuración expira en 7 días. Si expira, puedes solicitar uno nuevo desde la página de inicio de sesión.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    CAMA Pilates - Directorio de Instructores<br>
    <a href="${SITE_URL}" style="color: #8B7355;">camadepilates.com</a>
  </p>
</body>
</html>
  `.trim();
}

function welcomeEmailText(teacherName: string, setupUrl: string): string {
  return `
¡Hola ${teacherName}!

Tu perfil de instructor ha sido verificado en el directorio de CAMA Pilates. ¡Felicidades!

Ahora tienes acceso a tu propia cuenta donde puedes:
• Actualizar tu biografía y especialidades
• Subir y organizar tus fotos de perfil
• Agregar tu WhatsApp, Instagram y enlaces de reserva
• Mantener tu información siempre actualizada

PRIMER PASO: Crea tu contraseña para activar tu cuenta:
${setupUrl}

¿CÓMO ACCEDER DESPUÉS?
Una vez que configures tu contraseña, podrás iniciar sesión en cualquier momento en:
${SITE_URL}/mi-perfil

Este enlace de configuración expira en 7 días. Si expira, puedes solicitar uno nuevo desde la página de inicio de sesión.

---
CAMA Pilates - Directorio de Instructores
${SITE_URL}
  `.trim();
}

function passwordResetHtml(teacherName: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #8B7355; margin: 0;">CAMA Pilates</h1>
  </div>

  <h2 style="color: #333;">Hola ${teacherName}</h2>

  <p>Recibimos una solicitud para restablecer tu contraseña.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" style="background-color: #8B7355; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
      Restablecer contraseña
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Este enlace expira en 24 horas. Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    CAMA Pilates - Directorio de Instructores<br>
    <a href="${SITE_URL}" style="color: #8B7355;">camadepilates.com</a>
  </p>
</body>
</html>
  `.trim();
}

function passwordResetText(teacherName: string, resetUrl: string): string {
  return `
Hola ${teacherName},

Recibimos una solicitud para restablecer tu contraseña.

Restablece tu contraseña aquí:
${resetUrl}

Este enlace expira en 24 horas.

Si no solicitaste esto, puedes ignorar este correo.

---
CAMA Pilates - Directorio de Instructores
${SITE_URL}
  `.trim();
}

// =============================================
// EMAIL ACTIONS
// =============================================

export const sendWelcomeEmail = action({
  args: {
    email: v.string(),
    teacherName: v.string(),
    setupToken: v.string(),
  },
  handler: async (ctx, { email, teacherName, setupToken }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return { ok: false, error: 'Email service not configured' };
    }

    const setupUrl = `${SITE_URL}/setup-cuenta?token=${setupToken}`;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: 'Tu perfil está verificado - Configura tu cuenta',
          html: welcomeEmailHtml(teacherName, setupUrl),
          text: welcomeEmailText(teacherName, setupUrl),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Resend API error:', error);
        return { ok: false, error: 'Failed to send email' };
      }

      const result = await response.json();
      return { ok: true, messageId: result.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { ok: false, error: 'Failed to send email' };
    }
  },
});

export const sendPasswordResetEmail = action({
  args: {
    email: v.string(),
    teacherName: v.string(),
    resetToken: v.string(),
  },
  handler: async (ctx, { email, teacherName, resetToken }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return { ok: false, error: 'Email service not configured' };
    }

    const resetUrl = `${SITE_URL}/reset-password?token=${resetToken}`;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: 'Restablece tu contraseña',
          html: passwordResetHtml(teacherName, resetUrl),
          text: passwordResetText(teacherName, resetUrl),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Resend API error:', error);
        return { ok: false, error: 'Failed to send email' };
      }

      const result = await response.json();
      return { ok: true, messageId: result.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { ok: false, error: 'Failed to send email' };
    }
  },
});
