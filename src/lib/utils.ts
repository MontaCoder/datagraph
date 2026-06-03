import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add this helper function at the top-level (outside the component)
export function formatLLMTimestamp(dateString: string | number | Date): string {
  const date = new Date(dateString);
  // Format: Apr 8, 06:17:50 PM
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  const formatted = date.toLocaleString("en-US", options);
  return formatted;
}

export function extractCodeFromText(text: string) {
  const codeRegex = /```python\s*([\s\S]*?)\s*```/g;
  const match = codeRegex.exec(text);
  return match ? match[1] : null;
}

export type UploadedFile = {
  name?: string;
  url?: string;
  content?: string;
  csvHeaders?: string[];
  csvRows?: { [key: string]: string }[];
};

export const APP_NAME = "Datagraph";

export const GITHUB_REPO = "MontaCoder/datagraph";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const EXAMPLE_FILE_URL = "/products-100.csv";
