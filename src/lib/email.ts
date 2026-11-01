export async function sendVerificationEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Stampida <noreply@stampida.online>';

  if (!apiKey) {
    // Sin API key (desarrollo): el código sale por logs
    console.log(`[email] Código de verificación para ${email}: ${code}`);
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: `${code} es tu código de Stampida`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 22px; margin-bottom: 8px;">Bienvenido a Stampida</h1>
          <p style="color: #555; margin-bottom: 24px;">Introduce este código para verificar tu cuenta:</p>
          <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f5f5f4; border-radius: 12px; padding: 20px; margin: 0 0 24px;">${code}</p>
          <p style="color: #999; font-size: 13px;">El código caduca en 30 minutos. Si no has creado una cuenta, ignora este email.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    console.error('[email] Error Resend:', res.status, await res.text());
    return false;
  }
  return true;
}

export async function sendLeadNotificationEmail(lead: {
  negocio: string;
  email: string;
  color: string;
  sellos: number;
  premio: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Stampida <noreply@stampida.online>';
  const to = process.env.LEAD_NOTIFY_EMAIL || 'cmismaelsegura@gmail.com';

  if (!apiKey) {
    console.log('[email] Nuevo lead (sin RESEND_API_KEY):', lead);
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Nuevo lead: ${lead.negocio}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 22px; margin-bottom: 8px;">Nuevo lead desde la web</h1>
          <p style="color: #555;">Han diseñado una tarjeta en stampida.online:</p>
          <table style="font-size: 15px; margin: 16px 0; border-collapse: collapse;">
            <tr><td style="padding: 4px 16px 4px 0; color: #999;">Negocio</td><td><strong>${lead.negocio}</strong></td></tr>
            <tr><td style="padding: 4px 16px 4px 0; color: #999;">Email</td><td><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
            <tr><td style="padding: 4px 16px 4px 0; color: #999;">Sellos</td><td>${lead.sellos}</td></tr>
            <tr><td style="padding: 4px 16px 4px 0; color: #999;">Premio</td><td>${lead.premio}</td></tr>
            <tr><td style="padding: 4px 16px 4px 0; color: #999;">Color</td><td><span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${lead.color};vertical-align:middle;margin-right:6px;"></span>${lead.color}</td></tr>
          </table>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    console.error('[email] Error Resend (lead):', res.status, await res.text());
    return false;
  }
  return true;
}
