export const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const bounded = (p: number) => Math.max(0, Math.min(1, p));

// Keep the existing call signature, but use a bounded, monotonic ease rather than a spring.
// Both ends have zero velocity and acceleration, so entrances settle without bouncing.
export const pop = (frame: number, fps: number, delay: number, _damping = 20) => {
  const u = bounded((frame - delay) / Math.max(1, Math.round(fps * 0.8)));
  return u * u * u * (u * (u * 6 - 15) + 10);
};

export const fadeUp = (p: number, distance = 16): React.CSSProperties => ({
  opacity: bounded(p),
  transform: `translateY(${(1 - bounded(p)) * Math.min(distance, 18)}px)`,
});

// Fading a stationary card avoids shimmer on text, borders and SVG strokes during rescaling.
export const popIn = (p: number): React.CSSProperties => ({opacity: bounded(p)});

export const bump = (frame: number, start: number, end: number) => {
  const u = (frame - start) / (end - start);
  return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u);
};

export const SHADOW = "0 28px 65px rgba(59, 35, 70, 0.08), 0 6px 18px rgba(59, 35, 70, 0.04), inset 0 1px 0 rgba(255,255,255,0.8)";
