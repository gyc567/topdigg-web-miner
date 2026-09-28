/**
 * QR image — bundled by Vite at build time, served from /assets/ with a
 * content hash. The Vercel middleware pass-throughs any path with a file
 * extension, so the hashed asset URL always 200s.
 *
 * Updated 2026-09-28: source QR replaced from old "瑞哥观势" branding to new
 * "瑞哥观势" branding (public/eric_OT.jpg). Both webp + jpg exported so
 * <picture> tag can pick best format with jpg fallback.
 */
import qrWebp from "./qr-scan-follow.webp?url";
import qrJpg from "./qr-scan-follow.jpg?url";

export const qrImageUrlWebp: string = qrWebp;
export const qrImageUrlJpg: string = qrJpg;
