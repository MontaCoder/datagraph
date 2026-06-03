"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "scale" | "clip";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "reveal",
  scale: "reveal-scale",
  clip: "reveal-clip",
};

/**
 * Reveal — scroll-choreographed entrance wrapper.
 *
 * Adds `is-visible` the first time the element enters the viewport, which
 * triggers the CSS transition defined in globals.css. Stagger children by
 * passing an incremental `delay` (ms). Honors prefers-reduced-motion via CSS.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as: Tag = "div",
  threshold = 0.18,
  style,
  ...rest
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: React.ElementType;
  threshold?: number;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={cn(VARIANT_CLASS[variant], visible && "is-visible", className)}
      style={{ ["--reveal-delay" as string]: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
