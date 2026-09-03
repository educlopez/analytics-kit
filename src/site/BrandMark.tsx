/**
 * The Analytics Kit logomark: three slabs stepping down in perspective, with a
 * fading opacity ramp — a trend receding into the past.
 *
 * Based on the "Foresight" mark from Untitled UI's free placeholder company
 * logos (untitledui.com/resources/logos), recoloured to `currentColor` so it
 * follows the surrounding text and both themes instead of carrying a fixed
 * brand hue.
 */

const SLABS = [
  { d: "m0 17.8433 30.9054-17.8433-.8189 12.6994-26.32053 15.1961z", opacity: 1 },
  { d: "m3.76562 27.8951 21.73568-12.5492-.8189 12.6994-17.15081 9.902z", opacity: 0.5 },
  { d: "m7.5293 37.9477 12.566-7.255-.8189 12.6994-7.9811 4.6079z", opacity: 0.25 },
];

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 31 48"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {SLABS.map((slab) => (
        <path key={slab.d} d={slab.d} opacity={slab.opacity} />
      ))}
    </svg>
  );
}
