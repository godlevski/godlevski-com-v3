// base64url-encoded JSON payloads (`?_b64=...`) — lets deep query objects ride
// a single URL-safe param instead of a forest of encoded brackets
export const base64urlDecode = (value: string): Record<string, any> | undefined => {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = typeof atob === 'function'
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString();
    return JSON.parse(decoded);
  } catch {
    return undefined;
  }
};

export const base64urlEncode = (value: Record<string, any>): string => {
  const json = JSON.stringify(value);
  const base64 = typeof btoa === 'function'
    ? btoa(json)
    : Buffer.from(json).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
