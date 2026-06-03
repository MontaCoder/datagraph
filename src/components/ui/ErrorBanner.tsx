/**
 * ErrorBanner — appears in the chat thread when an automatic error
 * resolution attempt is in progress. Editorial in tone, not alarmist.
 */
export function ErrorBanner({ isWaiting }: { isWaiting: boolean }) {
  return (
    <div className="mt-4 max-w-[580px] flex items-start gap-3 px-4 py-3 border border-rose/40 bg-rose/10 rounded-sm">
      {isWaiting && (
        <span
          className="block size-1.5 rounded-full bg-rose mt-1.5 animate-pulse"
          aria-hidden
        />
      )}
      <div className="flex flex-col">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-rose mb-1">
          ▾ Errata
        </span>
        <span className="text-paper text-[13.5px] leading-[1.55]">
          A small mistake in the previous code. Drafting a correction now —
          this happens occasionally, the model usually self-corrects within
          one or two attempts.
        </span>
      </div>
    </div>
  );
}
