// minimal HS256 JWT over WebCrypto — works in workerd and node (>=20) alike,
// replacing v2.1's jsonwebtoken (node-only)

const encoder = new TextEncoder();

const base64urlEncodeBytes = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const base64urlEncodeJson = (value: Record<string, unknown>): string =>
  base64urlEncodeBytes(encoder.encode(JSON.stringify(value)));

const base64urlDecodeJson = (value: string): Record<string, any> => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(atob(padded));
};

const getKey = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

export const signToken = async (
  payload: Record<string, unknown>,
  secret: string,
  expiresInMs: number
): Promise<string> => {
  const header = base64urlEncodeJson({ alg: 'HS256', typ: 'JWT' });
  const body = base64urlEncodeJson({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + expiresInMs) / 1000),
  });
  const signature = await crypto.subtle.sign('HMAC', await getKey(secret), encoder.encode(`${header}.${body}`));
  return `${header}.${body}.${base64urlEncodeBytes(new Uint8Array(signature))}`;
};

// returns the payload, or false on bad signature / malformed / expired
export const checkToken = async (
  token: string,
  secret: string
): Promise<Record<string, any> | false> => {
  try {
    const [header, body, signature] = String(token).split('.');
    if (!header || !body || !signature) return false;
    const base64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const signatureBytes = Uint8Array.from(atob(padded), char => char.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      'HMAC',
      await getKey(secret),
      signatureBytes,
      encoder.encode(`${header}.${body}`)
    );
    if (!valid) return false;
    const payload = base64urlDecodeJson(body);
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return false;
    return payload;
  } catch {
    return false;
  }
};
