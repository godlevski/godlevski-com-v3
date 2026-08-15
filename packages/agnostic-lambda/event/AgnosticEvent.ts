export interface AgnosticEvent<P = Record<string, any>> {
  uid: string,
  ip: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'GET' | 'DELETE' | 'OPTIONS' | string,
  headers: Record<string, string | undefined>,
  cookies: Record<string, string>,
  originalPath: string,
  filename?: string,
  paths: Array<string>,
  query: Record<string, string | string[]>,
  b64Query?: Record<string, any>,
  body: P,
  timeoutAtMs?: number,
  // platform bindings carrier (cloudflare env/ctx, express app locals, ...)
  // controllers narrow it via their platform's runtime type
  runtime?: unknown,
}
