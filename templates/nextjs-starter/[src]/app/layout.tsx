import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js Starter',
  description: 'A polished feature-based Next.js starter generated with Create Awesome Node App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main className="app">
          {children}
        </main>
      </body>
    </html>
  );
}
