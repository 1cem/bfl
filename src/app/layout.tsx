import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BFL GTM Engine — Usage & Billing',
  description: 'Production-grade metering and billing dashboard for Black Forest Labs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
