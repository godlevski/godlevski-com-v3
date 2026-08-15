import { LayoutCell, PhysicsBody } from '../../../types';
import { springStep, dist2 } from '../../../utils/math';

const STIFFNESS        = 160;
const DAMPING          = 20;
const SCALE_STIFFNESS  = 220;
const SCALE_DAMPING    = 26;
const HOVER_SCALE      = 1.22;
const INFLUENCE_RADIUS = 340;
const REPULSION_MAX    = 38;
const FADE_SPEED       = 1.8;

export function createBodies(cells: LayoutCell[]): Map<string, PhysicsBody> {
  const map = new Map<string, PhysicsBody>();
  for (const cell of cells) {
    map.set(cell.photo.id, {
      id: cell.photo.id,
      x: cell.baseX,
      y: cell.baseY,
      vx: 0, vy: 0,
      scale: 0.92, scaleV: 0,
      alpha: 0,
      image: null,
      imageLoaded: false,
    });
  }
  return map;
}

export function stepPhysics(
  bodies: Map<string, PhysicsBody>,
  cells: LayoutCell[],
  hoveredId: string | null,
  dt: number,
): void {
  let hcx = 0, hcy = 0;
  if (hoveredId) {
    const hc = cells.find(c => c.photo.id === hoveredId);
    if (hc) {
      const hb = bodies.get(hoveredId)!;
      hcx = hb.x + hc.w / 2;
      hcy = hb.y + hc.h / 2;
    }
  }

  for (const cell of cells) {
    const body = bodies.get(cell.photo.id)!;

    let targetX     = cell.baseX;
    let targetY     = cell.baseY;
    let targetScale = 1;

    if (hoveredId === cell.photo.id) {
      targetScale = HOVER_SCALE;
    } else if (hoveredId) {
      const cx = body.x + cell.w / 2;
      const cy = body.y + cell.h / 2;
      const d2 = dist2(cx, cy, hcx, hcy);
      const r2 = INFLUENCE_RADIUS ** 2;
      if (d2 < r2 && d2 > 0) {
        const d    = Math.sqrt(d2);
        const t    = 1 - d / INFLUENCE_RADIUS;
        const push = t * t * REPULSION_MAX;
        targetX   += (cx - hcx) / d * push;
        targetY   += (cy - hcy) / d * push;
      }
    }

    const [nx, nvx] = springStep(body.x,     body.vx,     targetX,     STIFFNESS,       DAMPING,       dt);
    const [ny, nvy] = springStep(body.y,      body.vy,     targetY,     STIFFNESS,       DAMPING,       dt);
    const [ns, nsv] = springStep(body.scale,  body.scaleV, targetScale, SCALE_STIFFNESS, SCALE_DAMPING, dt);

    body.x = nx; body.vx = nvx;
    body.y = ny; body.vy = nvy;
    body.scale = ns; body.scaleV = nsv;

    if (body.imageLoaded && body.alpha < 1) {
      body.alpha = Math.min(1, body.alpha + dt * FADE_SPEED);
    }
  }
}
