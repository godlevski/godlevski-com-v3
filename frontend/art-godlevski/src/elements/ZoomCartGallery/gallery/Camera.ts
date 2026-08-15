import { LayoutCell } from '../../../types';
import { springStep, clamp } from '../../../utils/math';

export const MIN_SCALE = 0.18;
export const MAX_SCALE = 3.0;

const CAM_STIFFNESS = 100;
const CAM_DAMPING   = 18;

export class Camera {
  // Current state (animated)
  x     = 0;
  y     = 0;
  scale = 1;

  // Spring velocities
  private vx = 0;
  private vy = 0;
  private vs = 0;

  // Targets
  private tx = 0;
  private ty = 0;
  ts = 1;

  // ── Coordinate conversion ──────────────────────────────────────────────────

  toWorld(screenX: number, screenY: number, vw: number, vh: number): [number, number] {
    return [
      (screenX - vw / 2) / this.scale + this.x,
      (screenY - vh / 2) / this.scale + this.y,
    ];
  }

  toScreen(worldX: number, worldY: number, vw: number, vh: number): [number, number] {
    return [
      (worldX - this.x) * this.scale + vw / 2,
      (worldY - this.y) * this.scale + vh / 2,
    ];
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  /** Zoom toward a screen-space point (mouse pos or pinch center). */
  zoomAt(sx: number, sy: number, factor: number, vw: number, vh: number): void {
    const [wx, wy]  = this.toWorld(sx, sy, vw, vh);
    this.ts = clamp(this.ts * factor, MIN_SCALE, MAX_SCALE);
    // Keep the world point under cursor stationary
    this.tx = wx - (sx - vw / 2) / this.ts;
    this.ty = wy - (sy - vh / 2) / this.ts;
  }

  /** Instant pan by screen-space delta (dragging). */
  panBy(dx: number, dy: number): void {
    const delta = 1 / this.scale;
    this.tx -= dx * delta;
    this.ty -= dy * delta;
    // Apply immediately (no spring for drag — feels more direct)
    this.x   = this.tx;
    this.y   = this.ty;
    this.vx  = 0;
    this.vy  = 0;
  }

  /** Fit the whole cluster into the viewport. snap=true for instant, false to spring-animate. */
  fitTo(cells: LayoutCell[], vw: number, vh: number, snap = true): void {
    if (!cells.length) return;
    const xs = cells.flatMap(c => [c.baseX, c.baseX + c.w]);
    const ys = cells.flatMap(c => [c.baseY, c.baseY + c.h]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    this.tx = (minX + maxX) / 2;
    this.ty = (minY + maxY) / 2;
    this.ts = vw < vh
      ? (vw / (maxX - minX)) * 0.88
      : Math.min(vw / (maxX - minX), vh / (maxY - minY)) * 0.72;
    if (snap) {
      this.x = this.tx; this.y = this.ty;
      this.scale = this.ts;
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  step(dt: number): void {
    const [ns, nsv] = springStep(this.scale, this.vs, this.ts, CAM_STIFFNESS, CAM_DAMPING, dt);
    const [nx, nvx] = springStep(this.x,     this.vx, this.tx, CAM_STIFFNESS, CAM_DAMPING, dt);
    const [ny, nvy] = springStep(this.y,     this.vy, this.ty, CAM_STIFFNESS, CAM_DAMPING, dt);
    this.scale = ns; this.vs = nsv;
    this.x     = nx; this.vx = nvx;
    this.y     = ny; this.vy = nvy;
  }

  /** Apply the camera transform to a 2D context. Must be paired with ctx.restore(). */
  apply(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
    ctx.translate(vw / 2, vh / 2);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.x, -this.y);
  }
}
