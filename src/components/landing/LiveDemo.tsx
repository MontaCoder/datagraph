"use client";

import React, { useEffect, useRef, useState } from "react";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";

/**
 * LiveDemo — a self-running demonstration of the instrument.
 *
 * Left: a question typed into the prompt. Right: the answer streaming in
 * like a readout, with a mini plot that draws as figures arrive. A marquee
 * of further queries ticks beneath. No real model calls — choreographed
 * theatre that shows the rhythm.
 */
const SCRIPTS: Array<{
  q: string;
  a: string[];
  chart?: number[];
}> = [
  {
    q: "Which countries drove revenue growth last quarter?",
    a: [
      "Three markets account for 71.4% of Q3 lift:",
      "  • Germany ··· +$842k (+18.2%)",
      "  • Brazil  ··· +$612k (+24.6%)",
      "  • Japan   ··· +$498k (+9.1%)",
      "Combined contribution exceeds the next 9 markets.",
    ],
    chart: [12, 26, 18, 32, 44, 52, 71, 64, 80, 92, 88, 96],
  },
  {
    q: "Show me the top 5 SKUs by margin, plotted.",
    a: [
      "Margin leaders, sorted descending:",
      "  ▸ SKU-4421 ··· 64.2%",
      "  ▸ SKU-1180 ··· 58.9%",
      "  ▸ SKU-2207 ··· 55.0%",
      "  ▸ SKU-3309 ··· 52.7%",
      "  ▸ SKU-0119 ··· 49.4%",
      "Chart rendered below ↓",
    ],
    chart: [64, 59, 55, 52, 49, 41, 37, 31, 25, 19, 12, 6],
  },
  {
    q: "Are weekend orders smaller on average?",
    a: [
      "Yes — weekend AOV is 14.3% lower than weekday AOV.",
      "Weekday mean: $84.20  ·  Weekend mean: $72.16.",
      "Effect is consistent across all 12 weeks observed.",
    ],
    chart: [88, 90, 84, 86, 91, 72, 70, 88, 84, 90, 73, 71],
  },
];

const TICKER_QUERIES = [
  "▸ What's our churn cohort by month?",
  "▸ Plot margin by region",
  "▸ Detect outliers in shipping cost",
  "▸ Forecast next 6 weeks of orders",
  "▸ Cluster customers by purchase pattern",
  "▸ Which channel converts best on weekends?",
  "▸ Find duplicate transactions",
  "▸ Group SKUs by velocity",
  "▸ Show me everything weird about Q2",
];

export function LiveDemo() {
  const [scriptIdx, setScriptIdx] = useState(0);
  const [typedQ, setTypedQ] = useState("");
  const [answerLines, setAnswerLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<
    "typing" | "thinking" | "answering" | "rest"
  >("typing");
  const timer = useRef<NodeJS.Timeout | null>(null);

  const current = SCRIPTS[scriptIdx];

  useEffect(() => {
    let cancelled = false;
    const clear = () => timer.current && clearTimeout(timer.current);

    async function run() {
      setPhase("typing");
      setTypedQ("");
      setAnswerLines([]);

      for (let i = 0; i <= current.q.length; i++) {
        if (cancelled) return;
        await new Promise<void>((res) => {
          timer.current = setTimeout(res, 28);
        });
        setTypedQ(current.q.slice(0, i));
      }
      setPhase("thinking");
      await new Promise<void>((res) => {
        timer.current = setTimeout(res, 900);
      });
      if (cancelled) return;

      setPhase("answering");
      for (let i = 0; i < current.a.length; i++) {
        if (cancelled) return;
        await new Promise<void>((res) => {
          timer.current = setTimeout(res, 280);
        });
        setAnswerLines((prev) => [...prev, current.a[i]]);
      }
      setPhase("rest");
      await new Promise<void>((res) => {
        timer.current = setTimeout(res, 3500);
      });
      if (cancelled) return;
      setScriptIdx((i) => (i + 1) % SCRIPTS.length);
    }

    run();
    return () => {
      cancelled = true;
      clear();
    };
  }, [scriptIdx, current]);

  return (
    <section
      id="read"
      className="relative pt-8 md:pt-16 pb-24 md:pb-36"
      aria-label="Live demonstration"
    >
      <div className="max-w-[1480px] mx-auto px-5 md:px-10">
        {/* section label */}
        <div className="flex items-end justify-between mb-8 md:mb-12 flex-wrap gap-4">
          <Reveal>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember">
              [ 02 ] — specimen
            </span>
            <h2 className="mt-3 font-display font-black text-bone text-[36px] md:text-[58px] leading-[0.98] tracking-[-0.035em] max-w-2xl">
              A live run,
              <span className="text-paper"> as it happens.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-smoke text-[14px] leading-relaxed max-w-sm font-mono">
              Watch the instrument interrogate a 100-row sales CSV in real time.
              The readout cycles through representative questions.
            </p>
          </Reveal>
        </div>

        {/* the demo console */}
        <Reveal variant="scale">
          <div className="tick-corner border border-rule-strong bg-surface/60 backdrop-blur-md rounded-sm overflow-hidden shadow-[0_50px_140px_-60px_rgb(var(--accent-rgb)/0.35)]">
            {/* console chrome */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-rule bg-surface-2/60">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-rose/70" />
                <span className="size-2 rounded-full bg-saffron/70" />
                <span className="size-2 rounded-full bg-moss/70" />
                <span className="ml-3 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke hidden sm:inline">
                  datagraph · session 0427
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
                  attached:
                </span>
                <span className="font-mono text-[10px] text-bone tabular">
                  sales_q3_2024.csv
                </span>
              </div>
            </div>

            {/* the split body */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-rule">
              {/* QUESTION PANE */}
              <div className="p-6 md:p-8 min-h-[360px] flex flex-col">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke mb-4">
                  ▸ prompt
                </div>
                <div className="flex-1 font-mono text-[14px] md:text-[15px] text-bone leading-[1.7]">
                  <span className="text-ember">$&nbsp;</span>
                  <span>{typedQ}</span>
                  {phase === "typing" && (
                    <span className="cursor-blink ml-0" aria-hidden></span>
                  )}
                </div>

                <div className="mt-6 inline-flex items-center gap-3 self-start border border-rule px-3 py-2 rounded-sm bg-surface-2/70">
                  <CsvIcon />
                  <div className="flex flex-col items-start">
                    <span className="font-mono text-[11px] text-bone">
                      sales_q3_2024.csv
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-smoke">
                      100 rows · 8 cols · 16 KB
                    </span>
                  </div>
                </div>
              </div>

              {/* ANSWER PANE */}
              <div className="p-6 md:p-8 min-h-[360px] flex flex-col bg-ink/40">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke mb-4 flex items-center gap-3">
                  <span>▸ reply</span>
                  {phase === "thinking" && (
                    <span className="text-ember flex items-center gap-2">
                      <span className="block size-1.5 rounded-full bg-ember animate-pulse" />
                      thinking
                    </span>
                  )}
                  {phase === "answering" && (
                    <span className="text-moss flex items-center gap-2">
                      <span className="block size-1.5 rounded-full bg-moss" />
                      streaming
                    </span>
                  )}
                  {phase === "rest" && (
                    <span className="text-smoke">complete · 2.4s</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 font-mono text-[13px] md:text-[13.5px] leading-[1.7] text-paper">
                  {answerLines.map((line, i) => (
                    <p
                      key={i}
                      className="rise-in"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {line.includes("·") ? (
                        <Dotted line={line} />
                      ) : (
                        <span>{line}</span>
                      )}
                    </p>
                  ))}
                  {phase === "thinking" && (
                    <span className="text-graphite">
                      <span className="cursor-blink" />
                    </span>
                  )}
                </div>

                {current.chart &&
                  phase !== "typing" &&
                  phase !== "thinking" && (
                    <div className="mt-5 pt-5 border-t border-rule">
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke mb-3">
                        ▸ fig.01
                      </div>
                      <div className="flex items-end gap-1.5 h-20">
                        {current.chart.map((v, i) => (
                          <div
                            key={`${scriptIdx}-${i}`}
                            className="flex-1 origin-bottom"
                            style={{
                              height: `${v}%`,
                              background:
                                i ===
                                current.chart!.indexOf(
                                  Math.max(...current.chart!)
                                )
                                  ? "var(--ember)"
                                  : "var(--rule-strong)",
                              animation: `grow-bar 0.7s ${i * 35}ms cubic-bezier(0.2, 0.7, 0.2, 1) both`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* footer rail */}
            <div className="border-t border-rule px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-surface-2/40">
              <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.16em] uppercase text-smoke">
                <span>
                  model:&nbsp;<span className="text-bone">glm-4.7</span>
                </span>
                <span>
                  ctx:&nbsp;<span className="text-bone">131k</span>
                </span>
                <span>
                  exec:&nbsp;<span className="text-bone">e2b · python</span>
                </span>
              </div>
              <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-graphite">
                cycling specimen {scriptIdx + 1} / {SCRIPTS.length}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ticker of additional queries */}
        <div className="mt-12 border-y border-rule py-4">
          <Marquee
            items={TICKER_QUERIES.map((q, i) => (
              <span
                key={i}
                className="font-mono text-[12px] tracking-[0.04em] text-smoke whitespace-nowrap"
              >
                {q}
              </span>
            ))}
          />
        </div>
      </div>
    </section>
  );
}

/** render a leader-dotted "label ··· value" line */
function Dotted({ line }: { line: string }) {
  const m = line.match(/^(\s*[•▸]?\s*[^·]+?)(·{2,})\s*(.*)$/);
  if (!m) return <span>{line}</span>;
  const [, label, , val] = m;
  return (
    <span className="flex items-baseline gap-2">
      <span className="text-bone">{label}</span>
      <span className="flex-1 border-b border-dashed border-rule translate-y-[-3px]" />
      <span className="text-ember tabular">{val}</span>
    </span>
  );
}

function CsvIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="2"
        width="14"
        height="16"
        rx="1"
        stroke="var(--bone)"
        strokeOpacity="0.7"
      />
      <path d="M6 7h8M6 10h8M6 13h5" stroke="var(--ember)" strokeOpacity="0.85" />
    </svg>
  );
}
