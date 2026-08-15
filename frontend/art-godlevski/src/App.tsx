import { useEffect, useState } from 'react';
import { helloResponseSchema, HelloResponse } from '@godlevski/schemas/controllers/hello';

export const App = () => {
  const [hello, setHello] = useState<HelloResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hello?name=art')
      .then(res => res.json())
      .then(json => setHello(helloResponseSchema.parse(json)))
      .catch(e => setError(String(e)));
  }, []);

  return (
    <main style={{ fontFamily: 'monospace', padding: '4rem', lineHeight: 1.8, background: '#111', color: '#eee', minHeight: '100vh' }}>
      <h1>art · godlevski</h1>
      <p>v3 boilerplate — rsbuild + react, served from R2, api via worker.</p>
      <pre style={{ background: '#222', padding: '1rem', borderRadius: 8 }}>
        {error
          ? `api unreachable: ${error}`
          : hello
            ? JSON.stringify(hello, null, 2)
            : 'pinging /api/hello ...'}
      </pre>
    </main>
  );
};
