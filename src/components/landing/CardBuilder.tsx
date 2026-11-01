'use client';

import { useState } from 'react';

const COLORES = [
  { nombre: 'Café', valor: '#5C4033' },
  { nombre: 'Medianoche', valor: '#22303F' },
  { nombre: 'Terracota', valor: '#7A3E2D' },
  { nombre: 'Oliva', valor: '#4A5240' },
  { nombre: 'Negro', valor: '#050505' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FocusField = 'negocio' | 'color' | 'sellos' | 'premio' | null;

export default function CardBuilder() {
  const [negocio, setNegocio] = useState('');
  const [color, setColor] = useState(COLORES[0].valor);
  const [sellos, setSellos] = useState(8);
  const [premio, setPremio] = useState('');
  const [email, setEmail] = useState('');
  const [flip, setFlip] = useState(false);
  const [focus, setFocus] = useState<FocusField>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [intentado, setIntentado] = useState(false);

  const emailValido = EMAIL_RE.test(email);
  const negocioOk = negocio.trim().length >= 2;
  const premioOk = premio.trim().length >= 3;
  const completo = negocioOk && premioOk && emailValido;
  const faltaNegocio = intentado && !negocioOk;
  const faltaPremio = intentado && !premioOk;
  const faltaEmail = intentado && !emailValido;
  const conseguidos = Math.max(sellos - 1, 0);
  const nombreTarjeta = negocio.trim() || 'Tu negocio';
  const textoPremio = premio.trim() || 'Tu premio de fidelidad';

  const highlight = (zona: Exclude<FocusField, null>) =>
    `transition-all duration-300 ${
      focus === zona ? 'rounded-lg ring-2 ring-white/70 ring-offset-2 ring-offset-transparent' : ''
    }`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    if (!completo) {
      setIntentado(true);
      const id = !negocioOk ? 'cb-negocio' : !premioOk ? 'cb-premio' : 'cb-email';
      document.getElementById(id)?.focus();
      return;
    }
    setEnviando(true);
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negocio: negocio.trim(),
          email: email.trim(),
          color,
          sellos,
          premio: premio.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      setEnviado(true);
      setFlip(true);
    } catch {
      setError('No se pudo enviar. Inténtalo de nuevo en unos segundos.');
    } finally {
      setEnviando(false);
    }
  }

  const inputClases =
    'w-full rounded-xl border border-ivory/20 bg-ivory/5 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 outline-none transition-colors focus:border-ivory/60';
  const inputErrorClases = ' !border-red-300/80 !bg-red-400/10';
  const labelClases =
    'mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-ivory/50';
  const hintClases = 'mt-1.5 text-xs text-red-300';

  return (
    <div className="mt-14 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
      {/* Formulario */}
      {enviado ? (
        <div className="flex h-full flex-col justify-center rounded-2xl border border-olive/40 bg-olive/10 p-8">
          <p className="font-display text-3xl italic tracking-tight">Diseño recibido</p>
          <p className="mt-4 text-sm leading-relaxed text-ivory/70">
            Ya tenemos la tarjeta de <strong className="text-ivory">{nombreTarjeta}</strong>. Te
            escribimos a <strong className="text-ivory">{email}</strong> para activarla con tu
            marca. Sin permanencias, sin letra pequeña.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
          <div>
            <label htmlFor="cb-negocio" className={labelClases}>
              Nombre de tu negocio
            </label>
            <input
              id="cb-negocio"
              type="text"
              maxLength={40}
              placeholder="Café Nómada"
              value={negocio}
              onChange={(e) => setNegocio(e.target.value)}
              onFocus={() => setFocus('negocio')}
              onBlur={() => setFocus(null)}
              className={faltaNegocio ? inputClases + inputErrorClases : inputClases}
            />
            {faltaNegocio && <p className={hintClases}>¿Cómo se llama tu negocio?</p>}
          </div>

          <div>
            <span className={labelClases}>Color de tu tarjeta</span>
            <div
              className="flex gap-3"
              onFocus={() => setFocus('color')}
              onBlur={() => setFocus(null)}
            >
              {COLORES.map((c) => (
                <button
                  key={c.valor}
                  type="button"
                  title={c.nombre}
                  aria-label={`Color ${c.nombre}`}
                  aria-pressed={color === c.valor}
                  onClick={() => {
                    setColor(c.valor);
                    setFocus('color');
                  }}
                  className={`h-9 w-9 rounded-full transition-all duration-200 ${
                    color === c.valor
                      ? 'scale-110 ring-2 ring-ivory ring-offset-2 ring-offset-ink'
                      : 'opacity-60 hover:scale-105 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.valor }}
                />
              ))}
            </div>
          </div>

          <div>
            <span className={labelClases}>Sellos para el premio</span>
            <div
              className="flex items-center gap-4"
              onFocus={() => setFocus('sellos')}
              onBlur={() => setFocus(null)}
            >
              <button
                type="button"
                aria-label="Quitar un sello"
                onClick={() => setSellos((s) => Math.max(4, s - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/25 text-lg transition-colors hover:border-ivory/60"
              >
                −
              </button>
              <span className="w-10 text-center font-display text-3xl tabular-nums">{sellos}</span>
              <button
                type="button"
                aria-label="Añadir un sello"
                onClick={() => setSellos((s) => Math.min(12, s + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/25 text-lg transition-colors hover:border-ivory/60"
              >
                +
              </button>
              <span className="text-xs text-ivory/45">De 4 a 12 sellos</span>
            </div>
          </div>

          <div>
            <label htmlFor="cb-premio" className={labelClases}>
              Tu premio
            </label>
            <input
              id="cb-premio"
              type="text"
              maxLength={60}
              placeholder="El décimo café lo ponemos nosotros"
              value={premio}
              onChange={(e) => setPremio(e.target.value)}
              onFocus={() => setFocus('premio')}
              onBlur={() => setFocus(null)}
              className={faltaPremio ? inputClases + inputErrorClases : inputClases}
            />
            {faltaPremio && <p className={hintClases}>¿Qué premio gana tu cliente?</p>}
          </div>

          <div>
            <label htmlFor="cb-email" className={labelClases}>
              Tu email
            </label>
            <input
              id="cb-email"
              type="email"
              autoComplete="email"
              placeholder="hola@tunegocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={faltaEmail ? inputClases + inputErrorClases : inputClases}
            />
            {faltaEmail && (
              <p className={hintClases}>
                {email.trim() ? 'Ese email no parece válido' : '¿A qué email te escribimos?'}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className={`mt-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-all ${
              completo && !enviando
                ? 'bg-ivory text-ink hover:bg-white'
                : 'bg-ivory/40 text-ink/70 hover:bg-ivory/60'
            }`}
          >
            {enviando ? 'Enviando…' : '¡La quiero en mi negocio!'}
          </button>
          {!completo && (
            <p className="text-center text-xs text-ivory/40">
              Rellena los campos de arriba y es tuya
            </p>
          )}
        </form>
      )}

      {/* Previsualización con flip */}
      <div className="mx-auto w-full max-w-sm">
        <button
          type="button"
          onClick={() => setFlip((f) => !f)}
          aria-label={flip ? 'Ver la tarjeta' : 'Ver la notificación'}
          className="block w-full [perspective:1200px]"
        >
          <div
            className={`relative transition-transform duration-700 [transform-style:preserve-3d] ${
              flip ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            {/* Anverso: tarjeta de fidelidad */}
            <div
              className={`rounded-3xl p-6 text-white shadow-2xl shadow-black/50 transition-all duration-500 [backface-visibility:hidden] ${
                focus === 'color' ? 'ring-4 ring-white/40' : ''
              }`}
              style={{ backgroundColor: color }}
            >
              <div className={`flex items-baseline justify-between ${highlight('negocio')}`}>
                <p className="font-display text-2xl tracking-tight">{nombreTarjeta}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Tarjeta de fidelidad
                </p>
              </div>

              <div className={`mt-8 flex items-center justify-between gap-1.5 ${highlight('sellos')}`}>
                {Array.from({ length: sellos }).map((_, i) => (
                  <span
                    key={i}
                    className={`aspect-square flex-1 rounded-full border transition-all duration-300 ${
                      i < conseguidos ? 'border-white bg-white' : 'border-white/35 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-baseline justify-between gap-3">
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {conseguidos}/{sellos} sellos
                </p>
                <p className={`text-right text-xs text-white/70 ${highlight('premio')}`}>
                  {textoPremio}
                </p>
              </div>

              <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
                Powered by Stampida
              </p>
            </div>

            {/* Reverso: notificación push */}
            <div className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="w-[92%] rounded-2xl border border-ink/5 bg-white/95 p-4 shadow-2xl shadow-black/50">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-sm italic text-ivory">
                    S
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                      <span className="truncate">{nombreTarjeta}</span>
                      <span className="shrink-0 font-normal normal-case">ahora</span>
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-ink/85">
                      {enviado
                        ? `Diseño recibido. La tarjeta de ${nombreTarjeta} ya está en marcha.`
                        : `Buenos días. ${textoPremio.charAt(0).toUpperCase()}${textoPremio.slice(1)}. Te esperamos.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>

        <p className="mt-5 text-center text-xs text-ivory/40">
          {flip ? 'Toca para volver a la tarjeta' : 'Toca la tarjeta: así llegan tus notificaciones'}
        </p>
      </div>
    </div>
  );
}
