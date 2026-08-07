---
title: "Agent Plugins Deep Dive: A Vendor-Neutral Plugin Packaging Standard for AI Agents — Co-Driven by Amazon, Cursor, Microsoft, OpenAI, and Vercel"
description: "A complete analysis of the Agent Plugins specification v1.0.0 published at agent-plugins.org — an open, vendor-neutral standard for packaging reusable components into portable plugins, defining a shared format for Agent Skills and MCP servers. Core idea: every AI agent client has invented its own plugin format even when the plugins contain the same underlying components, forcing authors to rearrange or duplicate components per client. Agent Plugins defines a small interoperability floor — shared components use one predictable structure, while distribution, installation, permissions, user experience, and client-specific capabilities remain under each client's control. This article covers it all: why it exists, the directory-as-package model and manifest spec, the three MCP transports (stdio / Streamable HTTP / legacy HTTP+SSE), the PLUGIN_ROOT and PLUGIN_DATA plugin variables, reverse-domain client extensions, incremental adoption, failure isolation, and the philosophy behind its ten design decisions. From the core idea, project overview, and design philosophy to a step-by-step tutorial (minimal hello-plugin → full manifest → packaging skills → configuring MCP → implementing a client) and a summary of viewpoints and conclusions."
date: "2026-08-07"
author: "TopDigg Research Team"
tags: ["Agent Plugins", "AI Agent", "MCP", "Agent Skills", "Plugin", "Interoperability", "Open Standard", "Amazon", "OpenAI", "Microsoft", "Cursor", "Vercel"]
categories: ["Deep Dive"]
keywords: ["Agent Plugins", "AI agent plugins", "MCP", "Agent Skills", "portable plugins", "interoperability", "open standard", "plugin.json", "mcp.json", "PLUGIN_ROOT", "PLUGIN_DATA", "technical steering committee"]
---

# Agent Plugins Deep Dive: A Vendor-Neutral Plugin Packaging Standard for AI Agents — Co-Driven by Amazon, Cursor, Microsoft, OpenAI, and Vercel

> Core idea: **Agent Plugins is an open, vendor-neutral standard for packaging reusable components into portable AI agent plugins (v1.0.0).** It solves a real fragmentation problem: AI agent clients have each invented their own plugin formats, even when the plugins contain the same underlying components — authors must rearrange or duplicate those components for every client. Agent Plugins does not try to unify everything. It defines a small interoperability floor: shared components use one predictable structure, while distribution, installation, permissions, user experience, and client-specific capabilities remain under each client's control. This standard, driven by a **Technical Steering Committee (TSC)** whose initial Core Maintainers come from Amazon, Cursor, Microsoft, OpenAI, and Vercel, writes both portability and client autonomy into the spec: directory-as-package, root-level `plugin.json` as the single conformance floor, `skills/` and `mcp.json` as fixed component locations, and reverse-domain namespaces as the escape hatch for client extensions. Ten crisp design decisions answer the same question: **how to buy maximum ecosystem interoperability with a minimal spec surface.**

---

## 1. Project Overview

### 1.1 What Is It?

**Agent Plugins** is an **open, vendor-neutral plugin packaging standard** for packaging reusable components into portable plugins that extend AI agents. Its **v1.0.0 specification** defines a shared format for exactly two component types:

- **Agent Skills** (the skill format defined by `https://agentskills.io/specification`)
- **MCP servers** (the Model Context Protocol servers defined by `https://modelcontextprotocol.io/specification`)

Compatible clients (AI agent tools, development tools) can discover and load these plugins consistently.

### 1.2 Key Facts & Figures

- Website: `https://agent-plugins.org`
- Spec repository: `https://github.com/agentplugins/agent-plugins-spec`
- Spec version: **1.0.0** (status: Working Draft)
- License: **Apache-2.0** (spec text + companion docs released under Apache-2.0 / CC-BY-4.0)
- Initial TSC Core Maintainers from: **Amazon, Cursor, Microsoft, OpenAI, Vercel**
- Governance: community-governed open specification project; roles are held by **individuals, not companies**; no single vendor may control a majority of Core Maintainer seats
- Releases: spec text (`spec/1.0.0.md`), plugin manifest JSON Schema, MCP configuration JSON Schema, conformance checklist
- Companion docs: `plugin-authors` (author guide), `client-implementers` (client implementation guide), `schemas` (machine-readable schemas), `llms.txt` / `sitemap.md` (doc indexes)

### 1.3 What Problem Does It Solve?

**The problem: plugin format fragmentation.** AI agent clients (Claude Code, Cursor, OpenAI-family tools, various agent frameworks…) each define their own plugin format, even when those plugins contain the same underlying components. The result: a plugin packaged for client A often needs adaptation before client B can use it, and authors must repeatedly rearrange and duplicate components per client.

**The answer: define an interoperability floor.** Agent Plugins standardizes only the parts that can be portable across clients — shared components use one predictable structure — while distribution, installation, permissions, user experience, updates, and client-specific capabilities remain under each client's control. The spec deliberately does not prescribe: installation sources, registries, or marketplaces; enablement/update/cache UX; permission prompts, trust policy, or sandboxing; how skills are shown to users or models; internal client-extension behavior.

---

## 2. Core Ideas

### 2.1 A Minimal Interoperability Floor

Agent Plugins is not a grand unification — it explicitly standardizes only the **shared format of the portable parts**. The spec puts it this way:

> Agent Plugins defines a small interoperability floor for the parts that can be portable across clients.

This is a subtle boundary: **what is standardized is the packaging, not the runtime.** How a plugin is discovered, installed, run, surfaced, and authorized continues to be decided by each client. The standard only guarantees that the same package can be understood by any compatible client.

### 2.2 Directory-as-Package

An Agent Plugin is a **directory** — not a zip, not a registry-fetched bundle:

```text
my-plugin/
├── plugin.json          # Required: manifest, identifies the plugin and target spec version
├── skills/              # Optional: fixed location for Agent Skills
│   └── summarize/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── mcp.json             # Optional: MCP server configuration
└── com.example.client/  # Optional: client extension directory (reverse-domain)
```

Choosing the directory as the package unit yields four direct benefits: **inspectable with standard tools** (`ls`, `cat`, `git`), **editable in place during development**, **version-controllable without special tooling**, and **no discovery indirection**.

### 2.3 Two Fixed Component Locations

v1 defines exactly two component types, each with a fixed location:

- **Skills** → `skills/`: every immediate child directory containing `SKILL.md` is one skill (no recursive search of deeper descendants)
- **MCP servers** → `mcp.json`: a root-level JSON configuration file

Why fixed locations matter: `plugin.json` cannot override them or inline component configuration — **discovery rules are identical for every client**, so clients need no logic for alternate sources or precedence.

### 2.4 Open Development and Public Governance

- Proposals and technical decisions are **public**; participation is open to the broader ecosystem
- Ideas for new features and material changes begin in **GitHub Discussions**, where proposals must establish a concrete portability need and implementer support
- The Technical Charter is defined separately from the package format; roles are held by **individuals**, not companies, and no single vendor controls a majority of Core Maintainers

---

## 3. Design Philosophy

The **Design Decisions** appendix at the end of the spec is the best entry point for understanding this project's design philosophy — it explains, one by one, why each choice was made. These ten are the core:

### 3.1 Why directory-based discovery instead of archive formats?

`zip`/`tar.gz` or registry bundles require special tooling to inspect. Directories can be inspected with `ls`/`cat`/`git`, edited in place during development, and version-controlled without special tooling. **Fixed root-level locations** (`skills/`, `mcp.json`) eliminate discovery indirection, alternate-source precedence, and manifest configuration that every client would otherwise need to implement.

### 3.2 Why only Agent Skills and MCP in v1?

Because both **already have mature specifications outside this project** (agentskills.io, modelcontextprotocol.io) and meaningful cross-client adoption. Other proposed component types — commands, hooks, agents, rules, LSP servers — remain too client-specific for a stable portable contract and **stay out of v1 until their formats converge**. This is the classic "ship the minimal end-to-end first" engineering principle: standardize the two types with consensus, and leave uncertainty to the future.

### 3.3 Why root-level `plugin.json` as the conformance floor?

Every conformant client **MUST** check `plugin.json` at the plugin root. This gives plugin authors a **single manifest guaranteed to exist across all clients** — authors need no client-specific path knowledge.

### 3.4 Why a closed schema for the portable manifest?

Root `plugin.json` permits exactly 10 top-level fields: `$schema`, `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions`. A closed schema enables **strict validation, typo detection, and schema-driven key completion**. Client experiments cannot claim arbitrary top-level fields; they are contained under reverse-domain keys in `extensions`. Unknown top-level fields remain schema violations, but clients **report and ignore** them instead of rejecting an otherwise valid plugin — tolerance that leaves room for the future.

### 3.5 Why reverse-domain client extensions?

Reverse-domain identifiers provide a **decentralized collision-avoidance convention** without requiring a central client-name registry. The same identifier can serve both manifest data (`extensions` keys) and a client-specific directory (a top-level directory name), and either representation can exist independently. Extension directories stay at the top level to keep plugin layouts flat and convention-driven.

### 3.6 Why an explicit MCP configuration format?

Existing clients use incompatible MCP configuration shapes and infer transports differently. Agent Plugins defines an **explicit closed union** whose meaning is independent of any client-native format. Distinguishing Streamable HTTP from legacy HTTP+SSE gives each entry an **unambiguous initial transport**, while fallback behavior after a failed connection stays outside the portable format.

### 3.7 Why may clients support only one standard MCP transport?

Stdio and Streamable HTTP serve different deployment and security models. Requiring every MCP-capable client to support both local process execution and remote HTTP connectivity would **expand its implementation and trust surface** without changing the portable configuration format. Because each server entry declares its transport, a client can skip unsupported entries while continuing to load independent servers and components.

### 3.8 Why do schemas share the specification version?

The `plugin.json` and `mcp.json` schemas use the Agent Plugins specification version rather than independent version sequences. This gives authors and clients **one** portable format version to understand, prevents mixed-version packages, and lets `$schema` select the complete validation and interpretation contract — including requirements that JSON Schema cannot express. Republishing an unchanged schema with a new spec release is a small maintenance cost compared with exposing three independent compatibility timelines.

### 3.9 Why plugin variables instead of relative paths in configs?

MCP server arguments often need absolute paths at runtime. `${PLUGIN_ROOT}` provides an unambiguous, client-resolved **anchor for bundled files**; `${PLUGIN_DATA}` identifies the client-managed **writable state directory** that persists across updates. The `command` field does not use interpolation: a `./` path is resolved directly against the plugin root, and a bare name uses the platform's executable search rules. **Treating `command` as one token** avoids requiring clients to parse and escape user-authored shell command strings. Clients differ in inherited environment and `PATH` behavior, so Agent Plugins standardizes configured environment overrides but leaves bare-command search client-defined — plugin-relative commands provide deterministic bundled execution.

### 3.10 Why are component failures non-fatal?

When an MCP server fails to start or connect, the client **continues loading** the plugin's remaining components. A plugin that provides both skills and an MCP server should not become entirely unusable because one server is unavailable. The spec pairs non-fatal component failures with **diagnostic requirements** so failures are visible rather than silent.

---

## 4. Detailed Tutorial

### 4.1 Create a Minimal Plugin (hello-plugin)

The smallest useful plugin is a directory plus one skill, in three steps:

```text
hello-plugin/
├── plugin.json
└── skills/
    └── greet/
        └── SKILL.md
```

**Step 1: Create `plugin.json`**

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "hello-plugin"
}
```

**Step 2: Create the skill `skills/greet/SKILL.md`**

```markdown
---
name: greet
description: Greet the user and offer help.
---

Greet the user and offer help.
```

**Step 3: Load it**

A skills-capable client reads `plugin.json`, scans the immediate children of `skills/`, and validates each `SKILL.md` against the Agent Skills specification. To add MCP servers, place `mcp.json` at the plugin root using the same Agent Plugins schema version.

> For a copyable package with a complete manifest and a real skill, see: `https://github.com/agentplugins/agent-plugins-example`

### 4.2 Full Manifest Fields

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/example/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "extensions": {
    "com.example.client": {
      "setting": true
    }
  }
}
```

Key points:

- **Only two fields are required**: `$schema` (the target spec version identifier) and `name` (human-readable plugin name). Missing / wrong type / empty → the client rejects the plugin and MUST NOT discover or execute any component
- `version` SHOULD use Semantic Versioning, used for update checks and cache freshness
- The `author` object allows only `name`/`email`/`url`
- Except for explicit constraints, metadata fields are validated only by their JSON types — clients MUST NOT reject a manifest solely because `version` is not valid SemVer, a URL/email is unrecognized, or `license` is not an SPDX identifier
- Unknown top-level fields → report and ignore, continue loading (non-fatal)

### 4.3 Plugin Name Constraints

`name` must satisfy all of the following:

- Length **1–64 characters** inclusive
- Character set limited to **lowercase alphanumerics, `-`, `.`**
- **First and last characters must be alphanumeric**
- **No consecutive `--` or `..`** (single periods are allowed, e.g. `acme.tools`)

Valid: `my-plugin`, `acme.tools`, `lint3r`, `a`
Invalid: `My-Plugin` (uppercase), `-start` (leading hyphen), `has--double` (consecutive hyphens), `too.many..dots` (consecutive periods), empty string

### 4.4 Packaging Agent Skills

- Fixed location `skills/`; each **immediate child directory** containing `SKILL.md` counts as one skill; **no recursive** search of deeper descendants
- The skill itself must conform to the Agent Skills specification (`SKILL.md` format, frontmatter, `scripts/`/`references/`/`assets/` layout)
- A non-conforming skill → **skip it** and continue loading other skills (SHOULD report the invalid skill)

```text
skills/
└── deploy/
    ├── SKILL.md          # name: deploy
    ├── scripts/
    │   └── rollback.sh
    └── references/
        └── runbook.md
```

### 4.5 Configuring MCP Servers (mcp.json)

`mcp.json` MUST be a JSON object with exactly two top-level fields: `$schema` and `mcpServers`. Each server entry MUST contain a `type` field and match exactly one of the closed variants below:

**stdio (local process)**

```json
{
  "type": "stdio",
  "command": "./bin/validator",
  "args": ["--data", "${PLUGIN_DATA}/validator"],
  "env": {
    "CONFIG": "${PLUGIN_ROOT}/config.json"
  },
  "cwd": "${PLUGIN_ROOT}"
}
```

Key points:

- `command` MUST be a **single executable token** (a bare name or a plugin-relative path starting with `./`), not a shell command string; no placeholder expansion in `command`
- When `cwd` is omitted, the plugin root is the subprocess working directory; `cwd` may only be a plugin-relative path, `${PLUGIN_ROOT}`-rooted, or `${PLUGIN_DATA}`-rooted
- `args`/`env`/`cwd` support `${PLUGIN_ROOT}` and `${PLUGIN_DATA}` expansion

**Streamable HTTP (remote)**

```json
{
  "type": "streamable-http",
  "url": "https://deploy.example.com/mcp",
  "headers": {
    "X-Tenant": "public-tenant"
  }
}
```

**Legacy HTTP+SSE (deprecated)**

```json
{
  "type": "sse",
  "url": "https://legacy.example.com/sse"
}
```

Remote key points:

- `url` MUST be an absolute HTTP/HTTPS URL with no user information or fragment; non-loopback endpoints **MUST use HTTPS**
- Header names are case-insensitive; duplicate names differing only in case are invalid
- **Header values are visible package data, not a secret mechanism** — plugins MUST NOT embed credentials in headers; v1 defines no OAuth configuration or portable credential-reference fields; authorization discovery, user interaction, and credential storage are client-managed

**Transport support requirements**: an MCP-capable client MUST support at least one of `stdio` or `streamable-http` (SHOULD support both); `sse` is OPTIONAL. The client MUST use the transport declared by `type` for its initial connection attempt; Agent Plugins defines no fallback behavior if that attempt fails.

### 4.6 Plugin Variables: PLUGIN_ROOT and PLUGIN_DATA

Clients that launch plugin subprocesses **MUST** provide two environment variables in each subprocess:

- `PLUGIN_ROOT`: the absolute path to the filesystem-resolved plugin root — for referencing **bundled** scripts, binaries, and config files that ship with the plugin
- `PLUGIN_DATA`: the absolute path to a client-managed persistent data directory — for `node_modules`, virtual environments, generated code, caches, and other state that should **persist across updates** (the client MUST create it before launch, make it writable, and preserve it across updates; it MAY delete it on uninstall)

Expansion rules:

- Expansion is a **single, non-recursive** textual replacement; text introduced by a replacement is not scanned for further placeholders
- Expansion applies to every string element of `args`, every string value in `env`, and the `cwd` string; it does **not** apply to `env` keys, `command`, or fixed component locations
- Unrecognized placeholder-like text stays literal; clients MUST NOT perform any other placeholder or environment-variable expansion
- A server's `env` object MUST **NOT** contain entries named `PLUGIN_ROOT` or `PLUGIN_DATA` (the client supplies these reserved variables; such an entry invalidates the server entry)
- `env` values are also visible package data — plugins MUST NOT embed credentials in them

### 4.7 Implementing a Conformant Client

**Loading sequence (client's view)**:

1. Establish the filesystem-resolved plugin root
2. Locate and validate root `plugin.json` using the locally supported schema selected by `$schema`
3. Reject the plugin for fatal manifest violations; report and ignore the explicitly non-fatal cases
4. Discover each supported component type from its fixed location
5. Apply the failure boundary defined for each component type or entry
6. Apply implemented client-extension namespaces and ignore all others

**Minimum client requirements** (conformance essentials):

- Can load a plugin from a directory path
- Validates the closed `plugin.json` schema; ignores unimplemented `extensions` members without validating their values
- Discovers components at fixed locations for each supported component type
- If supporting MCP: supports at least one of `stdio` or `streamable-http`; provides `PLUGIN_ROOT`/`PLUGIN_DATA` and expands both in runtime configuration values
- Resolves `command` as a single executable token; uses the plugin root as the default working directory
- **Supports at least one component type** (skills or MCP) — incremental adoption is explicitly allowed: a skills-only client can conform

**Failure isolation**: unknown component types → ignore; a failure isolated to one component must not prevent loading independently valid components; failures SHOULD be reported, but lack of support for a component type, transport, or extension is not itself an error.

---

## 5. Summary of Viewpoints & Conclusions

1. **Fragmentation is the biggest interoperability tax on the AI agent ecosystem today.** Every client has its own plugin format, forcing authors to repackage repeatedly. Agent Plugins' judgment: rather than unifying runtimes, unify the **packaging contract** — the cheapest standardization entry point with the broadest consensus.

2. **"Interoperability floor" rather than "grand unification" is the right ambition.** The spec deliberately leaves distribution, installation, permissions, UX, sandboxing, and client extensions to each vendor. That restraint is what lets competitors like Amazon, Cursor, Microsoft, OpenAI, and Vercel sit at the same table — no one wants to hand over their own runtime entirely.

3. **Standardize the two component types that already have consensus.** v1 only covers Agent Skills and MCP because they have mature external specs. Commands, hooks, agents, LSP servers, etc. are still converging — "wait for formats to converge before entering v1" is a textbook defense against premature standardization.

4. **Closed schema + tolerant handling is wisdom that leaves room for the future.** Unknown top-level fields are non-fatal (report and ignore), and client experiments are contained in reverse-domain `extensions` — preserving the strictness of the portable contract while letting the ecosystem experiment freely inside namespaces.

5. **Security is designed in, not sloganeered.** Plugin paths must stay inside the plugin root (rejecting `../` escapes), `command` is never shell-interpreted, headers/env are explicitly "not a secret mechanism," non-loopback endpoints are HTTPS-only, and OAuth is explicitly left to clients — every rule shrinks the attack surface.

6. **Failure isolation makes the plugin ecosystem more robust.** One MCP server going down should not take down the whole plugin. Non-fatal component failures plus diagnostic-reporting requirements make "partially available" the default posture.

7. **Incremental adoption is the key to standard adoption.** Clients can support only skills, only MCP, or only one transport — the standard leaves a clear conformance path for gradual adoption, dramatically lowering the barrier to entry.

8. **Governance design determines a standard's credibility.** Individual-held roles rather than company seats, no single vendor holding a majority, open TSC meetings, and proposals starting in GitHub Discussions — these clauses give a standards body made of competitors a foundation for long-term trust.

---

## References

- Website: `https://agent-plugins.org`
- Spec repository: `https://github.com/agentplugins/agent-plugins-spec`
- Spec text v1.0.0: `https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md`
- Plugin manifest schema: `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`
- MCP configuration schema: `https://agent-plugins.org/schemas/1.0.0/mcp.schema.json`
- Plugin author guide: `https://agent-plugins.org/plugin-authors`
- Client implementer guide: `https://agent-plugins.org/client-implementers`
- Governance (Technical Charter): `https://github.com/agentplugins/agent-plugins-spec/blob/main/GOVERNANCE.md`
- Example plugin: `https://github.com/agentplugins/agent-plugins-example`
- Agent Skills spec: `https://agentskills.io/specification`
- MCP spec: `https://modelcontextprotocol.io/specification`
- Discussions: `https://github.com/agentplugins/agent-plugins-spec/discussions`
