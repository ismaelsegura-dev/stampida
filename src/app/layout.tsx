import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stampida - Tarjetas de Fidelización Digital',
  description: 'Plataforma SaaS de tarjetas de fidelización digitales para comercios locales',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
