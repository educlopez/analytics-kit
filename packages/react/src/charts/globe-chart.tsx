"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import createGlobe, { type Arc, type Marker } from "cobe";
import { formatNumber } from "./chart.js";
import { cn } from "../lib/cn.js";
import { countryCoords } from "./country-coords.js";
import { GLOBE_CHART_VARIANTS, type GlobeChartVariant } from "./variants.js";

export interface GlobeLocation {
  /**
   * ISO 3166-1 alpha-2 country code. Resolved to that country's centroid when
   * `lat`/`lon` are absent — which is the normal case, because every provider
   * reports its country breakdown by this code and none of them return
   * coordinates.
   */
  code?: string;
  label?: string;
  value: number;
  lat?: number;
  lon?: number;
}

interface Placed {
  key: string;
  label: string;
  value: number;
  lat: number;
  lon: number;
}

const DEG = Math.PI / 180;
const MIN_MARKER = 0.018;
const MAX_MARKER = 0.05;
/** Past this the framing is looking at a pole, where the map is all distortion. */
const MAX_TILT = 0.6;
/**
 * How long a non-moving globe keeps redrawing so cobe's asynchronously loaded
 * map texture has a frame to land in. Generous against a data-URI PNG decode,
 * and it costs one short burst per mount.
 */
const WARMUP_MS = 2000;
/**
 * Rendered sphere radius as a share of the canvas edge.
 *
 * cobe does not report it. Fitted against the marker centroids read back out
 * of the canvas: one scale lands three independent markers — a centred one, one
 * near the limb and one between — inside a pixel each, so the projection is
 * orthographic and needs no perspective term.
 */
const SPHERE_RADIUS = 0.4237;

/**
 * The angle a marker at `[lat, lon]` sits at once the globe has spun by phi.
 *
 * cobe places a marker at `[-cos(lat)cos(a), sin(lat), cos(lat)sin(a)]` with
 * `a = lon·π/180 − π`, and its shader spins that so the composed angle is
 * `a + phi` — measured, not assumed: with `a − phi` the hit targets sat 57px
 * left of the drawn markers on a 720px canvas while agreeing on y, which is
 * exactly what a wrong sign on the spin looks like.
 */
export function azimuth(lon: number, phi: number): number {
  return lon * DEG - Math.PI + phi;
}

/**
 * Where phi/theta have to sit for `[lat, lon]` to face the camera.
 *
 * Centred means `cos(a + phi) = 0`, so `phi = -(lon·π/180 + π/2)`. The tilt is
 * the latitude, which puts the marker at `sin(lat - theta) = 0` vertically.
 */
export function globeOrientation(lat: number, lon: number): { phi: number; theta: number } {
  return {
    phi: -(lon * DEG + Math.PI / 2),
    theta: Math.max(-MAX_TILT, Math.min(MAX_TILT, lat * DEG)),
  };
}

/**
 * Where `[lat, lon]` lands on the canvas, in CSS pixels from the top-left.
 *
 * Same model as `orientation`, run forwards. `front` is the camera-facing
 * component, so a marker on the far side of the sphere reports false and its
 * hit target goes away with it.
 *
 * cobe exposes no hit testing, so this is the only way to put anything
 * clickable on a marker.
 */
export function globeProject(
  lat: number,
  lon: number,
  phi: number,
  theta: number,
  edge: number,
): { x: number; y: number; front: boolean } {
  const ang = azimuth(lon, phi);
  const cosLat = Math.cos(lat * DEG);
  const x = -cosLat * Math.cos(ang);
  const z = cosLat * Math.sin(ang);
  const y = Math.sin(lat * DEG);
  // Tilt. The signs are the ones `orientation` is built on: a marker at
  // theta = lat comes out at y'' = sin(lat − theta) = 0, i.e. vertically
  // centred, which is what the focus framing was verified against.
  const yTilted = y * Math.cos(theta) - z * Math.sin(theta);
  const zTilted = y * Math.sin(theta) + z * Math.cos(theta);
  const radius = edge * SPHERE_RADIUS;
  return {
    x: edge / 2 + x * radius,
    // SVG/CSS y grows downward, the model's y grows up.
    y: edge / 2 - yTilted * radius,
    front: zTilted > 0,
  };
}

/**
 * WebGL support, probed on a throwaway canvas.
 *
 * It has to be a throwaway: a canvas can only ever hand out one context type,
 * so probing the real canvas for "webgl" would make cobe's own
 * `getContext("webgl2")` return null on it.
 */
function webglAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Theme for the globe, when the caller did not state one.
 *
 * The provider stamps `data-ak-theme` on its root, so an in-dashboard globe
 * follows the dashboard. Standalone there is no such ancestor, and the OS
 * preference is the only signal left.
 */
function resolveDark(host: HTMLElement): boolean {
  const themed = host.closest("[data-ak-theme]") as HTMLElement | null;
  if (themed?.dataset.akTheme) return themed.dataset.akTheme === "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

/**
 * Resolves any CSS colour expression — a token, a `var()` chain, a hex — to the
 * 0..1 RGB triple cobe wants.
 *
 * Reading the custom property directly returns whatever string the author
 * wrote, which may itself be another `var()`. Letting the browser compute
 * `color` on a probe node is the only way to get a resolved value.
 */
function resolveRgb(
  host: HTMLElement,
  value: string,
  fallback: [number, number, number],
): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  host.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const match = /rgba?\(([^)]+)\)/.exec(computed);
  if (!match) return fallback;
  const parts = match[1].split(/[\s,/]+/).map(Number);
  if (parts.length < 3 || parts.slice(0, 3).some((n) => !Number.isFinite(n))) return fallback;
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

/**
 * Locations on a globe.
 *
 * The tile map (`ChoroplethChart`) answers "which countries", but it cannot
 * show *where* — adjacency, hemispheres, and the fact that half an audience
 * sits on one landmass are all invisible in a grid of squares.
 *
 * Only the globe. The breakdown lists that sit beside one in a real dashboard
 * are the host's own panel — `BreakdownCard` and `RankedList` already draw
 * them — so bundling a legend in here would ship a second component nobody
 * asked this one for.
 *
 * WebGL is a hard requirement for the drawing, so the component checks for it
 * and names the shortfall rather than leaving an empty canvas.
 */
export function GlobeChart({
  locations,
  variant = "spin",
  dark,
  markerColor,
  size,
  speed = 1,
  hub,
  interactive = true,
  onSelect,
  valueLabel,
  focusDwellMs = 3200,
  ariaLabel,
  emptyLabel = "No location data.",
  className,
}: {
  locations: GlobeLocation[];
  /**
   * `spin` rotates continuously. `drag` hands rotation to the pointer (and to
   * the arrow keys). `focus` swings to each of the busiest locations in turn.
   * `arcs` draws every location's route into `hub`. `still` holds one framing,
   * which is also what the motion variants degrade to under
   * `prefers-reduced-motion`.
   */
  variant?: GlobeChartVariant;
  /** Defaults to the nearest `[data-ak-theme]`, then the OS preference. */
  dark?: boolean;
  /** Any CSS colour. Defaults to the chart-1 token. */
  markerColor?: string;
  /** Square edge in CSS pixels. Defaults to filling the container. */
  size?: number;
  /** Multiplier on the rotation rate. */
  speed?: number;
  /** Arc destination as `[lat, lon]`. Defaults to the busiest location. */
  hub?: [number, number];
  /**
   * Puts a hit target on every marker: hover names it, click pins its numbers.
   * cobe draws the markers themselves — these sit on top of them, so the
   * drawing stays right even where the hit target is a pixel out.
   */
  interactive?: boolean;
  onSelect?: (location: GlobeLocation) => void;
  /** Unit shown next to the number in the callout, e.g. "visitors". */
  valueLabel?: string;
  /** How long `focus` holds on each location before moving on. */
  focusDwellMs?: number;
  ariaLabel?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [edge, setEdge] = useState(size ?? 0);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  // Pointer/keyboard rotation lives in refs: the render loop reads it every
  // frame, and putting it in state would re-render the component 60 times a
  // second to draw the same DOM.
  const dragRef = useRef({ phi: 0, theta: 0, from: 0, dragging: false, velocity: 0 });
  // Which location `focus` is heading for. A ref, not state: as state it landed
  // in the globe effect's dependencies, so every advance tore the globe down
  // and rebuilt it — which resets canvas.width and leaves the canvas blank
  // until the map texture reloads. Measured as a full blank frame every 3.2s.
  const focusRef = useRef(0);
  // Written from the render loop so the hit targets track the sphere without
  // re-rendering the tree sixty times a second.
  const pinsRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const placed = useMemo<Placed[]>(() => {
    const out: Placed[] = [];
    for (const location of locations) {
      const explicit =
        location.lat != null && location.lon != null
          ? ([location.lat, location.lon] as const)
          : undefined;
      const point = explicit ?? (location.code ? countryCoords(location.code) : undefined);
      // A row whose country we cannot place is dropped from the drawing and
      // counted in the note under it, so nothing goes missing silently.
      if (!point) continue;
      out.push({
        key: location.code ?? location.label ?? `${point[0]},${point[1]}`,
        label: location.label ?? location.code ?? "",
        value: Number(location.value) || 0,
        lat: point[0],
        lon: point[1],
      });
    }
    return out.sort((a, b) => b.value - a.value);
  }, [locations]);

  const unplaced = locations.length - placed.length;

  useEffect(() => setWebgl(webglAvailable()), []);

  // Container-driven sizing. A window resize listener would miss the case this
  // catalog actually hits: the column changing width while the window does not.
  useEffect(() => {
    if (size) {
      setEdge(size);
      return;
    }
    const node = wrapRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setEdge(Math.max(0, Math.min(box.width, 720)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [size]);

  // `focus` advances on a timer rather than inside the render loop, so the
  // dwell is a real duration and not a frame count.
  useEffect(() => {
    if (variant !== "focus" || placed.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const top = Math.min(placed.length, 5);
    const id = setInterval(() => {
      focusRef.current = (focusRef.current + 1) % top;
    }, focusDwellMs);
    return () => clearInterval(id);
  }, [variant, placed.length, focusDwellMs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !edge || webgl !== true || !placed.length) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const isDark = dark ?? resolveDark(wrap);

    const accent = resolveRgb(
      wrap,
      markerColor ?? "var(--ak-chart-1, var(--chart-1, #3b82f6))",
      [0.23, 0.36, 1],
    );
    const max = Math.max(...placed.map((row) => row.value), 1);
    const markers: Marker[] = placed.map((row) => ({
      location: [row.lat, row.lon],
      // Area, not radius, carries the value: a marker whose radius is
      // proportional to the number overstates the big ones by its square.
      size: MIN_MARKER + Math.sqrt(row.value / max) * (MAX_MARKER - MIN_MARKER),
    }));

    const target = hub ?? ([placed[0].lat, placed[0].lon] as [number, number]);
    const arcs: Arc[] =
      variant === "arcs"
        ? placed.slice(1).map((row) => ({ from: [row.lat, row.lon], to: target }) as Arc)
        : [];

    // A rebuild starts over at the busiest location rather than resuming
    // mid-tour, so the framing on screen always matches what the loop is
    // easing away from.
    focusRef.current = 0;
    const start = globeOrientation(placed[0].lat, placed[0].lon);
    // Even the rotating variants start facing the busiest location. Starting at
    // phi 0 opens on the Pacific, so the first thing a reader sees is the one
    // hemisphere with none of their audience in it.
    const held = variant === "spin" || variant === "arcs" ? { phi: start.phi, theta: 0.28 } : start;

    let phi = held.phi;
    let theta = held.theta;
    dragRef.current.phi = phi;
    dragRef.current.theta = theta;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = `${edge}px`;
    canvas.style.height = `${edge}px`;

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: edge,
      height: edge,
      phi,
      theta,
      dark: isDark ? 1 : 0,
      diffuse: isDark ? 1.2 : 1.1,
      mapSamples: 16000,
      mapBrightness: isDark ? 4.4 : 2.4,
      mapBaseBrightness: isDark ? 0.05 : 0.16,
      baseColor: isDark ? [0.24, 0.26, 0.3] : [0.82, 0.84, 0.88],
      markerColor: accent,
      glowColor: isDark ? [0.16, 0.18, 0.22] : [0.95, 0.96, 0.98],
      markers,
      arcs,
      arcColor: accent,
      arcWidth: 0.35,
      arcHeight: 0.4,
    });

    // A still framing does not get to skip the loop entirely. cobe binds a 1x1
    // placeholder texture and swaps in the real world map inside an
    // `Image.onload` that it never re-renders for, so the one draw createGlobe
    // does always lands before the map exists — measured: markers on an empty
    // canvas, no sphere. So the non-moving variants keep drawing for a bounded
    // warm-up and then settle, which is also what reduced motion asks for.
    const animates = variant === "drag" || (!reduced && variant !== "still");
    const startedAt = performance.now();

    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const tick = (now: number) => {
      // A WebGL loop running behind a scrolled-away page is pure waste, and on
      // a laptop it is audible. The warm-up is exempt: two seconds of draws
      // offscreen is cheaper than a globe that never appears because it
      // finished warming up while out of view.
      if (animates && !visible) {
        frame = requestAnimationFrame(tick);
        return;
      }

      if (variant === "drag") {
        const state = dragRef.current;
        if (!state.dragging) {
          state.phi += state.velocity;
          state.velocity *= 0.94;
        }
        phi = state.phi;
        theta = state.theta;
      } else if (variant === "focus") {
        // Ease toward the target instead of snapping, and take the shorter way
        // round so a jump from +170° to −170° travels 20° rather than 340°.
        const target = placed[Math.min(focusRef.current, placed.length - 1)];
        const wanted = globeOrientation(target.lat, target.lon);
        let delta = (wanted.phi - phi) % (Math.PI * 2);
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        phi += delta * 0.055;
        theta += (wanted.theta - theta) * 0.055;
      } else if (animates) {
        phi += 0.0045 * speed;
      }

      globe.update({ phi, theta, width: edge, height: edge });

      const pins = pinsRef.current;
      if (pins) {
        for (let index = 0; index < pins.children.length; index += 1) {
          const pin = pins.children[index] as HTMLElement;
          const row = placed[index];
          if (!row) continue;
          const at = globeProject(row.lat, row.lon, phi, theta, edge);
          pin.style.transform = `translate3d(${at.x}px, ${at.y}px, 0) translate(-50%, -50%)`;
          // `visibility` rather than opacity: it also takes the button out of
          // the tab order, so Tab does not stop on markers behind the globe.
          pin.style.visibility = at.front ? "visible" : "hidden";
        }
      }

      if (animates || now - startedAt < WARMUP_MS) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      globe.destroy();
    };
  }, [edge, webgl, variant, dark, markerColor, speed, hub, placed]);

  const label =
    ariaLabel ??
    (placed.length
      ? `Globe of ${placed.length} locations. Busiest: ${placed
          .slice(0, 3)
          .map((row) => `${row.label} ${formatNumber(row.value)}`)
          .join(", ")}.`
      : emptyLabel);

  if (!locations.length) return <p className="ak-muted">{emptyLabel}</p>;

  // No WebGL means no drawing at all. A plain roll of the numbers stands in so
  // the data is not simply lost — a degradation, not a second layout.
  if (webgl === false || !placed.length) {
    const top = [...locations].sort((a, b) => b.value - a.value).slice(0, 5);
    return (
      <div className={cn("ak-globe ak-globe-fallback", className)}>
        <p className="ak-muted">
          {placed.length
            ? "This browser has no WebGL, so the globe cannot draw."
            : "No location could be placed on the globe."}
        </p>
        <ul className="ak-globe-plain">
          {top.map((row) => (
            <li key={row.code ?? row.label}>
              <span>{row.label ?? row.code}</span>
              <b>{formatNumber(row.value)}</b>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={cn("ak-globe", className)}>
      <div
        ref={wrapRef}
        className={cn("ak-globe-stage", variant === "drag" ? "ak-globe-draggable" : undefined)}
        // Rotation by keyboard, so the drag variant is not pointer-only.
        tabIndex={variant === "drag" ? 0 : undefined}
        role={variant === "drag" ? "application" : undefined}
        aria-label={variant === "drag" ? `${label} Use the arrow keys to rotate.` : undefined}
        onKeyDown={
          variant === "drag"
            ? (event) => {
                const step = 0.12;
                if (event.key === "ArrowLeft") dragRef.current.phi -= step;
                else if (event.key === "ArrowRight") dragRef.current.phi += step;
                else if (event.key === "ArrowUp")
                  dragRef.current.theta = Math.min(1.1, dragRef.current.theta + step);
                else if (event.key === "ArrowDown")
                  dragRef.current.theta = Math.max(-1.1, dragRef.current.theta - step);
                else return;
                event.preventDefault();
              }
            : undefined
        }
        onKeyDownCapture={(event) => {
          if (event.key === "Escape" && selected) setSelected(null);
        }}
        onPointerDown={
          variant === "drag"
            ? (event) => {
                dragRef.current.dragging = true;
                dragRef.current.from = event.clientX;
                dragRef.current.velocity = 0;
                setSelected(null);
                event.currentTarget.setPointerCapture(event.pointerId);
              }
            : undefined
        }
        onPointerMove={
          variant === "drag"
            ? (event) => {
                const state = dragRef.current;
                if (!state.dragging) return;
                const delta = (event.clientX - state.from) / 180;
                state.from = event.clientX;
                state.phi += delta;
                // Carried into the release so the globe coasts to a stop.
                state.velocity = delta;
              }
            : undefined
        }
        onPointerUp={variant === "drag" ? () => (dragRef.current.dragging = false) : undefined}
        onPointerCancel={variant === "drag" ? () => (dragRef.current.dragging = false) : undefined}
      >
        {/* The box is sized exactly like the canvas so the hit targets can be
            placed in its coordinates. Centring happens on the stage, not here,
            or the two layers would drift apart. */}
        <div className="ak-globe-box" style={{ width: edge, height: edge }}>
          <canvas ref={canvasRef} className="ak-globe-canvas" role="img" aria-label={label} />
          {interactive ? (
            <div className="ak-globe-pins" ref={pinsRef}>
              {placed.map((row) => {
                const open = selected === row.key;
                return (
                  <div key={row.key} className="ak-globe-pin" style={{ visibility: "hidden" }}>
                    <button
                      type="button"
                      className={cn("ak-globe-hit", open ? "is-open" : undefined)}
                      aria-expanded={open}
                      // The stage starts a rotation on pointerdown and clears
                      // the pinned callout; a press on a marker is neither.
                      onPointerDown={(event) => event.stopPropagation()}
                      aria-label={`${row.label || row.key}: ${formatNumber(row.value)}${
                        valueLabel ? ` ${valueLabel}` : ""
                      }`}
                      onClick={(event) => {
                        // The drag variant treats a pointer press on the stage
                        // as the start of a rotation; a click on a marker is
                        // not that.
                        event.stopPropagation();
                        const next = open ? null : row.key;
                        setSelected(next);
                        if (next)
                          onSelect?.(locations.find((l) => (l.code ?? l.label) === row.key) ?? row);
                      }}
                    />
                    <span className="ak-globe-callout" aria-hidden="true">
                      <b>{row.label || row.key}</b>
                      <span>
                        {formatNumber(row.value)}
                        {valueLabel ? ` ${valueLabel}` : ""}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      {unplaced > 0 ? (
        <p className="ak-muted ak-globe-note">
          {unplaced} {unplaced === 1 ? "location" : "locations"} had no coordinate and are not
          drawn.
        </p>
      ) : null}
    </div>
  );
}

export { GLOBE_CHART_VARIANTS };
export type { GlobeChartVariant };
