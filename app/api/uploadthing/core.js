import { createUploadthing } from "uploadthing/next";
 
const f = createUploadthing();
 
// Fake auth function for now (Since we handle auth on client-side Firebase)
// In a strict production env, you would validate the Firebase token here.
const auth = (req) => ({ id: "admin" }); 
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // 1. IMAGE UPLOADER (For Blog Covers, Profile Pics)
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image Uploaded:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // 2. MEDIA UPLOADER (For Videos & Audios)
  // Allows up to 64MB videos/audios
  mediaUploader: f({ 
    video: { maxFileSize: "64MB", maxFileCount: 1 },
    audio: { maxFileSize: "32MB", maxFileCount: 1 }
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Media Uploaded:", file.url);
    }),

  // 3. DOCUMENT UPLOADER (For eBooks/PDFs)
  pdfUploader: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("PDF Uploaded:", file.url);
    }),
};
