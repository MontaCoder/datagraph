import React from "react";

/**
 * HeroSection — the editorial intro shown on /app, above the upload area.
 *
 * Sets the tone of the workspace: this is a precision instrument, not a
 * dashboard. Heavy grotesque headline with a plotted accent.
 */
export function HeroSection() {
  return (
    <div className="w-full flex flex-col items-start max-w-2xl">
      {/* eyebrow + register */}
      <div className="flex items-center gap-3 mb-6 rise-in">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ember flex items-center gap-2">
          <span className="block size-1.5 rounded-full bg-ember ember-pulse" />
          new session
        </span>
        <span className="block w-10 h-px bg-rule" />
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-smoke">
          load → ask → plot
        </span>
      </div>

      {/* Title — heavy grotesque display */}
      <h1
        className="font-display font-black text-bone text-[42px] md:text-[68px] leading-[0.92] tracking-[-0.04em] mb-6 rise-in"
        style={{ animationDelay: "80ms" }}
      >
        What do you want to{" "}
        <span className="text-ember">plot</span>?
      </h1>

      <p
        className="text-paper text-[15px] md:text-[16px] leading-[1.65] max-w-lg rise-in"
        style={{ animationDelay: "160ms" }}
      >
        Upload a CSV. The instrument reads the schema, samples the rows, and
        drafts a few opening questions for you. Choose one, or write your own.
      </p>
    </div>
  );
}
