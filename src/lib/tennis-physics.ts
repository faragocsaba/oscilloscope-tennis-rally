// Pure physics for Tennis for Two. Court coords: x in [-1,1], y ground=0, up positive.
export type Side = "left" | "right";
export interface Ball { x: number; y: number; vx: number; vy: number; }
export interface State { ball: Ball; lastHitter: Side | null; rally: number; idle: number; }

export const NET_HEIGHT = 0.12;
export const NET_HALF_WIDTH = 0.008;
export const BOUNCE = 0.75;
export const HIT_SPEED = 1.35;

export const sideOf = (x: number): Side => (x < 0 ? "left" : "right");

export function serve(from: Side): State {
  const s = from === "left" ? -1 : 1;
  return { ball: { x: 0.85 * s, y: 0.35, vx: 0, vy: 0 }, lastHitter: null, rally: 0, idle: 0 };
}

export function canHit(state: State, player: Side): boolean {
  return sideOf(state.ball.x) === player && state.lastHitter !== player;
}

/** angle in radians measured from horizontal, pointing toward opponent. */
export function hit(state: State, player: Side, angle: number): State {
  if (!canHit(state, player)) return state;
  const dir = player === "left" ? 1 : -1;
  return {
    ...state,
    ball: { ...state.ball, vx: Math.cos(angle) * HIT_SPEED * dir, vy: Math.sin(angle) * HIT_SPEED },
    lastHitter: player,
    rally: state.rally + 1,
  };
}

export function step(state: State, dt: number, gravity: number): State {
  const b = { ...state.ball };
  const prevX = b.x;
  b.vy -= gravity * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  let lastHitter = state.lastHitter;
  // ground
  if (b.y < 0) {
    b.y = -b.y * BOUNCE;
    b.vy = -b.vy * BOUNCE;
    b.vx *= 0.92;
    if (Math.abs(b.vy) < 0.05) { b.vy = 0; b.y = 0; }
    // a bounce lets the player on this side hit (original allowed volleys too)
  }
  // net
  const crossed = (prevX < 0 && b.x >= 0) || (prevX > 0 && b.x <= 0);
  if (crossed && b.y < NET_HEIGHT) {
    b.x = prevX < 0 ? -NET_HALF_WIDTH : NET_HALF_WIDTH;
    b.vx = -b.vx * 0.3;
  }
  // once ball enters the other side, its owner may hit
  if (lastHitter && sideOf(b.x) !== lastHitter) { /* opponent can hit */ }
  if (lastHitter && sideOf(b.x) === lastHitter && crossed) lastHitter = null;
  const still = b.y === 0 && Math.abs(b.vx) < 0.02;
  const out = Math.abs(b.x) > 1.15;
  return { ball: b, lastHitter, rally: state.rally, idle: still || out ? state.idle + dt : 0 };
}
