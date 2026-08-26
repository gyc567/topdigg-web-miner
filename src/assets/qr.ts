/**
 * QR image — bundled by Vite at build time, served from /assets/ with a
 * content hash. The Vercel middleware pass-throughs any path with a file
 * extension, so the hashed asset URL always 200s. This replaces the previous
 * `public/qr-scan-follow.webp` path that was silently 404'd by middleware.
 */
import qrWebp from "./qr-scan-follow.webp?url";

export const qrImageUrl: string = qrWebp;