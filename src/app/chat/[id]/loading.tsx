"use client";

import { Header } from "@/components/header";

/**
 * Chat loading skeleton — editorial in tone, hairlines and ember pulse.
 * Renders alternating user/assistant blocks while the chat is fetched.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-ink flex flex-col w-full h-screen relative">
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-40" />
      <Header />

      <div className="flex flex-col md:ml-[60px] flex-1">
        {/* context bar */}
        <div className="w-full flex justify-center py-3 z-10">
          <div className="w-full max-w-3xl px-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke flex items-center gap-2">
                <span className="block size-1.5 rounded-full bg-ember ember-pulse" />
                Loading session…
              </span>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite tabular animate-pulse">
                — / — tokens
              </span>
            </div>
            <div className="w-full h-[2px] bg-rule rounded-full overflow-hidden">
              <div
                className="h-full bg-ember/60 animate-pulse"
                style={{ width: "32%" }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-4 pb-4 flex flex-col mx-auto max-w-3xl w-full gap-8 fade-in">
          {/* User bubble 1 */}
          <SkeletonUser width="60%" />
          {/* Assistant 1 */}
          <SkeletonAssistant lines={[80, 60]} />
          {/* User bubble 2 */}
          <SkeletonUser width="40%" />
          {/* Assistant 2 */}
          <SkeletonAssistant lines={[70, 90, 50]} />
          {/* Assistant 3 */}
          <SkeletonAssistant lines={[55, 75]} />
        </div>
      </div>
    </div>
  );
}

function SkeletonUser({ width }: { width: string }) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite mr-0.5">
        ▸ You
      </span>
      <div className="px-4 py-3 rounded-sm bg-surface-2 border border-rule animate-pulse min-w-[120px]">
        <span className="block h-3 bg-rule rounded" style={{ width }} />
      </div>
    </div>
  );
}

function SkeletonAssistant({ lines }: { lines: number[] }) {
  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="block size-1.5 rounded-full bg-ember ember-pulse" />
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember">
          ▾ Datagraph
        </span>
        <span className="block w-6 h-[1px] bg-rule" />
      </div>
      <div className="space-y-2.5 w-full max-w-xl">
        {lines.map((w, i) => (
          <span
            key={i}
            className="block h-3 bg-rule rounded animate-pulse"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}
