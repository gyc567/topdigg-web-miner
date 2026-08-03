# 性能调优规范（Performance Tuning Guideline）

> 适用范围：任何以"提速/优化性能/减小体积"为目标的改动。
> 核心要求：**先测量，后优化**；必须提供 before/after 基准对比，不能靠感觉改。

## 流程

### 1. 建立基线（before）
- 记录当前指标：LCP / CLS / INP / TTFB、bundle 大小、主要 JS 体积
- 用 Lighthouse / Core Web Vitals / Playwright performance 工具实测
- 记录具体数字（如 `LCP 3.1s`、`main bundle 359KB`）

### 2. 实施优化
- 单次只改一个优化点，避免多因混叠
- 改动要有明确意图，关联到特定指标

### 3. 复测对比（after）
- 用相同方法、相同条件复测
- 输出量化对比：`LCP 3.1s → 2.2s`、`bundle 359KB → 240KB`

### 4. 结论
- 收益大于零才可保留；无收益或回退则撤销
- 记录在计划文档/PR 中