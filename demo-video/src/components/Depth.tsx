import {QRCodeSVG} from "qrcode.react";
import type {CSSProperties, ReactNode} from "react";

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
};

// A card with real thickness: stacked copies of its outline recede in Z behind the face.
// The parent must use transformStyle "preserve-3d" inside an element with perspective.
export const Slab: React.FC<{
  width: number;
  height: number;
  depth?: number;
  radius?: number;
  edge: string;
  edgeDark?: string;
  style?: CSSProperties;
  faceStyle?: CSSProperties;
  children?: ReactNode;
}> = ({width, height, depth = 20, radius = 28, edge, edgeDark, style, faceStyle, children}) => {
  const layers = Math.max(2, Math.round(depth / 2));
  return (
    <div style={{position: "absolute", width, height, transformStyle: "preserve-3d", ...style}}>
      {Array.from({length: layers}, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: mix(edge, edgeDark ?? edge, i / (layers - 1)),
            transform: `translateZ(${-((i + 1) * depth) / layers}px)`,
          }}
        />
      ))}
      <div style={{position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden", ...faceStyle}}>{children}</div>
    </div>
  );
};

export const FloorGlow: React.FC<{x: number; y: number; w: number; h: number; color: string; opacity?: number}> = ({x, y, w, h, color, opacity = 1}) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: "50%",
      background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
      opacity,
    }}
  />
);

// Small codes need a low error-correction level: fewer, larger modules survive video compression.
export const QrTile: React.FC<{url: string; size: number; pad?: number; radius?: number; fg?: string; level?: "L" | "M" | "Q" | "H"}> = ({url, size, pad = 12, radius = 16, fg = "#121212", level = "H"}) => (
  <div style={{display: "inline-flex", padding: pad, borderRadius: radius, background: "#FFFFFF", boxShadow: "0 10px 26px rgba(10, 4, 16, 0.35), inset 0 0 0 1px rgba(0,0,0,0.04)"}}>
    <QRCodeSVG value={url} size={size} level={level} marginSize={0} fgColor={fg} bgColor="#FFFFFF" />
  </div>
);
