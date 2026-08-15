import { Env } from '../env';

// port of v2.1 slides_server/slidesServerController: originals live in R2
// (slides/originals/<file>), resize/crop happens through the Images binding,
// derivatives are cached at the edge (cache-control) instead of a cache/ dir.
//
// query contract (unchanged from v2.1):
//   w, h        target size, px or % of source (single dimension keeps aspect)
//   p           proportional flag — implicit now (single-dim resizes keep
//               aspect by default), accepted and ignored
//   q           quality: 0-1 float (react) or 1-100 int
//   x0,x1,y0,y1 crop box, px or % of source

const TRANSFORMABLE = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const OUTPUT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

// '50%' of 1200 -> 600; '340' -> 340
const resolveSizeValue = (value: string, sourceSize: number): number =>
  value.endsWith('%')
    ? Math.round((parseFloat(value) / 100) * sourceSize)
    : Math.round(parseFloat(value));

export const slidesController = async (
  env: Env,
  filename: string,
  query: URLSearchParams
): Promise<Response> => {
  const key = `slides/originals/${filename}`;
  const ext = filename.replace(/.*\./, '').toLowerCase();

  const object = await env.FILES.get(key);
  if (!object) {
    return new Response('no such file or directory', { status: 404 });
  }

  const hasTransformParams = ['w', 'h', 'q', 'x0', 'x1', 'y0', 'y1']
    .some(param => query.has(param));

  const baseHeaders = new Headers();
  object.writeHttpMetadata(baseHeaders);
  baseHeaders.set('etag', object.httpEtag);
  if (!baseHeaders.has('content-type') && OUTPUT_MIME[ext]) {
    baseHeaders.set('content-type', OUTPUT_MIME[ext]);
  }
  // upload names carry a content hash -> safe to cache long
  baseHeaders.set('cache-control', 'public, max-age=31536000, immutable');

  // no params (or untransformable type) -> stream the original
  if (!hasTransformParams || !TRANSFORMABLE.has(ext)) {
    return new Response(object.body, { headers: baseHeaders });
  }

  try {
    const hasCrop = ['x0', 'x1', 'y0', 'y1'].some(param => query.has(param));
    const needsSourceDims = hasCrop
      || query.get('w')?.endsWith('%')
      || query.get('h')?.endsWith('%');

    // % values and crop boxes resolve against source dimensions; info()
    // consumes a stream, so re-get the object for the actual transform
    let sourceWidth = 0;
    let sourceHeight = 0;
    let inputStream: ReadableStream = object.body;
    if (needsSourceDims) {
      const info = await env.IMAGES.info(object.body);
      if (!('width' in info)) throw new Error('not a decodable raster image');
      sourceWidth = info.width;
      sourceHeight = info.height;
      const reFetched = await env.FILES.get(key);
      if (!reFetched) throw new Error('object vanished between reads');
      inputStream = reFetched.body;
    }

    const transform: ImageTransform = {};

    // crop box -> trim borders (pixels cut off each side)
    if (hasCrop) {
      const x0 = resolveSizeValue(query.get('x0') || '0%', sourceWidth);
      const x1 = resolveSizeValue(query.get('x1') || '100%', sourceWidth);
      const y0 = resolveSizeValue(query.get('y0') || '0%', sourceHeight);
      const y1 = resolveSizeValue(query.get('y1') || '100%', sourceHeight);
      transform.trim = {
        left: Math.min(x0, x1),
        top: Math.min(y0, y1),
        width: Math.abs(x1 - x0),
        height: Math.abs(y1 - y0),
      };
    }

    if (query.has('w')) transform.width = resolveSizeValue(query.get('w')!, sourceWidth);
    if (query.has('h')) transform.height = resolveSizeValue(query.get('h')!, sourceHeight);
    // v2.1 sharp used fit:'fill' (stretch to exact dims); 'squeeze' is the
    // images equivalent — only relevant when both dims are pinned
    if (transform.width && transform.height) transform.fit = 'squeeze';

    // quality: react sends 0-1 float, images expects 1-100 int
    const rawQ = query.has('q') ? parseFloat(query.get('q')!) : null;
    const quality = rawQ !== null
      ? Math.max(1, Math.min(100, Math.round(rawQ <= 1 ? rawQ * 100 : rawQ)))
      : 85;

    const result = await env.IMAGES
      .input(inputStream)
      .transform(transform)
      .output({ format: OUTPUT_MIME[ext] as ImageOutputOptions['format'], quality });

    const response = result.response();
    const headers = new Headers(response.headers);
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    return new Response(response.body, { status: response.status, headers });
  } catch (e) {
    // transform failed (unsupported op locally, corrupt file, ...) ->
    // degrade to the original rather than a broken image
    console.error(`[slidesController] transform failed for ${key}: ${String((e as Error).message)}`);
    const fallback = await env.FILES.get(key);
    if (!fallback) return new Response('not found', { status: 404 });
    return new Response(fallback.body, { headers: baseHeaders });
  }
};
