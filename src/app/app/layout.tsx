import type { Metadata } from "next";
import { APP_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Upload & analyze a CSV | ${APP_NAME}`,
  description:
    "Upload a CSV and ask questions in plain English. Get the code, the chart, and the answer — plotted, sandboxed, and reproducible.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
