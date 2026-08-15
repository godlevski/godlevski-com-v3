import { AgnosticOutput } from '../event/AgnosticOutput';

// AgnosticOutput -> cloudflare workers Response
export const toWorkerResponse = (output: AgnosticOutput): Response => {
  const headers = new Headers(output.headers || {});
  output.cookies?.forEach(cookie => headers.append('set-cookie', cookie));

  let body: BodyInit | null = output.body ?? null;
  if (output.isBase64Encoded && output.body) {
    body = Uint8Array.from(atob(output.body), char => char.charCodeAt(0));
  }

  return new Response(output.statusCode === 204 ? null : body, {
    status: output.statusCode,
    headers
  });
};
