import { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
