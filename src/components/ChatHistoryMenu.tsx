"use client";
import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

export function ChatHistoryMenu({ chatId }: { chatId?: string }) {
  const MAX_VISITED_CHAT_IDS = 100;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [chatLinks, setChatLinks] = useState<{ id: string; title: string }[]>(
    []
  );
  const [isLoading, setLoading] = useState(true);

  // Track visited chat ids in localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && chatId) {
      const key = "visitedChatIds";
      let ids: string[] = [];
      try {
        ids = JSON.parse(localStorage.getItem(key) || "[]");
      } catch {}
      if (!ids.includes(chatId)) {
        ids.push(chatId);
        if (ids.length > MAX_VISITED_CHAT_IDS) {
          ids = ids.slice(-MAX_VISITED_CHAT_IDS);
        }
        localStorage.setItem(key, JSON.stringify(ids));
      }
    }
  }, [chatId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "visitedChatIds";
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {}
    if (ids.length > MAX_VISITED_CHAT_IDS) {
      ids = ids.slice(-MAX_VISITED_CHAT_IDS);
      localStorage.setItem(key, JSON.stringify(ids));
    }
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChatLinks(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const HistoryHeader = () => (
    <div className="px-4 py-4 border-b border-rule bg-surface-2/60">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ember">
          ▾ Recent sessions
        </span>
        {chatLinks.length > 0 && (
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke tabular">
            {chatLinks.length}
          </span>
        )}
      </div>
    </div>
  );

  const HistoryLinks = () => {
    return (
      <div className="flex flex-col py-2 max-h-[60vh] overflow-y-auto">
        {chatLinks.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke">
              No sessions yet
            </p>
          </div>
        )}
        {chatLinks.map((chat, i) => {
          const href = `/chat/${chat.id}`;
          const isActive = pathname === href;
          return (
            <Fragment key={chat.id}>
              <Link
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-baseline gap-3 px-4 py-2.5 text-[13px] leading-snug border-l-2 transition-colors",
                  isActive
                    ? "bg-surface-2 text-bone border-ember"
                    : "text-paper border-transparent hover:bg-surface-2 hover:border-rule-strong"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] tracking-[0.1em] tabular shrink-0 mt-0.5",
                    isActive ? "text-ember" : "text-graphite"
                  )}
                >
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span className="truncate">{chat.title}</span>
              </Link>
            </Fragment>
          );
        })}
      </div>
    );
  };

  const TriggerButton = ({
    asChild = false,
  }: {
    asChild?: boolean;
  }) => (
    <button
      aria-label="Chat history"
      className={cn(
        "group inline-flex items-center justify-center size-9 rounded-sm border border-rule hover:border-ember hover:bg-surface-2 transition-colors relative",
        isLoading && "cursor-progress",
        chatLinks.length === 0 && !isLoading && "opacity-50"
      )}
      disabled={chatLinks.length === 0 && !isLoading}
    >
      <ArchiveGlyph />
      {chatLinks.length > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-ember text-ink font-mono text-[9px] tabular flex items-center justify-center border border-ink">
          {chatLinks.length > 99 ? "99+" : chatLinks.length}
        </span>
      )}
    </button>
  );

  if (isLoading || chatLinks.length === 0) {
    return <TriggerButton />;
  }

  return (
    <>
      {/* Desktop: DropdownMenu */}
      <div className="hidden md:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Chat history"
              className="group inline-flex items-center justify-center size-9 rounded-sm border border-rule hover:border-ember hover:bg-surface-2 transition-colors relative"
            >
              <ArchiveGlyph />
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-ember text-ink font-mono text-[9px] tabular flex items-center justify-center border border-ink">
                {chatLinks.length > 99 ? "99+" : chatLinks.length}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            className="!p-0 min-w-[300px] max-w-[340px] bg-surface border-rule"
          >
            <HistoryHeader />
            <HistoryLinks />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Mobile: Drawer */}
      <div className="md:hidden flex">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              aria-label="Chat history"
              className="group inline-flex items-center justify-center size-9 rounded-sm border border-rule hover:border-ember hover:bg-surface-2 transition-colors relative"
            >
              <ArchiveGlyph />
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-ember text-ink font-mono text-[9px] tabular flex items-center justify-center border border-ink">
                {chatLinks.length > 99 ? "99+" : chatLinks.length}
              </span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="!bg-surface border-rule pt-2">
            <VisuallyHidden asChild>
              <DrawerTitle>Recent sessions</DrawerTitle>
            </VisuallyHidden>
            <div className="flex justify-center pt-1 pb-2">
              <span className="block w-12 h-1 rounded-full bg-rule-strong" />
            </div>
            <HistoryHeader />
            <HistoryLinks />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

function ArchiveGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-smoke group-hover:text-ember transition-colors"
    >
      <path
        d="M1.5 3.5h11M2.5 3.5v8.5h9V3.5M5.5 6.5h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
