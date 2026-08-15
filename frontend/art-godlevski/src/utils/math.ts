export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const dist2 = (ax: number, ay: number, bx: number, by: number) =>
  (bx - ax) ** 2 + (by - ay) ** 2;

/** Single step of a spring-damper system. Returns [newPos, newVel]. */
export function springStep(
  pos: number,
  vel: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): [number, number] {
  const force = (target - pos) * stiffness - vel * damping;
  const newVel = vel + force * dt;
  const newPos = pos + newVel * dt;
  return [newPos, newVel];
}

/** Easing for the preview open/close transition. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}
