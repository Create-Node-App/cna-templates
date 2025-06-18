import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js Feature-Based App',
  description: 'A Next.js application using Feature-Based Architecture generated with Create Awesome Node App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="app">
          {children}
        </main>
      </body>
    </html>
  );
}
