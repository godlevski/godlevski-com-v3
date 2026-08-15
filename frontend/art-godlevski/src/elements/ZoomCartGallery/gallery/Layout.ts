import { Photo, LayoutCell, GroupBounds, LayoutResult } from '../../../types';

const GAP        = 14;  // px between photos inside a group
const BOX_MARGIN = 20;  // padding between photos and their box edge

function pxPerInch(vw: number, vh: number): number {
  return Math.min(vw, vh) * 0.009;
}

function canonicalKey(pw: number, ph: number): string {
  const [a, b] = pw <= ph ? [pw, ph] : [ph, pw];
  return `${a}×${b}"`;
}

interface InternalCell {
  photo: Photo;
  lx: number; ly: number;
  w: number;  h: number;
}

interface InternalGroup {
  key:    string;
  cells:  InternalCell[];
  gw:     number;  // tight photo-content width
  gh:     number;  // tight photo-content height
  weight: number;  // Σ printW×printH — visual mass
}

// ── Step 1: build each group's internal grid ──────────────────────────────────
// Photos sorted wider-aspect-ratio first, packed into a roughly-square grid.
// The layout origin is always top-left; flipping is applied later in step 3.
function buildGroupLayout(photos: Photo[], ppi: number): InternalGroup {
  const sorted = [...photos].sort(
    (a, b) => (b.printW / b.printH) - (a.printW / a.printH),
  );
  const cols = Math.max(1, Math.ceil(Math.sqrt(sorted.length)));
  const cells: InternalCell[] = [];
  let x = 0, y = 0, rowMaxH = 0, col = 0, gw = 0;

  for (const photo of sorted) {
    const w = Math.round(photo.printW * ppi);
    const h = Math.round(photo.printH * ppi);
    if (col > 0 && col >= cols) {
      y += rowMaxH + GAP; x = 0; rowMaxH = 0; col = 0;
    }
    cells.push({ photo, lx: x, ly: y, w, h });
    gw      = Math.max(gw, x + w);
    rowMaxH = Math.max(rowMaxH, h);
    x      += w + GAP;
    col++;
  }

  const weight = photos.reduce((s, p) => s + p.printW * p.printH, 0);
  return { key: '', cells, gw, gh: y + rowMaxH, weight };
}

// ── Step 3 helper: re-anchor the photo grid ────────────────────────────────────
// Flip cell positions so the "heavy" (wide-aspect) photos are at the corner
// that faces the axis, matching the axis-orientation anchor rules.
function applyFlip(g: InternalGroup, flipX: boolean, flipY: boolean): void {
  if (flipY) for (const c of g.cells) c.ly = g.gh - c.ly - c.h;
  if (flipX) for (const c of g.cells) c.lx = g.gw - c.lx - c.w;
}

// ── Step 2 helper: greedy 2-way split balancing total "size" ──────────────────
function splitGroups(
  groups: InternalGroup[],
  measure: (g: InternalGroup) => number,
): [InternalGroup[], InternalGroup[]] {
  const a: InternalGroup[] = [], b: InternalGroup[] = [];
  let ta = 0, tb = 0;
  for (const g of groups) {
    const m = measure(g) + 2 * BOX_MARGIN;
    if (ta <= tb) { a.push(g); ta += m; }
    else          { b.push(g); tb += m; }
  }
  return [a, b];
}

function emitCells(
  out: LayoutCell[],
  g: InternalGroup,
  cx: number,   // world-space top-left of content area
  cy: number,
): void {
  for (const c of g.cells) {
    out.push({
      photo: c.photo,
      baseX: cx + c.lx,
      baseY: cy + c.ly,
      w: c.w, h: c.h, col: 0,
    });
  }
}

// ── Row placement (horizontal axis) ───────────────────────────────────────────
// top=true  → box bottoms sit at y=0 (top row, above axis)
// top=false → box tops sit at y=0 (bottom row, below axis)
// Boxes hug their content: box = content + BOX_MARGIN on every side.
// The row is independently centered at x=0.
// Open sides: the outer facing side (top/bottom) plus left on first, right on last.
function placeRow(
  half: InternalGroup[],
  isTop: boolean,
  cells: LayoutCell[],
  groups: GroupBounds[],
): void {
  const rowW = half.reduce((s, g) => s + g.gw + 2 * BOX_MARGIN, 0);
  let x = -rowW / 2;

  half.forEach((g, i) => {
    const bw = g.gw + 2 * BOX_MARGIN;
    const bh = g.gh + 2 * BOX_MARGIN;
    const bx = x;
    const by = isTop ? -bh : 0;

    emitCells(cells, g, bx + BOX_MARGIN, by + BOX_MARGIN);

    const openSides: ('top' | 'right' | 'bottom' | 'left')[] = [isTop ? 'top' : 'bottom'];
    if (i === 0)               openSides.push('left');
    if (i === half.length - 1) openSides.push('right');

    groups.push({ label: g.key, x: bx, y: by, w: bw, h: bh, openSides });
    x += bw;
  });
}

// ── Column placement (vertical axis) ──────────────────────────────────────────
// isLeft=true  → box rights sit at x=0 (left column)
// isLeft=false → box lefts sit at x=0 (right column)
function placeCol(
  half: InternalGroup[],
  isLeft: boolean,
  cells: LayoutCell[],
  groups: GroupBounds[],
): void {
  const colH = half.reduce((s, g) => s + g.gh + 2 * BOX_MARGIN, 0);
  let y = -colH / 2;

  half.forEach((g, i) => {
    const bw = g.gw + 2 * BOX_MARGIN;
    const bh = g.gh + 2 * BOX_MARGIN;
    const bx = isLeft ? -bw : 0;
    const by = y;

    emitCells(cells, g, bx + BOX_MARGIN, by + BOX_MARGIN);

    const openSides: ('top' | 'right' | 'bottom' | 'left')[] = [isLeft ? 'left' : 'right'];
    if (i === 0)               openSides.push('top');
    if (i === half.length - 1) openSides.push('bottom');

    groups.push({ label: g.key, x: bx, y: by, w: bw, h: bh, openSides });
    y += bh;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function computeLayout(
  photos: Photo[],
  vw: number,
  vh: number,
): LayoutResult {
  const ppi = pxPerInch(vw, vh);

  // ── Step 1: build canonical groups (sorted largest first) ─────────────────
  const groupMap = new Map<string, Photo[]>();
  for (const p of photos) {
    const k = canonicalKey(p.printW, p.printH);
    if (!groupMap.has(k)) groupMap.set(k, []);
    groupMap.get(k)!.push(p);
  }
  const internalGroups = [...groupMap.entries()]
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([key, gPhotos]) => {
      const g = buildGroupLayout(gPhotos, ppi);
      g.key = key;
      return g;
    });

  // ── Step 2: split into 2 halves along the dominant axis ───────────────────
  // Horizontal canvas → horizontal axis (2 rows), balance by group width.
  // Vertical canvas   → vertical axis (2 columns), balance by group height.
  const horizontal = vw >= vh;
  const [half0, half1] = splitGroups(
    internalGroups,
    horizontal ? g => g.gw : g => g.gh,
  );

  // ── Step 2b: diagonal composition — heaviest group at inner corner ───────────
  // half0: heaviest first (leftmost) — its inner corner is axis + right edge.
  // half1: heaviest last (rightmost) — its inner corner is axis + left edge.
  // Together the two heavy groups sit at diagonally opposite corners.
  half0.sort((a, b) => b.weight - a.weight);
  half1.sort((a, b) => a.weight - b.weight);

  // ── Step 3: anchor photos toward the axis ─────────────────────────────────
  // Horizontal axis:
  //   top row (half0)    → bottom anchor (flipY). Rightmost box also flips X.
  //   bottom row (half1) → top anchor (no flipY). Rightmost box flips X.
  // Vertical axis:
  //   left col (half0)   → right anchor (flipX). Bottommost box also flips Y.
  //   right col (half1)  → left anchor (no flipX). Bottommost box flips Y.
  // Every group except the last in each row/col anchors toward centre.
  // The rightmost (or bottommost) group keeps its natural outer anchor.
  const notLast = (n: number, i: number) => i < n - 1;

  if (horizontal) {
    half0.forEach((g, i) => applyFlip(g, notLast(half0.length, i), true));
    half1.forEach((g, i) => applyFlip(g, notLast(half1.length, i), false));
  } else {
    half0.forEach((g, i) => applyFlip(g, true,  notLast(half0.length, i)));
    half1.forEach((g, i) => applyFlip(g, false, notLast(half1.length, i)));
  }

  // ── Place boxes, emit cells + GroupBounds ──────────────────────────────────
  const cells: LayoutCell[]   = [];
  const groups: GroupBounds[] = [];

  if (horizontal) {
    placeRow(half0, /*isTop=*/true,  cells, groups);
    placeRow(half1, /*isTop=*/false, cells, groups);
  } else {
    placeCol(half0, /*isLeft=*/true,  cells, groups);
    placeCol(half1, /*isLeft=*/false, cells, groups);
  }

  return { cells, groups, initScale: fittingScale(cells, vw, vh) };
}

// ── Circle layout: greedy closest-to-origin packing, biggest first ─────────────

export function computeCircleLayout(
  photos: Photo[],
  vw: number,
  vh: number,
): LayoutResult {
  const ppi   = pxPerInch(vw, vh);
  const GAP_C = 8;

  const sorted = [...photos].sort(
    (a, b) => b.printW * b.printH - a.printW * a.printH,
  );

  interface Rect { x: number; y: number; w: number; h: number }
  const placed: Rect[] = [];
  const cells: LayoutCell[] = [];

  function noOverlap(rx: number, ry: number, rw: number, rh: number): boolean {
    for (const p of placed) {
      if (
        rx < p.x + p.w + GAP_C &&
        rx + rw > p.x - GAP_C &&
        ry < p.y + p.h + GAP_C &&
        ry + rh > p.y - GAP_C
      ) return false;
    }
    return true;
  }

  for (const photo of sorted) {
    const w = Math.round(photo.printW * ppi);
    const h = Math.round(photo.printH * ppi);

    if (placed.length === 0) {
      placed.push({ x: -w / 2, y: -h / 2, w, h });
      cells.push({ photo, baseX: -w / 2, baseY: -h / 2, w, h, col: 0 });
      continue;
    }

    const candidates: [number, number][] = [];
    for (const p of placed) {
      // right
      candidates.push([p.x + p.w + GAP_C, p.y]);
      candidates.push([p.x + p.w + GAP_C, p.y + p.h - h]);
      candidates.push([p.x + p.w + GAP_C, p.y + (p.h - h) / 2]);
      // left
      candidates.push([p.x - w - GAP_C, p.y]);
      candidates.push([p.x - w - GAP_C, p.y + p.h - h]);
      candidates.push([p.x - w - GAP_C, p.y + (p.h - h) / 2]);
      // below
      candidates.push([p.x, p.y + p.h + GAP_C]);
      candidates.push([p.x + p.w - w, p.y + p.h + GAP_C]);
      candidates.push([p.x + (p.w - w) / 2, p.y + p.h + GAP_C]);
      // above
      candidates.push([p.x, p.y - h - GAP_C]);
      candidates.push([p.x + p.w - w, p.y - h - GAP_C]);
      candidates.push([p.x + (p.w - w) / 2, p.y - h - GAP_C]);
    }

    let bestX = 0, bestY = 0, bestDist = Infinity;
    for (const [cx, cy] of candidates) {
      if (!noOverlap(cx, cy, w, h)) continue;
      const dist = Math.hypot(cx + w / 2, cy + h / 2);
      if (dist < bestDist) { bestDist = dist; bestX = cx; bestY = cy; }
    }

    if (bestDist === Infinity) {
      // Fallback: place on golden-angle spiral
      const angle = placed.length * 2.399;
      const r = Math.max(...placed.map(p => Math.hypot(p.x + p.w / 2, p.y + p.h / 2))) + 200;
      bestX = Math.cos(angle) * r - w / 2;
      bestY = Math.sin(angle) * r - h / 2;
    }

    placed.push({ x: bestX, y: bestY, w, h });
    cells.push({ photo, baseX: bestX, baseY: bestY, w, h, col: 0 });
  }

  return { cells, groups: [], initScale: fittingScale(cells, vw, vh) };
}

function fittingScale(cells: LayoutCell[], vw: number, vh: number): number {
  if (!cells.length) return 1;
  const allX = cells.flatMap(c => [c.baseX, c.baseX + c.w]);
  const allY = cells.flatMap(c => [c.baseY, c.baseY + c.h]);
  const totalW = Math.max(...allX) - Math.min(...allX);
  const totalH = Math.max(...allY) - Math.min(...allY);
  if (vw < vh) {
    // Portrait: fit to width so the two columns fill the screen side-to-side.
    return (vw / totalW) * 0.88;
  }
  return Math.min(vw / totalW, vh / totalH) * 0.82;
}
