"use client";

import React from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

/**
 * WorkedExample — a full specimen report: question, prose, chart, code,
 * conclusion. The still-life of a real answer, laid out like a lab report
 * rather than a screenshot.
 */
export function WorkedExample() {
  return (
    <section
      id="specimen"
      className="relative py-24 md:py-36 border-t border-rule"
    >
      <div className="max-w-[1480px] mx-auto px-5 md:px-10">
        {/* head */}
        <div className="grid md:grid-cols-12 gap-8 mb-16 items-end">
          <Reveal className="md:col-span-7">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember">
              [ 05 ] — specimen, in full
            </span>
            <h2 className="mt-4 font-display font-black text-bone text-[40px] md:text-[68px] leading-[0.95] tracking-[-0.035em]">
              One answer,
              <br />
              <span className="text-paper">fully shown.</span>
            </h2>
          </Reveal>
          <Reveal className="md:col-span-5" delay={120}>
            <p className="text-paper text-[15px] leading-[1.6] max-w-md">
              Below is the unedited shape of a typical reply — short prose, a
              chart, the Python beneath it. Not a screenshot; a layout.
            </p>
          </Reveal>
        </div>

        {/* the "report" */}
        <Reveal variant="scale">
          <article className="tick-corner border border-rule-strong bg-surface/40 rounded-sm overflow-hidden">
            {/* report header */}
            <header className="px-6 md:px-10 py-6 border-b border-rule bg-surface/70 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke">
                  Q · 4427
                </span>
                <span className="text-graphite">|</span>
                <span className="font-display font-bold text-bone text-[17px] md:text-[20px] tracking-[-0.02em]">
                  &ldquo;Which products are quietly losing us money?&rdquo;
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
                elapsed · 2.43s
              </span>
            </header>

            {/* body — report grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-rule">
              {/* prose column */}
              <div className="md:col-span-7 bg-ink p-6 md:p-10">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember mb-4 block">
                  ▾ reply
                </span>
                <p className="font-display font-extrabold text-bone text-[23px] md:text-[27px] leading-[1.18] tracking-[-0.02em] mb-6 ember-bar pl-4">
                  Three SKUs are the culprits — each technically profitable per
                  unit, but collectively responsible for{" "}
                  <span className="text-ember">$48,712</span> of avoidable
                  shipping cost last quarter.
                </p>

                <p className="text-paper text-[15px] leading-[1.7] mb-4">
                  Filtering for orders with{" "}
                  <code className="bg-surface-2 border border-rule px-1.5 py-0.5 rounded-sm text-ember-soft">
                    margin &gt; 0
                  </code>{" "}
                  but{" "}
                  <code className="bg-surface-2 border border-rule px-1.5 py-0.5 rounded-sm text-ember-soft">
                    shipping_cost &gt; gross_margin × 0.6
                  </code>{" "}
                  surfaces an unusual cluster: oversized, low-velocity SKUs that
                  are eating their own margins through fulfillment.
                </p>

                <p className="text-paper text-[15px] leading-[1.7] mb-6">
                  The three offenders are{" "}
                  <strong className="text-bone">SKU-1180</strong>,{" "}
                  <strong className="text-bone">SKU-3309</strong>, and{" "}
                  <strong className="text-bone">SKU-4421</strong>. None show up
                  in a top-line margin report — they only emerge once shipping
                  is netted out.
                </p>

                <div className="border border-rule bg-surface-2/60 px-5 py-4 mt-8">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-moss block mb-2">
                    ▸ suggested next read
                  </span>
                  <p className="text-bone text-[14px] leading-[1.6]">
                    &ldquo;Plot shipping cost as a percentage of gross margin, by
                    SKU, to confirm whether the relationship is monotonic or
                    threshold-driven.&rdquo;
                  </p>
                </div>
              </div>

              {/* chart column */}
              <aside className="md:col-span-5 bg-ink p-6 md:p-10 flex flex-col">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke mb-4">
                  fig.01 · shipping cost as % of margin (top 12)
                </span>

                <div className="flex-1 min-h-[260px] border border-rule bg-surface-2/40 p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-fine opacity-40" />
                  <FauxChart />
                </div>

                <div className="mt-3 font-mono text-[10.5px] text-smoke leading-[1.6]">
                  ✦ bars in <span className="text-ember">volt</span> exceed the
                  60% threshold. source columns:{" "}
                  <code className="text-bone">
                    sku, gross_margin, shipping_cost
                  </code>
                  .
                </div>
              </aside>
            </div>

            {/* code drawer */}
            <div className="border-t border-rule bg-surface/70">
              <div className="px-6 md:px-10 py-3 flex items-center justify-between border-b border-rule">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
                    ▸ source · python
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-moss">
                    · executed
                  </span>
                </div>
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
                  env: e2b · pandas 2.2 · matplotlib 3.9
                </span>
              </div>
              <pre className="p-6 md:p-10 text-[12.5px] leading-[1.7] font-mono text-paper overflow-x-auto">
                <code>
                  <span className="text-smoke"># load &amp; trim</span>
                  {"\n"}
                  <span className="text-storm">df</span> = pd.read_csv(
                  <span className="text-ember-soft">&quot;sales_q3_2024.csv&quot;</span>
                  )
                  {"\n"}
                  <span className="text-storm">df</span> ={" "}
                  <span className="text-storm">df</span>[
                  <span className="text-storm">df</span>[
                  <span className="text-ember-soft">&quot;gross_margin&quot;</span>]
                  &gt; <span className="text-saffron">0</span>]{"\n\n"}
                  <span className="text-smoke"># shipping load</span>
                  {"\n"}
                  <span className="text-storm">df</span>[
                  <span className="text-ember-soft">&quot;ship_load&quot;</span>] = (
                  {"\n"}
                  {"  "}
                  <span className="text-storm">df</span>[
                  <span className="text-ember-soft">&quot;shipping_cost&quot;</span>] /{" "}
                  <span className="text-storm">df</span>[
                  <span className="text-ember-soft">&quot;gross_margin&quot;</span>]
                  {"\n"})
                  {"\n"}
                  <span className="text-storm">offenders</span> ={" "}
                  <span className="text-storm">df</span>[
                  <span className="text-storm">df</span>[
                  <span className="text-ember-soft">&quot;ship_load&quot;</span>] &gt;{" "}
                  <span className="text-saffron">0.6</span>]{"\n\n"}
                  <span className="text-smoke"># sum avoidable cost</span>
                  {"\n"}
                  <span className="text-storm">offenders</span>[
                  <span className="text-ember-soft">&quot;shipping_cost&quot;</span>].
                  <span className="text-bone">sum</span>()
                  {"   "}
                  <span className="text-smoke"># → 48712.04</span>
                </code>
              </pre>
            </div>

            {/* footer */}
            <footer className="px-6 md:px-10 py-5 border-t border-rule bg-surface/60 flex items-center justify-between flex-wrap gap-4">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke">
                cited from sales_q3_2024.csv · 100 rows considered
              </span>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-ember editorial-link"
              >
                try a question of your own
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1 5h8m-3-3 3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                  />
                </svg>
              </Link>
            </footer>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

function FauxChart() {
  const data = [
    { l: "0119", v: 0.18, e: false },
    { l: "0227", v: 0.22, e: false },
    { l: "1042", v: 0.31, e: false },
    { l: "1180", v: 0.71, e: true },
    { l: "1305", v: 0.34, e: false },
    { l: "2207", v: 0.42, e: false },
    { l: "2918", v: 0.28, e: false },
    { l: "3309", v: 0.78, e: true },
    { l: "3641", v: 0.39, e: false },
    { l: "4030", v: 0.46, e: false },
    { l: "4421", v: 0.84, e: true },
    { l: "4870", v: 0.51, e: false },
  ];
  const max = 1;
  return (
    <div className="absolute inset-5 flex flex-col">
      <div
        className="absolute left-0 right-0 border-t border-dashed border-ember/60"
        style={{ top: `${(1 - 0.6 / max) * 100}%` }}
      >
        <span className="absolute right-0 -top-3 font-mono text-[9px] tracking-[0.16em] uppercase text-ember bg-ink px-1">
          threshold · 60%
        </span>
      </div>
      <div className="flex-1 flex items-end gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full origin-bottom"
              style={{
                height: `${(d.v / max) * 100}%`,
                background: d.e ? "var(--ember)" : "var(--rule-strong)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center font-mono text-[8px] tracking-[0.05em] text-graphite"
          >
            {d.l}
          </span>
        ))}
      </div>
    </div>
  );
}
