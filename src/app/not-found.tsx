import Link from "next/link";
import { APP_NAME } from "@/lib/utils";

/** route not-found: a clean nil return */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-rule rounded-card bg-paper-2 overflow-hidden fade-in">
        <div className="flex items-center justify-between px-5 py-3 border-b border-rule">
          <p className="label text-ink-2">nil return</p>
          <span className="label text-muted">{APP_NAME.toLowerCase()}</span>
        </div>
        <div className="px-5 py-6">
          <p className="display text-[44px] leading-none num">
            4<span className="text-accent-2">0</span>4
          </p>
          <h1 className="mt-3 display text-[22px]">
            this page isn&apos;t on the graph.
          </h1>
          <p className="mt-2 text-[14px] leading-[1.65] text-ink-2">
            the record you&apos;re looking for doesn&apos;t exist; the link may
            be old, or the session was never plotted.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link href="/app" className="btn btn-primary min-h-10">
              start a new session
            </Link>
            <Link href="/" className="label hover:text-ink underline decoration-accent underline-offset-2">
              back to the front page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
