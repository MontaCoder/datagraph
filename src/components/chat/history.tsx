"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { ArchiveGlyph } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────
   history — visited-session menu. desktop: dropdown; phone:
   bottom sheet. visited ids are tracked in localStorage and
   resolved against /api/chat/history.
   ───────────────────────────────────────────────────────────── */

const MAX_VISITED_CHAT_IDS = 100;

function readVisitedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem("visitedChatIds") || "[]");
  } catch {
    return [];
  }
}

function HistoryBody({
  links,
  pathname,
  onNavigate,
}: {
  links: { id: string; title: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col py-1 max-h-[60vh] overflow-y-auto">
      {links.length === 0 && (
        <p className="label text-center px-4 py-8">no sessions yet</p>
      )}
      {links.map((chat, i) => {
        const href = `/chat/${chat.id}`;
        const active = pathname === href;
        return (
          <Link
            key={chat.id}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-baseline gap-3 px-4 py-2.5 text-[13px] leading-snug border-l-2 transition-colors",
              active
                ? "bg-paper-3 text-ink border-accent"
                : "text-ink-2 border-transparent hover:bg-paper-3 hover:border-rule-2"
            )}
          >
            <span className={cn("readout shrink-0 mt-0.5", active ? "text-accent-2" : "text-muted")}>
              {String(i + 1).padStart(3, "0")}
            </span>
            <span className="truncate">{chat.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

function HistoryHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-rule bg-paper-2 rounded-t-card">
      <p className="label text-ink">recent sessions</p>
      {count > 0 && <span className="readout text-muted">{count}</span>}
    </div>
  );
}

function TriggerButton({ count, loading }: { count: number; loading: boolean }) {
  return (
    <button
      type="button"
      aria-label="Chat history"
      disabled={count === 0 && !loading}
      className={cn(
        "relative inline-flex items-center justify-center size-9 rounded-card border border-rule hover:border-rule-2 hover:bg-paper-2 transition-colors text-muted hover:text-ink cursor-pointer",
        loading && "cursor-progress",
        count === 0 && !loading && "opacity-40 pointer-events-none"
      )}
    >
      <ArchiveGlyph />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 bg-accent text-accent-ink readout text-[9px] flex items-center justify-center rounded-pill">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export function HistoryMenu({ chatId }: { chatId?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [links, setLinks] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !chatId) return;
    const ids = readVisitedIds();
    if (!ids.includes(chatId)) {
      const trimmed = [...ids, chatId].slice(-MAX_VISITED_CHAT_IDS);
      localStorage.setItem("visitedChatIds", JSON.stringify(trimmed));
    }
  }, [chatId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = readVisitedIds();
    if (ids.length === 0) {
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t);
    }
    fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLinks(data);
      })
      .catch(() => {
        // history is best-effort
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || links.length === 0) {
    return <TriggerButton count={links.length} loading={loading} />;
  }

  return (
    <>
      {/* desktop */}
      <div className="hidden md:block">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <TriggerButton count={links.length} loading={loading} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="right"
              align="start"
              sideOffset={10}
              className="w-[320px] bg-paper-2 border border-rule rounded-card shadow-card z-[100] p-0 overflow-hidden"
            >
              <HistoryHeader count={links.length} />
              <HistoryBody links={links} pathname={pathname} />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* phone */}
      <div className="md:hidden">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <TriggerButton count={links.length} loading={loading} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[400] bg-paper/75" />
            <Dialog.Content className="fixed bottom-0 inset-x-0 z-[400] bg-paper border-t border-rule rounded-t-card pb-[env(safe-area-inset-bottom)]">
              <Dialog.Title className="sr-only">recent sessions</Dialog.Title>
              <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
                <span className="block w-10 h-[3px] bg-rule-2" />
              </div>
              <HistoryHeader count={links.length} />
              <HistoryBody links={links} pathname={pathname} onNavigate={() => setOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}
