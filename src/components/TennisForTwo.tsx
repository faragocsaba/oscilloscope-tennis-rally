import { useEffect, useRef, useState } from "react";
import { serve, step, hit, sideOf, NET_HEIGHT, type State, type Side } from "@/lib/tennis-physics";

const EARTH = 1.6;
const MOON = 0.5;

export function TennisForTwo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>(serve("left"));
  const anglesRef = useRef({ left: 0.6, right: 0.6 });
  const keysRef = useRef<Set<string>>(new Set());
  const gravityRef = useRef(EARTH);
  const [moon, setMoon] = useState(false);
  const [rally, setRally] = useState(0);
  const [angles, setAngles] = useState({ left: 0.6, right: 0.6 });

  useEffect(() => { gravityRef.current = moon ? MOON : EARTH; }, [moon]);

  const doHit = (p: Side) => {
    stateRef.current = hit(stateRef.current, p, anglesRef.current[p]);
  };
  const nudge = (p: Side, d: number) => {
    anglesRef.current[p] = Math.max(-0.2, Math.min(1.45, anglesRef.current[p] + d));
    setAngles({ ...anglesRef.current });
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowdown", "arrowup"].includes(k)) e.preventDefault();
      if (e.repeat) return;
      keysRef.current.add(k);
      if (k === "s") doHit("left");
      if (k === "arrowdown") doHit("right");
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const S = 640;
    canvas.width = S; canvas.height = S;
    const cx = S / 2, groundY = S * 0.68, scale = S * 0.42;
    const toPx = (x: number, y: number) => [cx + x * scale, groundY - y * scale] as const;
    const phosphor = getComputedStyle(document.documentElement).getPropertyValue("--phosphor").trim() || "#7dff9a";
    const decay = getComputedStyle(document.documentElement).getPropertyValue("--phosphor-decay").trim() || "rgba(2,10,4,0.18)";

    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, S, S);
    let last = performance.now(), acc = 0, raf = 0, shownRally = -1;
    const dt = 1 / 240;

    const loop = (now: number) => {
      acc += Math.min(0.05, (now - last) / 1000); last = now;
      const keys = keysRef.current, rate = 1.6 / 60;
      if (keys.has("a")) nudge("left", rate);
      if (keys.has("d")) nudge("left", -rate);
      if (keys.has("arrowright")) nudge("right", rate);
      if (keys.has("arrowleft")) nudge("right", -rate);
      while (acc >= dt) {
        stateRef.current = step(stateRef.current, dt, gravityRef.current);
        acc -= dt;
      }
      const st = stateRef.current;
      if (st.idle > 1.2) {
        const loser = sideOf(st.ball.x) as Side;
        stateRef.current = serve(Math.abs(st.ball.x) > 1.15 ? (st.ball.x > 0 ? "left" : "right") : loser === "left" ? "right" : "left");
      }
      if (st.rally !== shownRally) { shownRally = st.rally; setRally(st.rally); }

      // phosphor persistence
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = decay; ctx.fillRect(0, 0, S, S);
      ctx.globalCompositeOperation = "lighter";
      const flick = 0.85 + Math.random() * 0.15;
      ctx.strokeStyle = phosphor; ctx.fillStyle = phosphor;
      ctx.shadowColor = phosphor; ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.55 * flick; ctx.lineWidth = 2;
      ctx.beginPath();
      const [gx0, gy] = toPx(-1.05, 0), [gx1] = toPx(1.05, 0);
      ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy);
      const [nx, ny] = toPx(0, NET_HEIGHT);
      ctx.moveTo(nx, gy); ctx.lineTo(nx, ny);
      ctx.stroke();
      // ball
      const [bx, by] = toPx(st.ball.x, st.ball.y);
      ctx.globalAlpha = flick; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(bx, by, 3.2, 0, Math.PI * 2); ctx.fill();
      // aim line for player whose side the ball is on
      const p = sideOf(st.ball.x);
      const a = anglesRef.current[p], dir = p === "left" ? 1 : -1;
      ctx.globalAlpha = 0.35 * flick; ctx.lineWidth = 1.5; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a) * 34 * dir, by - Math.sin(a) * 34);
      ctx.stroke();
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const Panel = ({ side, label, keys }: { side: Side; label: string; keys: string }) => (
    <div className="control-box">
      <div className="text-xs tracking-[0.3em] text-panel-label">{label}</div>
      <div className="knob" style={{ transform: `rotate(${(side === "left" ? -1 : 1) * (angles[side] * 57 - 45)}deg)` }}>
        <span className="knob-mark" />
      </div>
      <div className="flex gap-2">
        <button className="panel-btn" onPointerDown={() => nudge(side, side === "left" ? 0.12 : -0.12)}>{side === "left" ? "▲" : "▼"}</button>
        <button className="panel-btn" onPointerDown={() => nudge(side, side === "left" ? -0.12 : 0.12)}>{side === "left" ? "▼" : "▲"}</button>
        <button className="panel-btn panel-btn-hit" onPointerDown={() => doHit(side)}>HIT</button>
      </div>
      <div className="text-[10px] text-panel-label/70">{keys}</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="scope-bezel">
        <div className="scope-screen">
          <canvas ref={canvasRef} className="h-full w-full" aria-label="Oscilloscope tennis court" />
          <div className="scope-graticule" />
          <div className="scope-glass" />
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-6">
        <Panel side="left" label="PLAYER 1" keys="A / D aim · S hit" />
        <div className="flex flex-col items-center gap-3 pt-4 text-panel-label">
          <div className="text-xs tracking-[0.3em]">RALLY</div>
          <div className="font-mono text-3xl text-phosphor">{String(rally).padStart(2, "0")}</div>
          <button className="panel-btn" onClick={() => setMoon((m) => !m)}>
            G: {moon ? "MOON" : "EARTH"}
          </button>
        </div>
        <Panel side="right" label="PLAYER 2" keys="← / → aim · ↓ hit" />
      </div>
    </div>
  );
}
