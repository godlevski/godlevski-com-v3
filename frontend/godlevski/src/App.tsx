import { useEffect, useState } from 'react';
import { healthResponseSchema, HealthResponse } from '@godlevski/schemas/controllers/health';

export const App = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(json => setHealth(healthResponseSchema.parse(json)))
      .catch(e => setError(String(e)));
  }, []);

  return (
    <main style={{ fontFamily: 'monospace', padding: '4rem', lineHeight: 1.8 }}>
      <h1>godlevski</h1>
      <p>v3 boilerplate — rsbuild + react, served from R2, api via worker.</p>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: 8 }}>
        {error
          ? `api unreachable: ${error}`
          : health
            ? JSON.stringify(health, null, 2)
            : 'pinging /api/health ...'}
      </pre>
    </main>
  );
};
