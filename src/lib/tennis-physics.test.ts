import { describe, it, expect } from "vitest";
import { serve, step, hit, canHit } from "./tennis-physics";

describe("tennis physics", () => {
  it("bounce reduces vertical speed", () => {
    let s = serve("left");
    s = { ...s, ball: { x: -0.5, y: 0.001, vx: 0, vy: -1 } };
    s = step(s, 0.01, 1);
    expect(s.ball.vy).toBeGreaterThan(0);
    expect(s.ball.vy).toBeLessThan(1);
  });
  it("net blocks a low ball", () => {
    let s = serve("left");
    s = { ...s, ball: { x: -0.01, y: 0.05, vx: 2, vy: 0 } };
    s = step(s, 0.01, 0);
    expect(s.ball.x).toBeLessThan(0);
  });
  it("only the player on the ball's side can hit", () => {
    const s = serve("left");
    expect(canHit(s, "right")).toBe(false);
    expect(hit(s, "right", 0.5)).toBe(s);
    expect(hit(s, "left", 0.5).ball.vx).toBeGreaterThan(0);
  });
});
