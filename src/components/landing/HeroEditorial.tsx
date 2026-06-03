"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Grain } from "@/components/ui/Grain";
import { useInView } from "@/hooks/useInView";

/**
 * HeroEditorial — the instrument's opening readout.
 *
 * An asymmetric split: a heavy grotesque statement on the left, a live
 * self-drawing plot panel on the right. The whole stage animates in on
 * load (staggered), and a faint crosshair tracks the cursor for an
 * instrument-under-your-hands feeling.
 */
export function HeroEditorial() {
  const stageRef = useRef<HTMLDivElement>(null);
  const vCross = useRef<HTMLDivElement>(null);
  const hCross = useRef<HTMLDivElement>(null);
  const [crossOn, setCrossOn] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (vCross.current) vCross.current.style.transform = `translateX(${x}px)`;
      if (hCross.current) hCross.current.style.transform = `translateY(${y}px)`;
    };
    const onEnter = () => setCrossOn(true);
    const onLeave = () => setCrossOn(false);
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={stageRef}
      className="relative pt-32 md:pt-40 pb-12 md:pb-20 overflow-hidden"
    >
      {/* atmosphere */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-60" />
      <div
        className="absolute inset-x-0 top-0 h-[460px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 50% 0%, rgb(var(--accent-rgb)/0.16), transparent 70%)",
        }}
      />
      <Grain opacity={0.3} />

      {/* cursor crosshair (desktop) */}
      <div
        ref={vCross}
        aria-hidden
        className={`pointer-events-none absolute top-0 bottom-0 w-px bg-ember/25 hidden md:block transition-opacity duration-300 ${
          crossOn ? "opacity-100" : "opacity-0"
        }`}
        style={{ left: 0 }}
      />
      <div
        ref={hCross}
        aria-hidden
        className={`pointer-events-none absolute left-0 right-0 h-px bg-ember/25 hidden md:block transition-opacity duration-300 ${
          crossOn ? "opacity-100" : "opacity-0"
        }`}
        style={{ top: 0 }}
      />

      <div className="relative max-w-[1480px] mx-auto px-5 md:px-10">
        {/* top register line */}
        <div
          className="flex items-center gap-4 mb-10 rise-in"
          style={{ animationDelay: "60ms" }}
        >
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember">
            csv → code → chart → answer
          </span>
          <span className="flex-1 h-px bg-rule" />
          <span className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-smoke">
            <span className="block size-1.5 rounded-full bg-moss ember-pulse" />
            instrument live
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* HEADLINE COLUMN */}
          <div className="lg:col-span-7">
            <h1 className="font-display font-black text-bone leading-[0.9] tracking-[-0.04em] text-[52px] sm:text-[72px] md:text-[88px] lg:text-[100px]">
              <span
                className="block rise-in"
                style={{ animationDelay: "120ms" }}
              >
                Every dataset
              </span>
              <span
                className="block rise-in"
                style={{ animationDelay: "220ms" }}
              >
                hides a{" "}
                <span className="relative inline-block text-ember">
                  signal.
                  <svg
                    aria-hidden
                    className="absolute -bottom-1 left-0 w-full h-3"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 7 Q 50 1, 100 6 T 198 5"
                      stroke="var(--ember)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
              <span
                className="block rise-in text-paper"
                style={{ animationDelay: "320ms" }}
              >
                We plot it.
              </span>
            </h1>

            <div
              className="mt-9 max-w-xl rise-in"
              style={{ animationDelay: "440ms" }}
            >
              <p className="text-paper text-[16px] md:text-[18px] leading-[1.6]">
                Drop a CSV.{" "}
                <span className="text-bone font-medium">Ask in plain English.</span>{" "}
                A model writes the Python, runs it in a sandbox, and hands back
                the chart, the number, and the exact code that produced them.
              </p>
            </div>

            <div
              className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rise-in"
              style={{ animationDelay: "560ms" }}
            >
              <Link
                href="/app"
                className="group relative inline-flex items-center justify-center gap-3 h-14 px-7 rounded-sm bg-ember text-ink font-mono font-semibold text-[12px] tracking-[0.18em] uppercase hover:bg-cinnabar transition-all hover:translate-y-[-2px] shadow-[0_18px_50px_-20px_rgb(var(--accent-rgb)/0.9)]"
              >
                <span className="block size-1.5 rounded-full bg-ink" />
                <span>Plot my CSV</span>
                <BigArrow />
              </Link>
              <Link
                href="#read"
                className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-sm border border-rule-strong text-bone font-mono text-[12px] tracking-[0.18em] uppercase hover:border-ember hover:text-ember transition-all"
              >
                Watch a live run
              </Link>
            </div>

            {/* micro stat strip */}
            <div
              className="mt-12 grid grid-cols-3 max-w-lg border-t border-rule rise-in"
              style={{ animationDelay: "680ms" }}
            >
              {[
                { v: "~2.4s", l: "median answer" },
                { v: "131k", l: "token context" },
                { v: "0", l: "SQL required" },
              ].map((s, i) => (
                <div
                  key={s.l}
                  className={`py-4 ${i > 0 ? "border-l border-rule pl-5" : "pr-5"}`}
                >
                  <div className="font-display font-extrabold text-bone text-[26px] md:text-[30px] leading-none tabular">
                    {s.v}
                  </div>
                  <div className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-smoke mt-2">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LIVE PLOT PANEL */}
          <aside
            className="lg:col-span-5 rise-in"
            style={{ animationDelay: "420ms" }}
          >
            <HeroPlotPanel />
          </aside>
        </div>
      </div>
    </section>
  );
}

function HeroPlotPanel() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="tick-corner relative border border-rule-strong bg-surface/70 backdrop-blur-md rounded-sm overflow-hidden shadow-[0_40px_120px_-50px_rgb(var(--accent-rgb)/0.4)]"
    >
      {/* panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-rule bg-surface-2/70">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
          ▾ fig.01 · revenue.signal
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] uppercase text-moss">
          <span className="block size-1.5 rounded-full bg-moss volt-flicker" />
          plotting
        </span>
      </div>

      {/* the plot */}
      <div className="relative px-4 pt-5 pb-3">
        <PlotSVG inView={inView} />
      </div>

      {/* readout */}
      <div className="grid grid-cols-3 divide-x divide-rule border-t border-rule">
        {[
          { k: "model", v: "glm-4.7" },
          { k: "engine", v: "e2b·py" },
          { k: "latency", v: "2.41s" },
        ].map((r) => (
          <div key={r.k} className="px-3 py-3">
            <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-smoke">
              {r.k}
            </div>
            <div className="font-mono text-[12px] text-bone tabular mt-1">
              {r.v}
            </div>
          </div>
        ))}
      </div>
      <div className="relative h-[2px] bg-rule overflow-hidden scan" />
    </div>
  );
}

function PlotSVG({ inView }: { inView: boolean }) {
  // an area chart that draws itself in
  const pts = [8, 18, 14, 28, 24, 40, 36, 52, 60, 56, 74, 88];
  const W = 380;
  const H = 200;
  const stepX = W / (pts.length - 1);
  const max = 100;
  const coords = pts.map((p, i) => [i * stepX, H - (p / max) * H]);
  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const peak = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* grid ticks */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={(H / 4) * i}
          x2={W}
          y2={(H / 4) * i}
          stroke="var(--rule)"
          strokeWidth="1"
        />
      ))}
      {coords.map(([x], i) => (
        <line
          key={`v${i}`}
          x1={x}
          y1="0"
          x2={x}
          y2={H}
          stroke="var(--rule)"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      ))}

      {/* area + line */}
      <path
        d={area}
        fill="url(#heroFill)"
        className={inView ? "fade-in" : "opacity-0"}
        style={{ animationDelay: "900ms" }}
      />
      <path
        d={line}
        stroke="var(--ember)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`plot-draw ${inView ? "is-visible" : ""}`}
        style={{ ["--len" as string]: "1200", ["--reveal-delay" as string]: "300ms" }}
      />

      {/* plotted points */}
      {coords.map(([x, y], i) => (
        <circle
          key={`p${i}`}
          cx={x}
          cy={y}
          r="2"
          fill="var(--surface)"
          stroke="var(--ember)"
          strokeWidth="1.5"
          className={inView ? "fade-in" : "opacity-0"}
          style={{ animationDelay: `${1000 + i * 40}ms` }}
        />
      ))}

      {/* highlighted peak */}
      <g
        className={inView ? "fade-in" : "opacity-0"}
        style={{ animationDelay: "1500ms" }}
      >
        <circle cx={peak[0]} cy={peak[1]} r="9" fill="var(--ember)" fillOpacity="0.18" />
        <circle cx={peak[0]} cy={peak[1]} r="3.5" fill="var(--ember)" />
        <line
          x1={peak[0]}
          y1={peak[1]}
          x2={peak[0]}
          y2={H}
          stroke="var(--ember)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      </g>
    </svg>
  );
}

function BigArrow() {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform group-hover:translate-x-1"
    >
      <path
        d="M1 5h12M9 1l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
