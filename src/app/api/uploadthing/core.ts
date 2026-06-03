import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  csvUploader: f({
    text: {
      // keep in sync with the 30 MB client-side limit in upload-area.tsx
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    // older versions used `ufsUrl`; the typed shape only exposes `url` (and
    // optionally a CDN-prefixed `appUrl`). Support both at runtime so this
    // works regardless of which @uploadthing version is pinned.
    const url =
      (file as unknown as { ufsUrl?: string; appUrl?: string; url: string })
        .ufsUrl ??
      (file as unknown as { appUrl?: string; url: string }).appUrl ??
      file.url;

    return { url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
