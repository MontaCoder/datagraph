"use client";

import React from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { GITHUB_REPO } from "@/lib/utils";

/**
 * TrustSection — the engineering appendix. Three spec columns (Speed,
 * Provenance, Privacy), a charter pull-quote, and the closing CTA.
 */
export function TrustSection() {
  return (
    <section
      id="engineering"
      className="relative py-24 md:py-36 border-t border-rule overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-fine pointer-events-none opacity-40" />
      <div className="relative max-w-[1480px] mx-auto px-5 md:px-10">
        <div className="grid md:grid-cols-12 gap-8 items-end mb-16">
          <Reveal className="md:col-span-7">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember">
              [ 06 ] — engineering note
            </span>
            <h2 className="mt-4 font-display font-black text-bone text-[40px] md:text-[68px] leading-[0.95] tracking-[-0.035em]">
              Built for the
              <br />
              <span className="text-paper">honest reader.</span>
            </h2>
          </Reveal>
          <Reveal className="md:col-span-5" delay={120}>
            <p className="text-paper text-[15px] leading-[1.6] max-w-md">
              The substrate matters. Datagraph runs on the fastest open
              inference stack we&apos;ve found, sandboxed for safety, and held
              together with taste.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-px border border-rule bg-rule rounded-sm overflow-hidden">
          <Spec
            tag="i — speed"
            title="Cerebras inference"
            stat="~2.4s"
            body="Median time from question to first token. The model runs on Cerebras wafer-scale silicon — measurably faster than what most teams ship today."
            link={{ href: "https://cerebras.ai", label: "cerebras.ai" }}
            delay={0}
          />
          <Spec
            tag="ii — provenance"
            title="Sandboxed Python"
            stat="E2B"
            body="Every chart and number is produced by Python running in an isolated E2B sandbox. The exact code is shown in every reply, so the work is reproducible."
            link={{ href: "https://e2b.dev", label: "e2b.dev" }}
            delay={120}
          />
          <Spec
            tag="iii — privacy"
            title="Open & ephemeral"
            stat="MIT"
            body="Source-available under MIT. CSVs are stored only as long as needed to answer your questions. No training on your data, no advertising, no surprises."
            link={{
              href: `https://github.com/${GITHUB_REPO}`,
              label: "view source",
            }}
            delay={240}
          />
        </div>

        {/* charter pull-quote */}
        <Reveal className="mt-20 max-w-3xl mx-auto text-center">
          <p className="font-display font-extrabold text-bone text-[28px] md:text-[40px] leading-[1.1] tracking-[-0.03em]">
            Most analytics tools help you{" "}
            <span className="text-stroke-accent">build</span> a question.
            <span className="block mt-3 text-ember">We start at the answer.</span>
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="block w-12 h-px bg-rule-strong" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke">
              The Datagraph Charter, §1
            </span>
            <span className="block w-12 h-px bg-rule-strong" />
          </div>
        </Reveal>

        {/* final CTA */}
        <Reveal className="mt-20 md:mt-28 text-center" variant="scale">
          <Link
            href="/app"
            className="group inline-flex items-center justify-center gap-3 h-16 px-10 rounded-sm bg-ember text-ink font-mono font-semibold text-[13px] tracking-[0.22em] uppercase hover:bg-cinnabar transition-all hover:translate-y-[-2px] shadow-[0_28px_70px_-28px_rgb(var(--accent-rgb)/0.9)]"
          >
            <span className="block size-1.5 rounded-full bg-ink" />
            <span>Plot your first CSV</span>
            <svg
              width="16"
              height="11"
              viewBox="0 0 16 11"
              fill="none"
              className="transition-transform group-hover:translate-x-1"
            >
              <path
                d="M1 5.5h13M11 1l4 4.5L11 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </Link>
          <p className="mt-5 font-mono text-[10px] tracking-[0.2em] uppercase text-graphite">
            ▸ free · no login · 30 MB CSV · instantly
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Spec({
  tag,
  title,
  stat,
  body,
  link,
  delay,
}: {
  tag: string;
  title: string;
  stat: string;
  body: string;
  link: { href: string; label: string };
  delay: number;
}) {
  return (
    <Reveal
      delay={delay}
      className="bg-ink p-8 md:p-10 group hover:bg-surface/70 transition-colors duration-500 relative"
    >
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ember">
        {tag}
      </span>
      <div className="mt-6 flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-display font-extrabold text-bone text-[24px] md:text-[27px] leading-[1.0] tracking-[-0.025em]">
          {title}
        </h3>
        <span className="font-display font-black text-bone text-[34px] md:text-[42px] leading-none tabular">
          {stat}
        </span>
      </div>
      <p className="text-paper text-[14.5px] leading-[1.65] mt-6">{body}</p>
      <div className="pt-5 mt-6 border-t border-dashed border-rule">
        <Link
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-smoke editorial-link hover:text-bone"
        >
          ▸ {link.label}
        </Link>
      </div>
      <span
        className="absolute left-0 top-0 h-[2px] w-0 bg-ember transition-all duration-500 group-hover:w-full"
        aria-hidden
      />
    </Reveal>
  );
}
