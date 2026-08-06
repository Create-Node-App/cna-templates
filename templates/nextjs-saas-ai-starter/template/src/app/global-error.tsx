'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep a minimal client-side trace for unexpected global render errors.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '0.75rem',
            fontFamily: 'sans-serif',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h2>Something went wrong</h2>
          <button type="button" onClick={() => reset()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
