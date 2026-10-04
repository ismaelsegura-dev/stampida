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
