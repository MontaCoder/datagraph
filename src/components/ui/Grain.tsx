import React from "react";

/**
 * Grain — a subtle film-grain SVG overlay that adds analog warmth
 * to the dark editorial surfaces. Pure decoration, pointer-events:none.
 */
export function Grain({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <div
      className="grain"
      aria-hidden
      style={{ ["--grain-strength" as string]: opacity }}
    />
  );
}
