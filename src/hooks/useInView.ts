"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useInView — fire once when an element scrolls into view.
 *
 * Returns a ref to attach and a boolean that flips to true the first time
 * the element crosses the viewport threshold. Used to trigger SVG plot
 * drawing, counters, and other one-shot entrance effects.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      });
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
