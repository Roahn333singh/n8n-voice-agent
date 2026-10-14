export const Reveal: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => {
  const progress = Math.max(0, Math.min(1, p));
  return <span style={{display: "inline-block", verticalAlign: "top", opacity: progress, transform: `translateY(${(1 - progress) * 14}px)`}}>{children}</span>;
};
