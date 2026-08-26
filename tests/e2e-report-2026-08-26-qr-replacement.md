# E2E Test Report — AI Daily QR Image Replacement

**Date**: 2026-08-26
**Branch**: `main`
**Commits under test**: `a41d6d3` + `9bf7a55` (follow-up warning fix)
**Tool**: Puppeteer 25.4.0 (headless Chrome 151.0.7922.71)
**Test script**: `tests/e2e-qr-replacement.mjs`
**Result**: ✅ **56/56 assertions passed (100%)**

---

## 1. 背景

Commit `a41d6d3` 把 AI Daily post 页 header 里的 weixin 链接 Badge
（"原文出处：比特财商" + `https://mp.weixin.qq.com/s/xxxxx`）
替换为 `<picture>` 渲染的 QR 图片：

- 主图 `public/qr-scan-follow.webp`（25 KB）
- 回退 `public/qr-scan-follow.png`（115 KB）
- 5 语言 i18n caption + alt

本次 E2E 用来验证**视觉/网络/控制台**三个维度的正确性。

---

## 2. 测试矩阵

| 维度 | 范围 |
|------|------|
| 浏览器 | headless Chrome 151.0.7922.71 (macOS arm64) |
| 路由 | `/ai-daily/2026-08-20-ai-daily` × 5 locale query string |
| 语言 | zh-Hans, zh-Hant, en, ja, vi |
| 额外日期 | `/ai-daily/2026-08-24-ai-daily` (fix 前含真实 weixin URL) |
| 截图 | `screenshots/e2e-2026-08-26-qr/{locale}.png` |

每个 locale 跑 **11 项断言**（5 locale × 11 = 55）+ 1 项日期回归 = **56 项**。

---

## 3. 断言清单（per locale）

| # | 断言 | 检查点 |
|---|------|--------|
| 1 | `<picture>` 存在 | DOM 结构 |
| 2 | `<source type="image/webp">` srcset 指向 `/qr-scan-follow.webp` | WebP 主源 |
| 3 | `<img>` src 指向 `/qr-scan-follow.png` | PNG 回退 |
| 4 | `<figcaption>` 以 locale 文本起头 | i18n caption |
| 5 | `<img alt>` 含 locale alt 前缀 | i18n alt |
| 6 | 旧的 weixin `<a>` 不存在 | 链接清理 |
| 7 | 图片已被绘制 `offsetWidth > 0` | CSS 生效 |
| 8 | 图片已加载 `naturalWidth > 0` | 字节到位 |
| 9 | WebP 资源 HTTP 200/304 | 网络可达 |
| 10 | 浏览器没有请求 `mp.weixin.qq.com` | 无外呼 |
| 11 | 无 console error | React 18 静默 |

---

## 4. 结果明细

### 4.1 zh-Hans
```
✓ <picture> element present
✓ <source type="image/webp" srcSet="/qr-scan-follow.webp">
✓ <img src="/qr-scan-follow.png"> fallback
✓ <figcaption> starts with "原文出处："
✓ <img alt> contains "扫码关注公众号获取原文"
✓ Old weixin link removed (no <a href="mp.weixin...">)
✓ Image painted (offsetWidth > 0)
✓ Image loaded (naturalWidth > 0)
✓ WebP loaded (HTTP 200 or 304)
✓ No weixin URL requested by browser
✓ No console errors (locale=zh-Hans)
```

### 4.2 zh-Hant
```
✓ <figcaption> starts with "原文出處："
✓ <img alt> contains "掃碼關注公眾號獲取原文"
... (其余 9 项同上)
```

### 4.3 en
```
✓ <figcaption> starts with "Original source:"
✓ <img alt> contains "Scan the QR code for"
... (其余 9 项同上)
```

### 4.4 ja
```
✓ <figcaption> starts with "原本情報："
✓ <img alt> contains "QRコードをスキャンして原文を読む"
... (其余 9 项同上)
```

### 4.5 vi
```
✓ <figcaption> starts with "Nguồn gốc:"
✓ <img alt> contains "Quét mã QR để đọc bà"
... (其余 9 项同上)
```

### 4.6 日期回归 — 2026-08-24
```
✓ 2026-08-24 (former real weixin URL date) shows QR image, not link
```
此日期在 fix 前 frontmatter 含真实 weixin URL（已删除），现在统一走 QR 图。

---

## 5. E2E 第一轮发现的问题（已修复）

### 5.1 React 18 警告 `fetchPriority` 拼写

**现象**：
```
Warning: React does not recognize the `%s` prop on a DOM element.
... fetchPriority fetchpriority at img
```

**根因**：React 18.3.1 把 `fetchpriority` 视作 HTML 原生属性，期望 JSX 用
小写 `fetchpriority`；写成驼峰 `fetchPriority` 触发属性透传警告。

**修复**：`src/pages/AIDailyPost.tsx:185`
```diff
-                    fetchPriority="high"
+                    fetchpriority="high"
```

**Commit**：`9bf7a55 fix(ai-daily): use lowercase fetchpriority for React 18`

### 5.2 浏览器缓存 304 vs 200

**现象**：第二轮跑时 WebP 返回 HTTP 304，断言 `status === 200` 失败。

**根因**：headless Chrome 对同一 URL 命中缓存，Etag/Last-Modified 协商返回 304。
304 表示资源未变化，等价成功。

**修复**：`tests/e2e-qr-replacement.mjs:121`
```diff
-assert('WebP loaded HTTP 200', webpResp && webpResp.status === 200, ...);
+assert('WebP loaded (HTTP 200 or 304)', webpResp && (webpResp.status === 200 || webpResp.status === 304), ...);
```

---

## 6. 资产审计

| 文件 | 大小 | 状态 |
|------|------|------|
| `public/qr-scan-follow.webp` | 24.8 KB (1280×467) | ✅ 主用 |
| `public/qr-scan-follow.png` | 116.7 KB (1280×467) | ✅ 回退 |
| `public/扫码_搜索联合传播样式-标准色版.png` | 4.07 MB | ✅ 源图保留 (BMP 格式 + .png 扩展名) |

源图虽扩展名为 .png，但 magic bytes 是 `BM`（BMP）。已用 PIL 显式读取并重
编码为 webp + png。**无需再次手工干预**。

---

## 7. 资源加载性能（dev 服务器实测）

| URL | Status | 说明 |
|-----|--------|------|
| `/qr-scan-follow.webp` | 200 (first load) / 304 (cached) | 25 KB |
| `/qr-scan-follow.png` | 200 | 115 KB |

主用 webp 在浏览器缓存协商下能拿到 304，节省 25 KB 流量。

---

## 8. 自动化收益

| 项 | 价值 |
|----|------|
| 5 locale 一次性回归 | 替换 Badge 这种 UI 改动的标准动作 |
| 拦截 React 18 prop 警告 | `9bf7a55` 是被 E2E 抓住的真实 bug，不修会进生产 console |
| 网络/视觉/i18n 三位一体 | 仅 build 验证 + unit test 覆盖不到浏览器侧 |
| 截图归档 | `screenshots/e2e-2026-08-26-qr/` 留作产品复盘证据 |

---

## 9. 后续可补强（未实现）

| 维度 | 建议 |
|------|------|
| 生产 build 产物 | 当前用 `vite --port 8080` dev server，未对 `vite build` 产物跑同一脚本 |
| Lighthouse | `npm run build && npm run preview` 后跑 perf + a11y |
| 其它历史日期 | 当前覆盖 2026-08-20 + 2026-08-24，可补 2026-08-21/22/23/25/26 全量 |
| 移动端 viewport | 当前为 desktop 默认，可加 `--width=375 --height=667` 跑一次 |

---

## 10. 复现命令

```bash
# 1. 启动 dev 服务器
npx vite --port 8080 --host 127.0.0.1

# 2. 另开终端跑 E2E
node tests/e2e-qr-replacement.mjs

# 输出会写到 stdout + screenshots/e2e-2026-08-26-qr/{locale}.png
# 退出码: 0 = 全过, 1 = 有失败
```

---

## 11. 结论

- ✅ 5 locale 11 项断言 × 5 = 55 / 日期回归 1 项 = **56/56 通过**
- ✅ 控制台无 React 18 warning
- ✅ 浏览器无 `mp.weixin.qq.com` 外呼
- ✅ 图片已绘制 + 已加载
- ✅ i18n caption/alt 在 5 locale 全部命中
- ✅ 发现的 2 个 bug（`fetchPriority` 拼写 + 304 判定）已修复并回归通过

**QR 图片替换功能可交付生产。**