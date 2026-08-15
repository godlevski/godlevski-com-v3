import { LayoutCell, GroupBounds, PhysicsBody } from '../../../types';
import { Camera } from './Camera';

const PLACEHOLDER_BORDER = '#1c1c28';
const BOX_COLOR          = 'rgba(216,212,204,0.14)';
const LABEL_COLOR        = 'rgba(216,212,204,0.38)';

export function render(
  ctx: CanvasRenderingContext2D,
  cells: LayoutCell[],
  groups: GroupBounds[],
  bodies: Map<string, PhysicsBody>,
  camera: Camera,
  dpr: number,
  bgColor: string,
): void {
  const vw = ctx.canvas.width  / dpr;
  const vh = ctx.canvas.height / dpr;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, vw, vh);

  ctx.save();
  camera.apply(ctx, vw, vh);

  // Compute visible world-space bounds for frustum culling
  const [wx0, wy0] = camera.toWorld(0,  0,  vw, vh);
  const [wx1, wy1] = camera.toWorld(vw, vh, vw, vh);
  const BUFFER = 300;

  // ── Group boxes (drawn below photos) ──────────────────────────────────────
  for (const group of groups) {
    drawGroupBox(ctx, group, camera.scale);
  }

  // ── Photos ────────────────────────────────────────────────────────────────
  // Sort so hovered (higher scale) image renders on top
  const sorted = [...cells].sort((a, b) =>
    (bodies.get(a.photo.id)?.scale ?? 1) - (bodies.get(b.photo.id)?.scale ?? 1),
  );

  for (const cell of sorted) {
    const body = bodies.get(cell.photo.id);
    if (!body) continue;

    if (
      body.x + cell.w < wx0 - BUFFER || body.x > wx1 + BUFFER ||
      body.y + cell.h < wy0 - BUFFER || body.y > wy1 + BUFFER
    ) continue;

    const cx = body.x + cell.w / 2;
    const cy = body.y + cell.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(body.scale, body.scale);
    ctx.translate(-cx, -cy);

    if (!body.imageLoaded || !body.image) {
      ctx.fillStyle   = bgColor;
      ctx.fillRect(body.x, body.y, cell.w, cell.h);
      ctx.strokeStyle = PLACEHOLDER_BORDER;
      ctx.lineWidth   = 0.5;
      ctx.strokeRect(body.x + 0.5, body.y + 0.5, cell.w - 1, cell.h - 1);
    } else {
      ctx.globalAlpha = body.alpha;
      ctx.drawImage(body.image, body.x, body.y, cell.w, cell.h);
    }

    ctx.restore();
  }

  ctx.restore(); // camera
  ctx.restore(); // dpr scale
}

function drawGroupBox(
  ctx: CanvasRenderingContext2D,
  group: GroupBounds,
  cameraScale: number,
): void {
  const { x, y, w, h, openSides, label } = group;
  const open = new Set(openSides);

  ctx.save();
  ctx.strokeStyle = BOX_COLOR;
  ctx.lineWidth   = 1 / cameraScale;

  // Draw only the closed sides
  ctx.beginPath();
  if (!open.has('top'))    { ctx.moveTo(x,     y);     ctx.lineTo(x + w, y);     }
  if (!open.has('right'))  { ctx.moveTo(x + w, y);     ctx.lineTo(x + w, y + h); }
  if (!open.has('bottom')) { ctx.moveTo(x + w, y + h); ctx.lineTo(x,     y + h); }
  if (!open.has('left'))   { ctx.moveTo(x,     y + h); ctx.lineTo(x,     y);     }
  ctx.stroke();

  // Label: outside the box on the interior-facing side
  //  - if top is closed → above the top edge, left-aligned
  //  - else → below the bottom edge, left-aligned
  const fontSize = Math.round(10 / cameraScale);
  const pad      = 5 / cameraScale;
  ctx.font         = `${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle    = LABEL_COLOR;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign    = 'left';

  // openSides[0] is the primary outer edge (set first by placeRow/placeCol).
  // Horizontal rows: non-rightmost boxes right-align their label to the right
  // edge so text gravitates toward the centre; the rightmost box places its
  // label in the open space just past the right edge.
  const outer       = group.openSides[0];
  const isRightmost = open.has('right');

  if (outer === 'top') {
    if (isRightmost) {
      ctx.fillText(label, x + pad, y - pad);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText(label, x + w - pad, y - pad);
    }
  } else if (outer === 'bottom') {
    if (isRightmost) {
      ctx.fillText(label, x + pad, y + h + fontSize * 1.4);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText(label, x + w - pad, y + h + fontSize * 1.4);
    }
  } else if (outer === 'left') {
    ctx.textAlign = 'left';
    ctx.fillText(label, x + pad, y + pad + fontSize);
  } else {
    ctx.textAlign = 'right';
    ctx.fillText(label, x + w - pad, y + pad + fontSize);
  }

  ctx.restore();
}
