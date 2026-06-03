/**
 * ThinkingIndicator — small editorial badge that appears while the model
 * is thinking or executing. A pulsing ember dot + monospace caption.
 */
export function ThinkingIndicator({ thought }: { thought?: string }) {
  return (
    <div className="flex items-center gap-2.5 my-3">
      <span className="block size-1.5 rounded-full bg-ember ember-pulse" aria-hidden />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember">
        {thought || "Reading"}
        <span className="inline-block ml-1 cursor-blink" />
      </span>
    </div>
  );
}
