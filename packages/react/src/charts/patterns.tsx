export function DitherDots({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6">
      <circle cx="1.4" cy="1.4" r="1" fill={color} />
      <circle cx="4.6" cy="4.6" r="0.85" fill={color} />
    </pattern>
  );
}

export function GlowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.2" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
        result="glow"
      />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}
