---
title: fireworks-tech-graph：让AI替你画技术图的Agent Skill
date: 2026-08-30
description: fireworks-tech-graph 是一款专为 Codex 和 Claude Code 设计的 Agent Skill，只需用自然语言描述系统，就能得到几何校验安全的 SVG、PNG、语义 GIF 动效与离线交互 HTML。
tags:
  - AI绘图
  - Agent Skill
  - 技术图
  - SVG生成
  - Claude Code
categories:
  - AI工具
  - 技术教程
---

**项目仓库**：https://github.com/yizhiyanhua-ai/fireworks-tech-graph

## 核心概述

`fireworks-tech-graph` 停止手画图，只需用中英文描述你的系统，就能得到：

- **几何校验安全的 SVG**：自动布线，无交叉
- **高分辨率 PNG**：1920px 无损输出
- **语义 GIF 动效**：连接线从无到有，按语义顺序绘制
- **离线交互 HTML**：支持平移缩放、主题切换、多格式导出

**核心亮点**：
- 12 种视觉风格（11 种生成器驱动 + 1 种 AI 手绘）
- 14 种图类型（完整 UML 支持 + AI/Agent 领域图）
- 可执行风格系统（风格约束编码进生成器）
- Loop Engineering 设计（验证反馈循环，确保输出质量）

## 技术架构：语义驱动的图形生成

### 核心处理流程

```
Prompt → Diagram Contract → Semantic IR → Style Spec → Route Planner → SVG Build → Structural Validation → PNG Visual Readback → Targeted Revision → Verified SVG + PNG
```

### 语义形状词汇表

| 组件类型 | 形状 | 说明 |
|---------|------|------|
| **LLM** | 双边框圆角矩形 | 强调模型身份 |
| **Agent** | 六边形 | 表示智能体 |
| **Vector Store** | 带内环圆柱体 | 表示向量数据库 |
| **Database** | 圆柱体 | 数据存储 |

## Loop Engineering 设计哲学

**五项设计原则**：

1. **评估而非断言** — 完成状态必须有 validator 和渲染证据背书
2. **确定性校验优先** — XML 结构、路径几何、箭头穿框先于视觉判断
3. **感知验证其次** — 回读 PNG 检查裁切、标签碰撞、视觉层级
4. **定向修正** — 每轮只修改已诊断的问题
5. **有界收敛** — 默认最多两轮修正，防止无上限自我编辑

## 12 种视觉风格

| # | 名称 | 适用场景 |
|---|------|----------|
| 1 | 扁平图标风（默认） | 博客、幻灯片、技术文档 |
| 2 | 暗黑极客风 | GitHub README、开发者文章 |
| 3 | 工程蓝图风 | 架构设计文档、工程规范 |
| 4 | Notion 极简风 | Notion、Confluence、内部 Wiki |
| 5 | 玻璃态卡片风 | 产品官网、演讲 Keynote |
| 6 | Claude 官方风格 | Anthropic 风格图表 |
| 7 | OpenAI 官方风格 | OpenAI 风格图表 |
| 8 | 暗黑奢华风（AI 手绘） | 高级文档、README Hero |
| 9 | C4 评审画布 | C4 设计评审、ADR |
| 10 | Cloud Fabric | 多 Region 部署、VPC 归属 |
| 11 | Event Transit | Kafka/Event Stream、DLQ |
| 12 | Ops Pulse | SRE 评审、Golden Signals |

## 实战教程

### 安装

```bash
npx -y skills@1.5.17 add \
  yizhiyanhua-ai/fireworks-tech-graph/skills/fireworks-tech-graph \
  --agent codex claude-code -g -y --copy
```

### 基本使用

```
画一张 RAG 流程图
生成一张 Mem0 记忆架构图，暗黑风格
画一张微服务架构图，风格2（暗黑极客风）
```

### CLI 命令

```bash
SKILL_ROOT="${CLAUDE_SKILL_DIR:-$HOME/.agents/skills/fireworks-tech-graph}"

# 健康检查
python3 "$SKILL_ROOT/scripts/fireworks.py" doctor

# 生成 GIF 动效
python3 "$SKILL_ROOT/scripts/fireworks.py" animate diagram.svg diagram.gif
```

## 设计哲学十大观点

1. **评估而非断言** — 完成状态必须有 validator 和渲染证据背书
2. **语义先于视觉** — 先有语义 IR 再有视觉呈现
3. **风格即代码** — 风格约束编码进生成器，执行可执行契约检查
4. **几何安全是底线** — 零交叉、零跨线桥，渲染前强制执行
5. **有界自我修正** — 默认最多两轮修正，防止无限循环
6. **验证必须可观察** — `validation: passed` + `visual_review: passed`
7. **降级要有说明** — 无法验证时显式报告 `skipped`
8. **产品图标是品牌承诺** — 40+ 产品品牌色
9. **动效是语义的时序化** — 将语义顺序时序化
10. **可复用性是设计目标** — 将模糊 AI 工作流转化为约束化系统

## 结语

fireworks-tech-graph 通过**自然语言描述 + 语义 IR + 验证反馈循环**，实现了"描述即生成，生成即合规"的工作流。它的设计哲学对于任何想要构建可靠的 AI 生成系统都有借鉴意义。
