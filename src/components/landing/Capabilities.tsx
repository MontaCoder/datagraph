"use client";

import React from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Capabilities — three instrument readouts that demonstrate a capability
 * rather than claim it. Mini-illustrations are pure SVG so they stay crisp
 * and load instantly; cards reveal in a stagger.
 */
export function Capabilities() {
  return (
    <section
      id="faculties"
      className="relative py-24 md:py-36 border-t border-rule overflow-hidden"
    >
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-60" />

      <div className="relative max-w-[1480px] mx-auto px-5 md:px-10">
        <div className="grid md:grid-cols-12 gap-8 mb-12 md:mb-20 items-end">
          <Reveal className="md:col-span-7">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember">
              [ 04 ] — faculties
            </span>
            <h2 className="mt-4 font-display font-black text-bone text-[40px] md:text-[68px] leading-[0.95] tracking-[-0.035em]">
              What it does,
              <br />
              <span className="text-paper">precisely.</span>
            </h2>
          </Reveal>
          <Reveal className="md:col-span-5" delay={120}>
            <p className="text-paper text-[15px] leading-[1.6] max-w-md">
              Three reliable behaviors. No screens of feature checkboxes — just
              the work the instrument does well, every time.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-rule bg-rule rounded-sm overflow-hidden">
          <Faculty
            num="01"
            kicker="Numerical"
            title="Aggregations & queries"
            body="Sums, means, medians, group-bys, joins, pivots. The model writes pandas; you read prose."
            illustration={<TableIllustration />}
            delay={0}
          />
          <Faculty
            num="02"
            kicker="Visual"
            title="Charts that ship"
            body="Bar, line, scatter, histogram, heatmap. Clean axes, sensible scales, captions in the answer body."
            illustration={<ChartIllustration />}
            delay={130}
          />
          <Faculty
            num="03"
            kicker="Inferential"
            title="Patterns & anomalies"
            body="Outliers, correlations, cohorts, simple forecasts — always with the math shown beneath the conclusion."
            illustration={<NetworkIllustration />}
            delay={260}
          />
        </div>
      </div>
    </section>
  );
}

function Faculty({
  num,
  kicker,
  title,
  body,
  illustration,
  delay,
}: {
  num: string;
  kicker: string;
  title: string;
  body: string;
  illustration: React.ReactNode;
  delay: number;
}) {
  return (
    <Reveal
      as="article"
      delay={delay}
      className="bg-ink p-6 md:p-8 group relative overflow-hidden hover:bg-surface/70 transition-colors duration-500"
    >
      {/* the figurative illustration */}
      <div className="aspect-[5/3] -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 border-b border-rule overflow-hidden bg-surface/40 relative">
        <div className="absolute inset-0 bg-grid-fine opacity-50" />
        <div className="absolute inset-0 grid place-items-center transition-transform duration-700 group-hover:scale-[1.04]">
          {illustration}
        </div>
        <div className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.16em] uppercase text-smoke">
          fig.{num}
        </div>
        <div className="absolute top-3 right-4 font-mono text-[10px] tracking-[0.16em] uppercase text-ember">
          {kicker}
        </div>
      </div>

      <h3 className="font-display font-extrabold text-bone text-[26px] leading-[1.0] tracking-[-0.025em] mb-3">
        {title}
      </h3>
      <p className="text-paper text-[14.5px] leading-[1.65]">{body}</p>

      <span
        className="absolute left-0 bottom-0 h-[2px] w-0 bg-ember transition-all duration-500 group-hover:w-full"
        aria-hidden
      />
    </Reveal>
  );
}

function TableIllustration() {
  return (
    <svg
      width="220"
      height="120"
      viewBox="0 0 220 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-90"
    >
      <rect x="14" y="10" width="192" height="100" stroke="var(--rule-strong)" />
      <rect x="14" y="10" width="192" height="18" fill="var(--surface-2)" />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={14 + 48 * (i + 1)}
          y1={10}
          x2={14 + 48 * (i + 1)}
          y2={110}
          stroke="var(--rule)"
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={14}
          y1={28 + 16 * i}
          x2={206}
          y2={28 + 16 * i}
          stroke="var(--rule)"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={`h${i}`}
          x={20 + 48 * i}
          y={16}
          width={32}
          height="6"
          fill="var(--smoke)"
          opacity="0.5"
        />
      ))}
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <rect
            key={`c${r}-${c}`}
            x={20 + 48 * c}
            y={32 + 16 * r}
            width={28 + (c % 2 === 0 ? 8 : 0)}
            height="5"
            fill={r === 2 ? "var(--ember)" : "var(--paper)"}
            opacity={r === 2 ? 0.95 : 0.4}
          />
        ))
      )}
    </svg>
  );
}

function ChartIllustration() {
  const heights = [20, 32, 48, 36, 60, 78, 56, 90, 72, 64];
  return (
    <svg
      width="220"
      height="120"
      viewBox="0 0 220 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="14" y1="100" x2="206" y2="100" stroke="var(--rule-strong)" />
      <line x1="14" y1="20" x2="14" y2="100" stroke="var(--rule)" />
      {heights.map((h, i) => {
        const x = 22 + i * 18;
        const isPeak = h === Math.max(...heights);
        return (
          <rect
            key={i}
            x={x}
            y={100 - h}
            width={12}
            height={h}
            fill={isPeak ? "var(--ember)" : "var(--rule-strong)"}
          />
        );
      })}
      <path
        d={heights
          .map((h, i) => {
            const x = 22 + i * 18 + 6;
            const y = 100 - h;
            return `${i === 0 ? "M" : "L"}${x} ${y}`;
          })
          .join(" ")}
        stroke="var(--storm)"
        strokeOpacity="0.7"
        strokeDasharray="2 3"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function NetworkIllustration() {
  const dots: [number, number, boolean][] = [
    [40, 70, false],
    [50, 60, false],
    [60, 75, false],
    [70, 64, false],
    [80, 70, false],
    [90, 60, false],
    [105, 72, false],
    [115, 65, false],
    [125, 70, false],
    [140, 60, false],
    [60, 30, false],
    [70, 40, false],
    [78, 28, false],
    [88, 36, false],
    [100, 30, false],
    [110, 40, false],
    [120, 32, false],
    [180, 18, true],
  ];
  return (
    <svg
      width="220"
      height="120"
      viewBox="0 0 220 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="14" y1="100" x2="206" y2="100" stroke="var(--rule-strong)" />
      <line x1="14" y1="14" x2="14" y2="100" stroke="var(--rule)" />
      <line
        x1="20"
        y1="86"
        x2="160"
        y2="40"
        stroke="var(--rule-strong)"
        strokeDasharray="2 3"
      />
      {dots.map(([x, y, ember], i) => (
        <g key={i}>
          {ember && (
            <circle cx={x} cy={y} r="9" fill="var(--ember)" fillOpacity="0.18" />
          )}
          <circle
            cx={x}
            cy={y}
            r={ember ? 3.5 : 2.5}
            fill={ember ? "var(--ember)" : "var(--paper)"}
            fillOpacity={ember ? 1 : 0.6}
          />
        </g>
      ))}
      <text
        x={168}
        y={14}
        fontSize="8"
        fill="var(--ember)"
        fontFamily="var(--font-mono)"
      >
        ▸ outlier
      </text>
    </svg>
  );
}
