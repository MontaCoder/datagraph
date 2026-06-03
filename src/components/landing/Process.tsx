"use client";

import React from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Process — the three movements of the instrument, staged as numbered
 * console steps with oversized ghost numerals and staggered reveals.
 */
const STEPS = [
  {
    n: "01",
    eyebrow: "Acquire",
    title: "Load the CSV.",
    body: "Drop in any spreadsheet up to thirty megabytes — sales, surveys, sensor logs, the messy export your CFO sent at 11pm. Headers, types, and shape are detected the moment the file lands.",
    note: "30 MB · UTF-8 · auto schema",
  },
  {
    n: "02",
    eyebrow: "Inquire",
    title: "Ask in plain words.",
    body: "Skip the SQL. Skip the formulas. Type the question the way you'd ask an analyst. The model reads the schema, samples a few rows, and writes the Python it needs to answer well.",
    note: "plain language · context-aware",
  },
  {
    n: "03",
    eyebrow: "Plot",
    title: "Read code, chart, answer.",
    body: "The reply arrives as a short brief — the conclusion in plain English, the figure that proves it, and the exact Python that produced both. Every claim is reproducible.",
    note: "markdown · matplotlib · E2B",
  },
];

export function Process() {
  return (
    <section
      id="process"
      className="relative py-24 md:py-36 border-t border-rule"
    >
      <div className="max-w-[1480px] mx-auto px-5 md:px-10">
        {/* section head */}
        <div className="grid md:grid-cols-12 gap-8 mb-16 md:mb-24 items-end">
          <Reveal className="md:col-span-7">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember">
              [ 03 ] — method
            </span>
            <h2 className="mt-4 font-display font-black text-bone text-[40px] md:text-[68px] leading-[0.95] tracking-[-0.035em]">
              Three moves,
              <br />
              <span className="text-paper">no scaffolding.</span>
            </h2>
          </Reveal>
          <Reveal className="md:col-span-5" delay={120}>
            <p className="text-paper text-[15px] md:text-[16px] leading-[1.6] max-w-md">
              Most data tools make you build the question first. This one starts
              at the answer and works backward — quickly, transparently, and on
              your terms.
            </p>
          </Reveal>
        </div>

        {/* the three steps */}
        <ol className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-rule border border-rule rounded-sm overflow-hidden">
          {STEPS.map((step, idx) => (
            <Reveal
              as="li"
              key={step.n}
              delay={idx * 130}
              className="relative bg-ink p-6 md:p-8 lg:p-10 group hover:bg-surface transition-colors duration-500"
            >
              {/* number row */}
              <div className="flex items-start justify-between mb-8">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember mt-3">
                  {step.eyebrow}
                </span>
                <span
                  className="font-display font-black text-[88px] md:text-[120px] leading-none ghost-num select-none"
                  aria-hidden
                >
                  {step.n}
                </span>
              </div>

              <h3 className="font-display font-extrabold text-bone text-[26px] md:text-[32px] leading-[1.02] tracking-[-0.025em] mb-5">
                {step.title}
              </h3>

              <p className="text-paper text-[14.5px] leading-[1.65] mb-6">
                {step.body}
              </p>

              {/* footer note */}
              <div className="pt-5 border-t border-dashed border-rule flex items-center gap-2">
                <span className="block size-1.5 rounded-full bg-ember/70" />
                <span className="font-mono text-[10.5px] tracking-[0.05em] text-smoke">
                  {step.note}
                </span>
              </div>

              {/* hover ember edge */}
              <span
                className="absolute left-0 top-0 h-[2px] w-0 bg-ember transition-all duration-500 group-hover:w-full"
                aria-hidden
              />

              {idx < STEPS.length - 1 && (
                <span
                  className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 size-6 items-center justify-center bg-ink border border-rule rounded-full z-10"
                  aria-hidden
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5h6m-2-3 3 3-3 3"
                      stroke="var(--ember)"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                    />
                  </svg>
                </span>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
