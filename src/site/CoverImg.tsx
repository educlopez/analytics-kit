"use client";

import { useState } from "react";

function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=72`;
}

export function CoverImg({
  id,
  alt,
  className = "cover-photo",
  sizes = "100vw",
  eager = false,
  position,
}: {
  id: string;
  alt: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  position?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`${className} cover-fallback`} role="img" aria-label={alt} />;
  }

  return (
    <img
      className={className}
      src={unsplash(id, 1600)}
      srcSet={`${unsplash(id, 800)} 800w, ${unsplash(id, 1600)} 1600w, ${unsplash(id, 2400)} 2400w`}
      sizes={sizes}
      alt={alt}
      width={1600}
      height={1000}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      referrerPolicy="no-referrer"
      style={position ? { objectPosition: position } : undefined}
      onError={() => setFailed(true)}
    />
  );
}
