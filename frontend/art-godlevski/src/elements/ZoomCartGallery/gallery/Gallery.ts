import { Photo, LayoutCell, GroupBounds, PhysicsBody, GalleryConfig, ViewMode } from '../../../types';
import { computeLayout, computeCircleLayout } from './Layout';
import { createBodies, stepPhysics } from './Physics';
import { Camera } from './Camera';
import { render } from './Renderer';

const THUMB_HEIGHT    = 600;
const RESIZE_DEBOUNCE = 150;

export class Gallery {
  private canvas:       HTMLCanvasElement;
  private ctx:          CanvasRenderingContext2D;
  private dpr:          number;
  private onPhotoClick:  GalleryConfig['onPhotoClick'];
  private onScaleChange: GalleryConfig['onScaleChange'];
  private onFitScale:    GalleryConfig['onFitScale'];
  private bgColor:       string;
  private lastReportedScale = 1;

  private photos:   Photo[]                    = [];
  private cells:    LayoutCell[]               = [];
  private groups:   GroupBounds[]              = [];
  private bodies:   Map<string, PhysicsBody>   = new Map();
  private camera:   Camera                     = new Camera();
  private hoveredId: string | null             = null;
  private viewMode: ViewMode                   = 'axis';

  private lastTime:  number = 0;
  private rafId:     number = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Viewport insets (set by cart panel) ──────────────────────────────────
  private insetBottom = 0;
  private insetRight  = 0;
  private get effW() { return window.innerWidth  - this.insetRight;  }
  private get effH() { return window.innerHeight - this.insetBottom; }

  // ── Pan state ────────────────────────────────────────────────────────────
  private isPanning   = false;
  private panStartX   = 0;
  private panStartY   = 0;
  private panMoved    = false;

  constructor(config: GalleryConfig) {
    this.canvas        = config.canvasEl;
    this.ctx           = this.canvas.getContext('2d')!;
    this.dpr           = Math.min(window.devicePixelRatio || 1, 2);
    this.onPhotoClick  = config.onPhotoClick;
    this.onScaleChange = config.onScaleChange;
    this.onFitScale    = config.onFitScale;
    this.bgColor       = config.bgColor ??
      getComputedStyle(document.documentElement).getPropertyValue('--bg-indigo').trim();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  load(photos: Photo[]): void {
    this.photos = photos;
    this.setupCanvas();
    this.buildLayout(true);
    this.loadImages();
    this.bindEvents();
    this.start();
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    this.unbindEvents();
    document.body.style.overflow = '';
    document.body.style.height   = '';
  }

  resume(): void {
    this.lastTime = 0;
    this.start();
  }

  setViewMode(mode: ViewMode): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.buildLayout(false); // animate bodies, spring camera
  }

  setInset(bottom: number, right: number): void {
    this.insetBottom = bottom;
    this.insetRight  = right;
    this.setupCanvas();
    this.buildLayout(false); // spring to new viewport
  }

  /** Zoom toward the viewport center by a multiplier (e.g. 1.1 = in, 0.9 = out). */
  adjustZoom(factor: number): void {
    this.camera.zoomAt(this.effW / 2, this.effH / 2, factor, this.effW, this.effH);
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  private setupCanvas(): void {
    const vw = this.effW;
    const vh = this.effH;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width  = vw * this.dpr;
    this.canvas.height = vh * this.dpr;
    this.canvas.style.width  = `${vw}px`;
    this.canvas.style.height = `${vh}px`;
    document.body.style.overflow = 'hidden';
    document.body.style.height   = '100vh';
  }

  private buildLayout(snap: boolean): void {
    const vw = this.effW;
    const vh = this.effH;
    const { cells, groups } = this.viewMode === 'circle'
      ? computeCircleLayout(this.photos, vw, vh)
      : computeLayout(this.photos, vw, vh);
    this.cells  = cells;
    this.groups = groups;

    if (this.bodies.size === 0) {
      this.bodies = createBodies(cells);
      this.camera.fitTo(cells, vw, vh, true);
    } else {
      if (snap) {
        for (const cell of cells) {
          const b = this.bodies.get(cell.photo.id);
          if (b) { b.x = cell.baseX; b.y = cell.baseY; b.vx = 0; b.vy = 0; }
        }
      }
      // snap=false: bodies spring to new baseX/baseY via physics
      this.camera.fitTo(cells, vw, vh, snap);
    }
    this.onFitScale?.(this.camera.ts);
  }

  private loadImages(): void {
    for (const cell of this.cells) {
      const body = this.bodies.get(cell.photo.id)!;
      if (body.image) continue;

      const url  = `${cell.photo.src}?h=${THUMB_HEIGHT}&p=true`;
      const img  = new Image();
      img.onload = () => { body.image = img; body.imageLoaded = true; };
      body.image = img;
      img.src    = url;
    }
  }

  // ── RAF loop ──────────────────────────────────────────────────────────────

  private start(): void {
    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.rafId = requestAnimationFrame(this.tick);
    const dt = this.lastTime ? Math.min((now - this.lastTime) / 1000, 0.05) : 0.016;
    this.lastTime = now;

    this.camera.step(dt);
    stepPhysics(this.bodies, this.cells, this.hoveredId, dt);
    render(this.ctx, this.cells, this.groups, this.bodies, this.camera, this.dpr, this.bgColor);

    if (this.onScaleChange && Math.abs(this.camera.scale - this.lastReportedScale) > 0.001) {
      this.lastReportedScale = this.camera.scale;
      this.onScaleChange(this.camera.scale);
    }
  };

  // ── Hit testing (world space) ─────────────────────────────────────────────

  private hitTest(clientX: number, clientY: number): { cell: LayoutCell; screenRect: DOMRect } | null {
    const vw = this.effW;
    const vh = this.effH;
    const [wx, wy] = this.camera.toWorld(clientX, clientY, vw, vh);

    const sorted = [...this.cells].sort((a, b) =>
      (this.bodies.get(b.photo.id)?.scale ?? 1) - (this.bodies.get(a.photo.id)?.scale ?? 1),
    );

    for (const cell of sorted) {
      const body = this.bodies.get(cell.photo.id)!;
      const hw = cell.w * body.scale / 2;
      const hh = cell.h * body.scale / 2;
      const cx = body.x + cell.w / 2;
      const cy = body.y + cell.h / 2;

      if (wx >= cx - hw && wx <= cx + hw && wy >= cy - hh && wy <= cy + hh) {
        const [sx0, sy0] = this.camera.toScreen(cx - hw, cy - hh, vw, vh);
        const [sx1, sy1] = this.camera.toScreen(cx + hw, cy + hh, vw, vh);
        const rect = new DOMRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
        return { cell, screenRect: rect };
      }
    }
    return null;
  }

  // ── Mouse events ──────────────────────────────────────────────────────────

  private onMouseMove = (e: MouseEvent): void => {
    if (this.isPanning) {
      const dx = e.clientX - this.panStartX;
      const dy = e.clientY - this.panStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.panMoved = true;
      this.camera.panBy(dx, dy);
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      return;
    }

    const hit = this.hitTest(e.clientX, e.clientY);
    const nextId = hit?.cell.photo.id ?? null;
    if (nextId !== this.hoveredId) {
      this.hoveredId = nextId;
      this.canvas.style.cursor = nextId ? 'pointer' : 'grab';
    }
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    this.isPanning  = true;
    this.panMoved   = false;
    this.panStartX  = e.clientX;
    this.panStartY  = e.clientY;
    this.canvas.style.cursor = 'grabbing';
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (!this.isPanning) return;
    this.isPanning = false;
    this.canvas.style.cursor = 'grab';

    if (!this.panMoved) {
      const hit = this.hitTest(e.clientX, e.clientY);
      if (hit) this.onPhotoClick(hit.cell.photo, hit.screenRect);
    }
  };

  private onMouseLeave = (): void => {
    this.hoveredId = null;
    this.isPanning = false;
    this.canvas.style.cursor = 'grab';
  };

  // ── Wheel zoom ────────────────────────────────────────────────────────────

  private onWheel = (e: WheelEvent): void => {
    if (!e.ctrlKey) return; // only handle trackpad pinch (ctrlKey), not scroll wheel
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 1 / 1.05;
    this.camera.zoomAt(e.clientX, e.clientY, factor, this.effW, this.effH);
  };

  // ── Touch events ──────────────────────────────────────────────────────────

  private touchStartX  = 0;
  private touchStartY  = 0;
  private touchMoved   = false;
  private lastTouchX   = 0;
  private lastTouchY   = 0;
  private lastPinchDist = 0;

  private onTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      this.touchStartX  = this.lastTouchX = e.touches[0].clientX;
      this.touchStartY  = this.lastTouchY = e.touches[0].clientY;
      this.touchMoved   = false;
      this.lastPinchDist = 0;
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      this.lastPinchDist = Math.hypot(dx, dy);
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx   = e.touches[1].clientX - e.touches[0].clientX;
      const dy   = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      if (this.lastPinchDist > 0) {
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.camera.zoomAt(cx, cy, dist / this.lastPinchDist, this.effW, this.effH);
      }
      this.lastPinchDist = dist;
      this.touchMoved = true;
    } else if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - this.lastTouchX;
      const dy = e.touches[0].clientY - this.lastTouchY;
      if (
        Math.abs(e.touches[0].clientX - this.touchStartX) > 8 ||
        Math.abs(e.touches[0].clientY - this.touchStartY) > 8
      ) this.touchMoved = true;
      this.camera.panBy(dx, dy);
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length < 2) this.lastPinchDist = 0;
    if (!this.touchMoved && e.changedTouches.length === 1) {
      const hit = this.hitTest(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      if (hit) this.onPhotoClick(hit.cell.photo, hit.screenRect);
    }
  };

  // ── Resize ────────────────────────────────────────────────────────────────

  private onResize = (): void => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.setupCanvas();
      this.buildLayout(true);
    }, RESIZE_DEBOUNCE);
  };

  // ── Bind / unbind ─────────────────────────────────────────────────────────

  private bindEvents(): void {
    this.canvas.addEventListener('mousemove',  this.onMouseMove);
    this.canvas.addEventListener('mousedown',  this.onMouseDown);
    this.canvas.addEventListener('mouseup',    this.onMouseUp);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
    this.canvas.addEventListener('wheel',      this.onWheel,      { passive: false });
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove',  this.onTouchMove,  { passive: false });
    this.canvas.addEventListener('touchend',   this.onTouchEnd,   { passive: true });
    window.addEventListener('resize', this.onResize);
  }

  private unbindEvents(): void {
    this.canvas.removeEventListener('mousemove',  this.onMouseMove);
    this.canvas.removeEventListener('mousedown',  this.onMouseDown);
    this.canvas.removeEventListener('mouseup',    this.onMouseUp);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('wheel',      this.onWheel);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove',  this.onTouchMove);
    this.canvas.removeEventListener('touchend',   this.onTouchEnd);
    window.removeEventListener('resize', this.onResize);
  }
}
