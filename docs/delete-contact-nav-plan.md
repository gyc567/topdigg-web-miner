# 方案：删除首页主菜单"联系"选项

**状态**：✅ 已完成
**日期**：2026-08-19
**更新**：2026-08-20（审计修正）

---

## 背景

首页主菜单包含"联系"选项，指向 `/contact` 页面。需要评估并删除该功能。

---

## 需要修改的文件（4处）

| # | 文件 | 操作 | 说明 |
|---|------|------|------|
| 1 | `src/config/site.ts` | 删除 nav.main 中的"联系"对象 | 第 **147-155** 行 |
| 2 | `src/App.tsx` | 删除 `Contact` 的 lazy 导入和路由 | 第 17 行导入 + 第 37 行路由 |
| 3 | `src/pages/Contact.tsx` | 删除整个文件 | 页面组件不再需要 |
| 4 | `src/locales/*/translation.json` | 删除 `pages.contact` 翻译块 | Contact 页面专属翻译 |

### 翻译文件详情

每个语言文件中，需删除 `pages` 对象下的 `contact` 子对象（Contact 页面自己使用的翻译）：

| 文件 | 行范围 |
|------|--------|
| `src/locales/zh-Hans/translation.json` | 第 89-99 行（`"contact": { ... }"`） |
| `src/locales/zh-Hant/translation.json` | 第 72-82 行 |
| `src/locales/en/translation.json` | 第 72-79 行 |
| `src/locales/ja/translation.json` | 第 72-82 行 |
| `src/locales/vi/translation.json` | 第 72-82 行 |

> ⚠️ **不要删除** `pages.site.contactTitle` / `pages.site.contactDesc`（第 69-70 行附近）。这些是**页脚导航区**的翻译，由 About、Privacy 等多个页面共享，与 Contact 页面无关。

---

## 不需要修改的文件

| 文件 | 原因 |
|------|------|
| `src/components/AuthorBio.tsx` | 使用 `footer.contactTitle`（页脚通用词条），**与 /contact 页面无关** |
| `src/pages/About.tsx` | 页面内嵌联系说明，**不是导航链接** |
| `src/pages/Privacy.tsx` | 同上 |
| `pages.site.contactTitle/contactDesc` | 页脚导航共享词条，被 About/Privacy/AuthorBio 等多处引用，**不可删除** |
| `public/sitemap.xml` | 当前已无 `/contact` 链接（静态文件，构建时自动重新生成） |
| `public/llms.txt` / `public/llms-full.txt` | 当前已无 `/contact` 引用（由构建流程自动更新） |

---

## 验证步骤

修改后运行：

```bash
npm run build
```

确保：
- [ ] 无编译错误
- 构建产物 `dist/sitemap.xml` 中无 `/contact` 残留
- 构建产物 `dist/llms.txt` / `dist/llms-full.txt` 中无 `/contact` 残留

---

## 实施后检查清单

- [ ] `src/config/site.ts` 中"联系"菜单项已删除（原第 147-155 行）
- [ ] `src/App.tsx` 中 Contact 导入（第 17 行）和路由（第 37 行）已删除
- [ ] `src/pages/Contact.tsx` 文件已删除
- [ ] 5 个语言文件的 `pages.contact` 翻译块已删除
- [ ] 5 个语言文件的 `pages.site.contactTitle` / `pages.site.contactDesc` **未误删**
- [ ] `npm run build` 成功
- [ ] `dist/sitemap.xml` 中无 `/contact` 链接
- [ ] `dist/llms.txt` 中无 `/contact` 引用
