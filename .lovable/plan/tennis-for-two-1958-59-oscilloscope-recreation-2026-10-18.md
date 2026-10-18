# Tennis for Two (1958/59) — Oscilloscope Recreation

A single-page browser game recreating William Higinbotham's "Tennis for Two" as seen on a round oscilloscope screen.

## What you'll see
- A dark page with a round, bezel-framed oscilloscope screen (green phosphor, faint graticule grid, slight curvature/vignette).
- Side view of a tennis court: a horizontal ground line and a short vertical net in the middle.
- A glowing dot ball that leaves a fading phosphor trail, follows a gravity arc, bounces on the ground, and hits the net.
- Each player's hitter is shown as a short line at the ball's position showing the aim angle (as in the original).
- Optional "knob" style controls drawn under the screen, like the original aluminum controller boxes.

## Gameplay (faithful to original)
- Two players, one on each side. Ball can only be hit by the player whose side it's on.
- Each player: rotate aim angle and press "hit". Keyboard: Left player A/D aim + S hit; Right player Left/Right arrows aim + Down hit. Touch buttons for mobile.
- Gravity, bounce with energy loss, net collision. Ball resets ("serve") from the side of the last hitter after it stops or leaves the screen. Toggle for low gravity ("Moon") mode as a nod to the original's adjustable gravity.
- No score display (original had none); a small optional rally counter outside the screen.

## Visual technique
- HTML canvas, additive green glow (shadowBlur), trails created by drawing a translucent black rectangle each frame for phosphor persistence, subtle flicker and scanline noise.
- Monospace retro font for labels outside the screen; amber/aluminum control panel styling.

## Technical details
- Rewrite `src/routes/index.tsx` with the game and proper head() metadata; game loop in `src/components/TennisForTwo.tsx` using requestAnimationFrame + fixed timestep physics in a pure `src/lib/tennis-physics.ts`.
- Small vitest for physics rules (bounce reduces speed, net blocks ball, hit only allowed on own side).
- Design tokens in `src/styles.css` (phosphor green, bezel colors). No backend.
