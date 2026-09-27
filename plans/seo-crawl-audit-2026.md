# Plan: SEO crawl/indexability audit per Ricky 第一期指南

## Context
Twitter/X 用户 @TOMRICH1619（"Ricky"）2026-09-10 推文 "SEO 入门小课堂 第一期：谷歌抓取"：
> 网站明明能正常打开，Google 却一直搜不到？先别急着改标题、堆关键词，问题可能根本不在 SEO

核心方法论：先排查抓取问题（crawlability / indexability），再做内容 SEO。
本计划用这套方法审计 TopDigg 站，定位并修复影响 Google 收录的技术问题。

## Audit 范围（按推文思路）
1. robots.txt 是否正确允许 Googlebot
2. sitemap.xml 是否存在 + 有效 + 提交到 GSC
3. meta robots 标签是否存在意外 noindex
4. canonical 标签是否正确
5. hreflang 5 语言是否完整（zh-Hans / zh-Hant / en / ja / vi）
6. JSON-LD 结构化数据是否就位
7. 渲染可达性（SPA 路由 + prerender 状态）
8. 4xx / 5xx 错误页面
9. 移动端友好
10. Core Web Vitals 起点

## Tasks
- [ ] T1: 审计当前 SEO 基础设施（sitemap/robots/SEO 组件）
- [ ] T2: 定位发现的问题
- [ ] T3: 修复
- [ ] T4: 验证 build + tsc
- [ ] T5: commit + push

