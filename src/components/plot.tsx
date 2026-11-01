"use client";

import { useRef, useState } from "react";

export type PlotRow = { name: string; price: number };

const W = 1440;
const H = 640;
const TOP = 0.06;
const TICK_FRACTIONS = [0, 0.25, 0.5, 0.75, 1];

/**
 * the file, plotted: one hairline, its area, an axis in the page
 * margin, and a cursor that reads the row under it. the instrument
 * writes in cool; the rail names what is under the pointer.
 */
export function Plot({ rows, file }: { rows: PlotRow[]; file: string }) {
  const [at, setAt] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  if (rows.length === 0) return null;

  const last = rows[rows.length - 1].price;
  const max = Math.ceil(last / 100) * 100;
  const ticks = TICK_FRACTIONS.map((f) => Math.round(max * f));
  const x = (i: number) => ((i / (rows.length - 1)) * W).toFixed(1);
  const y = (v: number) => H - (v / max) * H * (1 - TOP);
  const line = rows.map((r, i) => `${i ? "L" : "M"}${x(i)} ${y(r.price).toFixed(1)}`).join("");
  const area = `${line}L${W} ${H}L0 ${H}Z`;
  const row = at === null ? null : rows[at];

  const read = (e: React.PointerEvent) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setAt(Math.round(t * (rows.length - 1)));
  };

  return (
    <div className="plot">
      <div
        className="plot-canvas"
        ref={box}
        onPointerMove={read}
        onPointerDown={read}
        onPointerLeave={() => setAt(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`The ${rows.length} prices in ${file}, sorted from ${rows[0].price} to ${rows[rows.length - 1].price} usd.`}
        >
          <path d={area} className="plot-area" />
          <path d={line} className="plot-line" pathLength={100} />
        </svg>

        <div className="axis" aria-hidden="true">
          {ticks.map((v) => (
            <span key={v} style={{ top: `${(1 - (v / max) * (1 - TOP)) * 100}%` }}>
              {v}
            </span>
          ))}
        </div>

        {at !== null && row && (
          <>
            <div className="plot-mark" style={{ left: `${(at / (rows.length - 1)) * 100}%` }} />
            <div
              className="plot-dot"
              style={{ left: `${(at / (rows.length - 1)) * 100}%`, top: `${(y(row.price) / H) * 100}%` }}
            />
          </>
        )}
      </div>

      <div className="rail">
        <div>
          <span>{row ? row.name : file}</span>
          <span>{row ? `${row.price} usd` : `${rows.length} rows`}</span>
        </div>
        <div>
          <span>
            {row ? `row ${(at ?? 0) + 1} of ${rows.length}, sorted by price` : `price, sorted, ${rows[0].price} to ${rows[rows.length - 1].price} usd`}
          </span>
        </div>
      </div>
    </div>
  );
}
