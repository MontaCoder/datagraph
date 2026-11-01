"use client";

import { useEffect } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/utils";

/** route error boundary: a clean fault notice with a reset */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-error/40 bg-error/5 rounded-card overflow-hidden fade-in">
        <div className="flex items-center justify-between px-5 py-3 border-b border-error/40">
          <p className="label text-error">errata, instrument fault</p>
          <span className="label text-error/70">{APP_NAME.toLowerCase()}</span>
        </div>
        <div className="px-5 py-6">
          <h1 className="display text-[26px]">something went wrong.</h1>
          <p className="mt-2 text-[14px] leading-[1.65] text-ink-2">
            the instrument hit an unexpected error while rendering this page.
            your data is safe; try again, or head back to the app.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="btn btn-primary min-h-10"
            >
              try again
            </button>
            <Link href="/app" className="label hover:text-ink underline decoration-accent underline-offset-2">
              back to the app
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
