import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Dira Creative client attachment uploads; keep client-side validation in sync with these limits.
// Keep the client-side validation in request-form.tsx in sync with these limits.
export const ourFileRouter = {
  fileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.info("[Dira Creative] client attachment uploaded", {
      name: file.name,
      size: file.size,
      type: file.type,
      urlAvailable: Boolean(file.url || file.ufsUrl),
    });
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
