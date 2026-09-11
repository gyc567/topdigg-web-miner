/**
 * Build script for Aura Workbench metadata.
 * Fetches latest release from GitHub API and generates src/lib/aura-meta.json.
 * Run: node scripts/build-aura.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputFile = path.join(__dirname, "../src/lib/aura-meta.json");

const REPO = "gyc567/dsh-desktop";
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const GITHUB_DOWNLOAD_BASE = `https://github.com/${REPO}/releases/download`;

const LOCALES = ["zh-Hans", "zh-Hant", "en", "ja", "vi"];

async function fetchLatestRelease() {
  const res = await fetch(API_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "topdigg-build-script",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function normalizeDescription(body, locale) {
  // Strip markdown formatting, trim lines
  const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
  const firstPara = lines.find(l => l.length > 20) || "";
  // Simple multilingual summary based on locale
  const summaries = {
    "zh-Hans": "首个 Aura 品牌正式构建（macOS Apple Silicon / Intel + Windows x64）。",
    "zh-Hant": "首個 Aura 品牌正式構建（macOS Apple Silicon / Intel + Windows x64）。",
    "en": "First official Aura-branded build (macOS Apple Silicon / Intel + Windows x64).",
    "ja": "首个Auraブランド正式ビルド（macOS Apple Silicon / Intel + Windows x64）。",
    "vi": "Bản chính thức đầu tiên mang thương hiệu Aura (macOS Apple Silicon / Intel + Windows x64).",
  };
  return summaries[locale] || summaries["en"];
}

function normalizeWarnings(locale) {
  const warnings = {
    "zh-Hans": "macOS 下载后若提示损坏，执行：`xattr -cr /Applications/Aura.app`。联系方式：Eric | 微信：360369487",
    "zh-Hant": "macOS 下載後若提示損壞，執行：`xattr -cr /Applications/Aura.app`。聯繫方式：Eric | 微信：360369487",
    "en": "On macOS, if you see 'damaged' warning after download, run: `xattr -cr /Applications/Aura.app`. Contact: Eric | WeChat: 360369487",
    "ja": "macOSでダウンロード後に破損警告が出た場合：`xattr -cr /Applications/Aura.app` を実行。連絡先：Eric | WeChat：360369487",
    "vi": "Trên macOS, nếu thấy cảnh báo 'damaged' sau khi tải, chạy: `xattr -cr /Applications/Aura.app`. Liên hệ: Eric | WeChat: 360369487",
  };
  return warnings[locale] || warnings["en"];
}

function detectPlatform(filename) {
  if (filename.includes("windows")) return "Windows";
  if (filename.includes("mac-arm64") || filename.includes("mac") && filename.includes("arm64")) return "macOS";
  if (filename.includes("mac-x64") || filename.includes("mac")) return "macOS";
  return null;
}

function detectArch(filename) {
  if (filename.includes("arm64")) return "Apple Silicon";
  if (filename.includes("x64")) return "Intel";
  return null;
}

function formatSize(bytes) {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

async function main() {
  console.log(`Fetching latest release from ${API_URL}...`);
  let release;
  try {
    release = await fetchLatestRelease();
  } catch (err) {
    // Fallback: try to read cached aura-meta.json
    if (fs.existsSync(outputFile)) {
      console.warn(`⚠️ API fetch failed (${err.message}), using cached aura-meta.json`);
      return;
    }
    console.error(`❌ API fetch failed: ${err.message}`);
    process.exit(1);
  }

  const tag = release.tag_name;
  const date = release.published_at.split("T")[0];

  // Filter relevant assets (.exe, .dmg, .zip — not .blockmap, .yml, source code)
  const skipExtensions = new Set([".blockmap", ".yml", ".zip"]);
  const downloads = (release.assets || [])
    .filter(asset => {
      const name = asset.name;
      const ext = "." + name.split(".").pop();
      return !skipExtensions.has(ext) && (name.endsWith(".exe") || name.endsWith(".dmg"));
    })
    .map(asset => ({
      platform: detectPlatform(asset.name),
      arch: detectArch(asset.name),
      file: asset.name,
      size: formatSize(asset.size),
      url: `${GITHUB_DOWNLOAD_BASE}/${tag}/${asset.name}`,
    }))
    .filter(d => d.platform && d.arch)
    .sort((a, b) => {
      // Windows first, then macOS
      if (a.platform === "Windows") return -1;
      if (b.platform === "Windows") return 1;
      return a.arch.localeCompare(b.arch);
    });

  const meta = {
    tag,
    version: tag,
    date,
    description: Object.fromEntries(LOCALES.map(l => [l, normalizeDescription(release.body || "", l)])),
    warnings: Object.fromEntries(LOCALES.map(l => [l, normalizeWarnings(l)])),
    downloads,
  };

  fs.writeFileSync(outputFile, JSON.stringify(meta, null, 2));
  const sizeKB = Math.round(Buffer.byteLength(JSON.stringify(meta), "utf8") / 1024);
  console.log(`✅ Generated aura-meta.json (${sizeKB} KB)`);
  console.log(`   Version: ${tag} | Downloads: ${downloads.length}`);
  downloads.forEach(d => console.log(`   - ${d.platform} ${d.arch}: ${d.file} (${d.size})`));
}

main();
