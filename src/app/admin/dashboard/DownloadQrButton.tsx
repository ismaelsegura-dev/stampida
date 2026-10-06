'use client';

export default function DownloadQrButton({ qrDataUrl, nombre }: { qrDataUrl: string; nombre: string }) {
  const download = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${nombre.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <button
      onClick={download}
      className="mt-2 w-full rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold transition-colors hover:border-ink"
    >
      Descargar QR (PNG)
    </button>
  );
}
