/**
 * Logo replacement pipeline.
 *
 *   node scripts/gen-logos.mjs <source-image>
 *
 * Analyzes the source (content bounding box + edge background color) with a
 * headless-browser canvas, then regenerates every logo asset in public/:
 *   logo-header.png        tight content crop, ≤560px wide
 *   icon-32.png            32×32
 *   apple-touch-icon.png   180×180
 *   icon-192.png           192×192
 *   favicon.ico            multi-size 16/32/48 (PNG-in-ICO)
 *   og-image.png           1200×630, logo centered on sampled bg
 *   TopDigg Logo - Web Miner Edition.png   full-res passthrough (EXIF stripped)
 * Square icons letterbox (contain-fit) so the whole wordmark stays visible.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const SRC = process.argv[2] ?? "/Users/jie/code/topdigg-web-miner/public/topdiggNewLogo.jpeg";
const OUT = path.join(process.cwd(), "public");
const puppeteer = (await import("puppeteer")).default;

// headless Chrome 对 file:// 图片解码受限——用 data URL 喂给 canvas
const SRC_DATA_URL = "data:image/jpeg;base64," + fs.readFileSync(SRC).toString("base64");

const b = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page = await b.newPage();
await page.goto("about:blank");

// ---------- analyze ----------
const analysis = await page.evaluate(async (src) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, W, H).data;

  // background = average of a border ring (2% inset from edges)
  const ring = Math.max(2, Math.round(Math.min(W, H) * 0.02));
  let rs = 0, gs = 0, bs = 0, n = 0;
  const sample = (x, y) => { const i = (y * W + x) * 4; rs += d[i]; gs += d[i + 1]; bs += d[i + 2]; n++; };
  for (let x = 0; x < W; x += 3) { sample(x, ring); sample(x, H - 1 - ring); }
  for (let y = 0; y < H; y += 3) { sample(ring, y); sample(W - 1 - ring, y); }
  const bg = [Math.round(rs / n), Math.round(gs / n), Math.round(bs / n)];

  // content bbox: pixels farther than ~28 (euclidean) from the bg color
  const dist = (i) => Math.hypot(d[i] - bg[0], d[i + 1] - bg[1], d[i + 2] - bg[2]);
  let minX = W, minY = H, maxX = 0, maxY = 0, found = false;
  const step = 2;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (dist((y * W + x) * 4) > 28) {
        found = true;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) { minX = 0; minY = 0; maxX = W - 1; maxY = H - 1; }
  // 2% padding inside the bbox
  const padX = Math.round((maxX - minX) * 0.02), padY = Math.round((maxY - minY) * 0.02);
  return {
    W, H,
    bg,
    bbox: { x: Math.max(0, minX - padX), y: Math.max(0, minY - padY), w: Math.min(W, maxX - minX + 2 * padX), h: Math.min(H, maxY - minY + 2 * padY) },
  };
}, SRC_DATA_URL);

const { W, H, bg, bbox } = analysis;
console.log(`源图 ${W}×${H}  背景 rgb(${bg.join(",")})  内容框 ${Math.round(bbox.w)}×${Math.round(bbox.h)} @(${bbox.x},${bbox.y})`);

// ---------- generate helpers ----------
const render = (fn, ...args) => page.evaluate(fn, ...args);
const drawContain = (ctx, img, W2, H2, pad = 0) => {
  const s = Math.min((W2 - pad * 2) / img.naturalWidth, (H2 - pad * 2) / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  ctx.drawImage(img, (W2 - w) / 2, (H2 - h) / 2, w, h);
};

const results = [];

// logo-header.png: tight crop, max 560 wide
{
  const scale = Math.min(1, 560 / bbox.w);
  const w = Math.round(bbox.w * scale), h = Math.round(bbox.h * scale);
  const dataUrl = await render(async (src, bb, w, h) => {
    const img = new Image(); img.src = src; await img.decode();
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, bb.x, bb.y, bb.w, bb.h, 0, 0, w, h);
    return cv.toDataURL("image/png");
  }, SRC_DATA_URL, bbox, w, h);
  fs.writeFileSync(path.join(OUT, "logo-header.png"), Buffer.from(dataUrl.split(",")[1], "base64"));
  results.push(`logo-header.png ${w}×${h}`);
}

// square icons (letterbox contain-fit)
const squareIcon = async (size, padRatio = 0.06) => {
  const dataUrl = await render(async (src, size, bg, padRatio) => {
    const img = new Image(); img.src = src; await img.decode();
    const cv = document.createElement("canvas"); cv.width = size; cv.height = size;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
    ctx.fillRect(0, 0, size, size);
    const s = Math.min((size * (1 - padRatio * 2)) / img.naturalWidth, (size * (1 - padRatio * 2)) / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return cv.toDataURL("image/png");
  }, SRC_DATA_URL, size, bg, padRatio);
  return Buffer.from(dataUrl.split(",")[1], "base64");
};

fs.writeFileSync(path.join(OUT, "icon-32.png"), await squareIcon(32));
results.push("icon-32.png 32×32");
fs.writeFileSync(path.join(OUT, "apple-touch-icon.png"), await squareIcon(180, 0.08));
results.push("apple-touch-icon.png 180×180");
fs.writeFileSync(path.join(OUT, "icon-192.png"), await squareIcon(192, 0.08));
results.push("icon-192.png 192×192");

// favicon.ico: multi-size PNG-in-ICO (16/32/48)
{
  const entries = [];
  for (const size of [16, 32, 48]) {
    const png = await squareIcon(size, size === 16 ? 0 : 0.06);
    entries.push({ size, png });
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dir = Buffer.alloc(16 * entries.length);
  const blobs = [];
  entries.forEach((e, i) => {
    dir[i * 16] = e.size; dir[i * 16 + 1] = e.size;
    dir[i * 16 + 2] = 0; dir[i * 16 + 3] = 0;
    dir.writeUInt16LE(1, i * 16 + 4);
    dir.writeUInt16LE(32, i * 16 + 6);
    dir.writeUInt32LE(e.png.length, i * 16 + 8);
    dir.writeUInt32LE(offset, i * 16 + 12);
    blobs.push(e.png); offset += e.png.length;
  });
  fs.writeFileSync(path.join(OUT, "favicon.ico"), Buffer.concat([header, dir, ...blobs]));
  results.push("favicon.ico 16/32/48");
}

// og-image.png: 1200×630, logo contain-centered on bg
{
  const dataUrl = await render(async (src, bg) => {
    const img = new Image(); img.src = src; await img.decode();
    const W2 = 1200, H2 = 630;
    const cv = document.createElement("canvas"); cv.width = W2; cv.height = H2;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
    ctx.fillRect(0, 0, W2, H2);
    const s = Math.min((W2 - 80) / img.naturalWidth, (H2 - 80) / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (W2 - w) / 2, (H2 - h) / 2, w, h);
    return cv.toDataURL("image/png");
  }, SRC_DATA_URL, bg);
  fs.writeFileSync(path.join(OUT, "og-image.png"), Buffer.from(dataUrl.split(",")[1], "base64"));
  results.push("og-image.png 1200×630");
}

// brand asset passthrough (EXIF stripped)
{
  const dataUrl = await render(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const cv = document.createElement("canvas"); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return cv.toDataURL("image/png");
  }, SRC_DATA_URL);
  fs.writeFileSync(path.join(OUT, "TopDigg Logo - Web Miner Edition.png"), Buffer.from(dataUrl.split(",")[1], "base64"));
  results.push("TopDigg Logo - Web Miner Edition.png " + W + "×" + H);
}

await b.close();
console.log("\n✓ 已生成:");
for (const r of results) console.log("  - " + r);
