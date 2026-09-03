---
title: "zvec-grep Deep Dive: The Local-First AI Development Assistant That Unifies Semantic and Lexical Search"
date: "2026-09-03"
description: "In-depth analysis of Alibaba's open-source zvec-grep (zg): a unified search layer combining ripgrep, BM25, and vector retrieval, connected to AI coding tools like Codex and Claude Code via MCP. Includes detailed tutorials, architecture analysis, multi-agent integration, and core design philosophy."
tags:
  - zvec-grep
  - zg
  - zvec
  - semantic search
  - BM25
  - vector retrieval
  - RRF fusion
  - MCP
  - AI coding assistant
  - local-first
  - ripgrep
  - open source
categories:
  - Deep Dive
  - Developer Tools
  - AI Programming
---

# zvec-grep Deep Dive: The Local-First AI Development Assistant That Unifies Semantic and Lexical Search

> **Core Philosophy: zvec-grep (aka zg) unifies semantic search, BM25 lexical ranking, and exact regex matching behind one local-first retrieval interface — shared by both humans at the terminal and AI coding assistants. The core problem it solves: when an AI agent needs to find "the place that handles theme preference persistence" in your codebase, how do you find it without knowing the exact keywords, while keeping all data local?**

---

## 1. Project Background and Core Positioning

### 1.1 Why Do We Need zvec-grep?

In the era of AI coding assistants, there's a recurring dilemma:

- **Exact search** (ripgrep): You know what keywords to search for, but not the specific location
- **Semantic search** (vector retrieval): You know what you want to do, but not which words to use

For example, you want to find code that "handles theme preference persistence." You might search "theme preference persistence" or "loadTheme." The former is semantically related but doesn't match the keywords; the latter is exact but requires you to guess the variable name correctly.

The more complex issue is the **AI agent search dilemma**. When AI coding assistants like Claude Code or Codex need to find answers in your local codebase, they face two choices:
- Use keyword search (easily misses semantically related but differently-phrased code)
- Use semantic search (relies on remote APIs, posing privacy risks)

zvec-grep's answer: **Both, local-first.** It unifies ripgrep's exact matching, BM25's lexical ranking, and vector retrieval's semantic discovery — all running locally, without uploading code to any remote server.

### 1.2 Project Basics

| Metric | Data |
|--------|------|
| Project Name | zg (zvec-grep) |
| Underlying Engine | zvec (Alibaba open-source) |
| Tech Stack | ripgrep + BM25 + Vector Retrieval + RRF Fusion |
| Install | npm install -g @zvec/zvec-grep |
| Node.js Requirement | Node.js 22+ |
| Supported Platforms | macOS, Linux, Windows |
| Supported AI Agents | Codex, Claude Code, Qwen Code, Qoder, Cursor, OpenCode |
| Protocol | Local MCP server, loopback-only by default |

---

## 2. Core Technical Principles

### 2.1 The Three Musketeers: Lexical + Semantic + Exact

zvec-grep's core engine exposes two complementary retrieval paths:

**Path 1: Indexed Retrieval**

Best for: Intent, related concepts, and ranked keywords

Data source: BM25/FTS and vector data in the workspace index

How it works:
1. **Vector Retrieval**: Encodes the query text into a vector and finds semantically similar content chunks in vector space
2. **BM25 Lexical Retrieval**: Performs lexical analysis on the query to find documents containing relevant terms
3. **RRF Fusion (Reciprocal Rank Fusion)**: Combines vector and BM25 ranking results using reciprocal rank fusion for the final ranking

**Path 2: Managed ripgrep**

Best for: Known text, symbols, paths, and regular expressions

Data source: Directly scans workspace files without an index

Features: Exhaustive search with exact regex matching.

### 2.2 RRF Fusion: Why Hybrid Retrieval is Stronger

RRF (Reciprocal Rank Fusion) is a classic information retrieval algorithm. Its core idea: **if a result ranks highly across multiple retrieval methods, it should rank highly in the final result.**

This hybrid approach avoids the weaknesses of both:
- Pure vector retrieval: "semantically similar but keywords don't match"
- Pure BM25: "keywords match but semantically unrelated"

### 2.3 Structure-Aware Content Extraction

zvec-grep doesn't treat files as unstructured text — it uses different extractors for different file types, preserving useful structural information:

| File Type | Extractor | Preserved Information |
|-----------|-----------|----------------------|
| Code (C/C++/Go/Java/JS/TS/Python/Rust) | CodeExtractor | Symbols, signatures, breadcrumbs, surrounding source |
| Vue/Svelte components | CodeExtractor | `<script>` blocks |
| Markdown | MarkdownExtractor | Heading sections, breadcrumbs |
| Config files (JSON/YAML/TOML/CSV) | TextExtractor | Plain-text chunks |
| Plain text documents | TextExtractor | Plain-text chunks |
| Images (explicit inclusion required) | ImageExtractor | Image content (requires multimodal Embedding) |

---

## 3. Architecture Deep Dive

### 3.1 System Architecture

```
User Layer
  │
  ├── Human/script ──→ zg CLI
  │
  └── AI Agent ──→ MCP Client ──→ Local MCP Server

Execution Layer
  │
  └── Router ──→ Direct or Server Mode
                      │
                      ▼
               ┌─────────────────┐
               │  zvec-grep Engine │
               └────────┬────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   Indexed Search   Managed ripgrep    Index Build
   (BM25+vector      (exact text+      (scan+
    +RRF fusion)      regex)           extract+
                                          embed)

Data Layer
  │
  ├── Workspace files ──→ Direct scan (ripgrep path)
  │
  └── Workspace files ──→ .zvec-grep/ index directory
```

### 3.2 Local-First Security Boundary

| Data Type | Default Behavior | Authorization Required |
|-----------|-----------------|----------------------|
| Workspace file scanning | Fully local | None |
| Local Embedding models | Fully local | None |
| Workspace index storage | Fully local (~/.zvec-grep/) | None |
| MCP server | Loopback only | None |
| Remote Embedding API | Requires explicit authorization | Each time |

Remote Embedding is the only path that might send data off the machine — zg requires explicit user authorization every time.

---

## 4. Detailed Installation and Usage Tutorial

### 4.1 Requirements

- Node.js 22.0.0 or higher
- npm or yarn
- Supported: macOS, Linux, Windows

### 4.2 Installation Steps

**Step 1: Global Install**

```bash
npm install -g @zvec/zvec-grep
```

**Step 2: Verify Installation**

```bash
zg help
zg version
```

**Step 3: Create Demo Workspace**

```bash
mkdir zg-demo && cd zg-demo

# Download two classic novels as test corpus
curl --retry 3 --retry-all-errors --progress-bar -fL \
  -o alice-in-wonderland.txt \
  https://raw.githubusercontent.com/GITenberg/Alice-s-Adventures-in-Wonderland_11/master/11.txt

curl --retry 3 --retry-all-errors --progress-bar -fL \
  -o sherlock-holmes.txt \
  https://raw.githubusercontent.com/GITenberg/The-Memoirs-of-Sherlock-Holmes_834/master/834.txt
```

**Step 4: Build Index**

```bash
zg index --embedding local/potion-retrieval-32m
```

**Step 5: Query**

```bash
# Semantic search
zg query --human "An unseen creature left a few marks. What did the detective infer?" --limit 3

# Lexical search
zg query --fts "marks" --limit 5

# Pure regex search (no index required)
zg query --rg -n "detective" sherlock-holmes.txt
```

### 4.3 Indexing a Code Repository

```bash
cd /path/to/your/project

zg index \
  --embedding local/potion-code-16m-v2 \
  -g "src/**" \
  -g "docs/**" \
  -g "!dist/**" \
  -t ts
```

### 4.4 Embedding Model Selection Guide

| Use Case | Recommended Model | Features |
|----------|------------------|----------|
| Fast code repository indexing | local/potion-code-16m-v2 | Small static Model2Vec, 1024 token limit |
| Fast English document retrieval | local/potion-retrieval-32m | Retrieval-tuned static model, 512-dim vectors |
| Fast multilingual document retrieval | local/potion-multilingual-128m | 101 languages, 256-dim vectors |
| Specialized code Transformer | local/jina-embeddings-v2-base-code | Code-oriented, multilingual, 8192 token context |
| No local model runtime | qwen/qwen3.7-text-embedding | Remote API, 128K token context |

**Set default model:**

```bash
zg config model set local/potion-code-16m-v2 --default
```

### 4.5 Integrating with AI Coding Assistants

**Install to Claude Code:**

```bash
zg install --target claude --yes
```

**Install to all supported agents:**

```bash
zg install --target all --yes
```

---

## 5. MCP Server Configuration

### 5.1 Start MCP Server

```bash
# As daemon
zg server on

# With port and token
zg server on --listen 127.0.0.1:8080 --token-file ~/.zg-token
```

### 5.2 Bearer Authentication

```bash
zg server on --token-file /path/to/token.txt
export ZVEC_GREP_SERVER_TOKEN="your-token"
```

---

## 6. Benchmark and Performance

### 6.1 Test Results

| Repository | Question Type | Description |
|------------|--------------|-------------|
| pylint-dev/pylint | What (Architecture) | How do AST nodes distinguish annotated vs non-annotated attribute initialization? |
| matplotlib/matplotlib | Where (Data/Control Flow) | How does FontInfo propagate font data through the rendering pipeline? |
| django/django | Why (Design Rationale) | How does the User model's unique constraint interact with ORM transactions? |

**Core Findings:**

- **Semantic discovery narrows the search space**: Vector retrieval first finds semantically relevant regions
- **Lexical anchoring pins exact identifiers**: BM25/RRF finds exact matches within those regions
- **Compact evidence reduces overhead**: Precisely located evidence reduces model context requirements

---

## 7. Design Philosophy

### 7.1 Local-First is Not a Gimmick

zvec-grep's local-first has several layers:

- **Data never leaves the machine**: File scanning is local, indexes stored locally
- **Index reuse**: Build once, share across CLI and all AI agents
- **Privacy and performance balance**: Local Embedding models run fully offline; remote Embedding requires explicit authorization

### 7.2 Agent-Oriented Search Design

Traditional search engines are designed for humans — return a bunch of results and let humans judge relevance.

zvec-grep is designed for AI agents — return a small number of precisely located high-quality evidence, reducing tool calls and context consumption.

**Three key metrics:**
1. **Fewer tool calls**: One precise search replaces multiple rough searches
2. **Fewer tokens consumed**: Compact evidence chunks are more efficient than entire files
3. **Less noise**: Ranking and filtering ensure irrelevant results rank low

### 7.3 The Necessity of Structure Preservation

zvec-grep preserves:
- **Code symbols**: Function names, class names, variable names
- **Signatures**: Function parameters and return types
- **Breadcrumb paths**: file → module → class → function nesting
- **Markdown headings**: Section hierarchy

---

## 8. Summary: Key Insights and Conclusions

### 8.1 What Problem zvec-grep Solves

**Core problem: The AI agent search dilemma in local codebases**

zvec-grep's solution: Use RRF fusion to unify vector retrieval and BM25 lexical ranking — all running locally.

### 8.2 Key Advantages

1. **Hybrid retrieval**: Semantic discovery + lexical anchoring + RRF fusion
2. **Local-first**: Files and indexes never leave the machine, supports fully offline use
3. **Agent-native**: MCP integration gives all major AI coding assistants local search capability
4. **Structure-aware**: Preserves code symbols, signatures, and breadcrumb paths
5. **Index reuse**: One index, shared by CLI and all agents
6. **Flexible Embedding choice**: From small local models (~16M params) to large remote APIs (128K context)

### 8.3 Use Cases

**Highly recommended for:**

- Using AI coding assistants to handle complex codebases
- Finding "don't know what keywords to search for" content in large repositories
- Privacy-conscious environments that don't want code uploaded to remote services
- Hybrid scenarios requiring both semantic search and exact matching

**Less suitable for:**

- Tiny personal projects (KB scripts don't need this complexity)
- Blind searches where you know nothing and want nothing
- Plain text documents with no structure

### 8.4 One-Line Philosophy Summary

> **zvec-grep's core insight: AI coding assistants don't need more powerful remote models — they need smarter local indexing and retrieval.** Unifying semantic search and exact matching lets AI agents both "understand what code does" and "find where it is" — all locally, without leaking a single line of code.

---

## 9. Quick Reference

**Install:**
```bash
npm install -g @zvec/zvec-grep
```

**Index:**
```bash
zg index --embedding local/potion-code-16m-v2
```

**Search:**
```bash
zg query "your search content"
zg query --fts "exact keywords"
zg query --vector "semantic description"
zg query --rg -n "regex pattern" src
```

**Integrate agents:**
```bash
zg install --target claude --yes
zg install --target all --yes
```

**Official docs:** https://github.com/zvec-ai/zvec-grep
