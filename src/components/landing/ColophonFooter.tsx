"use client";

import React from "react";
import Link from "next/link";
import { EditionStamp } from "@/components/ui/EditionStamp";
import { Reveal } from "@/components/ui/Reveal";
import { GITHUB_REPO } from "@/lib/utils";

/**
 * ColophonFooter — the instrument's sign-off. A massive clip-revealed
 * wordmark sitting on a plotted baseline, the colophon note, link columns,
 * and the build stamp.
 */
export function ColophonFooter() {
  return (
    <footer className="relative pt-24 pb-12 border-t border-rule overflow-hidden">
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-40" />
      <div className="relative max-w-[1480px] mx-auto px-5 md:px-10">
        {/* giant wordmark on a baseline */}
        <Reveal variant="clip" className="overflow-hidden mb-2">
          <div className="font-display font-black text-bone text-[19vw] md:text-[15vw] leading-[0.82] tracking-[-0.05em] select-none">
            datagraph
            <span className="text-ember">.</span>
          </div>
        </Reveal>
        <div className="relative h-px bg-rule-strong mb-12">
          <span className="absolute left-0 -top-[3px] size-1.5 rounded-full bg-ember" />
          <span className="absolute left-1/3 -top-[2px] size-1 rounded-full bg-smoke" />
          <span className="absolute left-2/3 -top-[2px] size-1 rounded-full bg-smoke" />
          <span className="absolute right-0 -top-[5px] size-2.5 rounded-full bg-ember/20 grid place-items-center">
            <span className="size-1 rounded-full bg-ember" />
          </span>
        </div>

        <div className="grid md:grid-cols-12 gap-10 pt-10 border-t border-rule">
          {/* colophon note */}
          <Reveal className="md:col-span-5">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember">
              ▾ colophon
            </span>
            <p className="mt-4 text-paper text-[14.5px] leading-[1.7] max-w-md">
              <span className="font-display font-bold text-bone">Datagraph</span>{" "}
              is set in <span className="text-bone">Archivo</span> and{" "}
              <span className="text-bone">Geist</span>, with telemetry in{" "}
              <span className="text-bone">Geist Mono</span>. The model is GLM
              4.7, the inference stack is Cerebras, and the sandbox is E2B. Built
              and maintained as a love letter to the CSV.
            </p>
          </Reveal>

          {/* link columns */}
          <Reveal className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8" delay={120}>
            <FooterColumn
              heading="Sections"
              links={[
                { label: "Specimen", href: "#read" },
                { label: "Method", href: "#process" },
                { label: "Faculties", href: "#faculties" },
                { label: "Engineering", href: "#engineering" },
              ]}
            />
            <FooterColumn
              heading="Launch"
              links={[
                { label: "Open the app", href: "/app" },
                { label: "Use example CSV", href: "/app" },
                {
                  label: "API & source",
                  href: `https://github.com/${GITHUB_REPO}`,
                },
              ]}
            />
            <FooterColumn
              heading="Press"
              links={[
                { label: "Cerebras", href: "https://cerebras.ai" },
                { label: "E2B", href: "https://e2b.dev" },
                { label: "Together AI", href: "https://together.ai" },
              ]}
            />
          </Reveal>
        </div>

        {/* bottom rule */}
        <div className="mt-12 pt-6 border-t border-rule flex flex-wrap items-center justify-between gap-4">
          <EditionStamp showDate showLive edition="REV 001 · MIT" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
            © {new Date().getFullYear()} · Datagraph · MIT · all rows equal
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke block mb-4">
        ▸ {heading}
      </span>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="font-display font-semibold text-bone text-[17px] leading-[1.2] tracking-[-0.02em] editorial-link hover:text-ember transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
