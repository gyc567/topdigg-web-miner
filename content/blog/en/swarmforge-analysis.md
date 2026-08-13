---
slug: swarmforge-analysis
title: "SwarmForge: A tmux-Based Multi-AI Agent Orchestration Platform"
description: "In-depth analysis of SwarmForge (tmux-based AI Agent orchestration platform) — achieving multi-AI agent collaborative software development through workflow configuration (two-pack/four-pack/six-pack), Worktree isolation, Handoff protocol, and Constitution structure. Covers: project architecture, three preset workflows, mechanisms, configuration-driven design philosophy, and usage examples."
date: "2026-08-13"
author: "TopDigg"
tags: ["SwarmForge", "Multi-Agent", "tmux", "AI Agent", "Orchestration", "Worktree", "Handoff", "Developer Tools", "AI Agents"]
categories: ["Deep Dive"]
keywords: ["SwarmForge", "Multi-Agent", "tmux", "AI Agent Orchestration", "Worktree Isolation", "Handoff Protocol", "Software Engineering", "Automation", "Developer Tools", "AI Collaboration", "four-pack", "six-pack"]
---

# SwarmForge: A tmux-Based Multi-AI Agent Orchestration Platform

> Core Philosophy: **Let multiple AI agents work together like a development team.** SwarmForge is a lightweight multi-AI Agent orchestration platform running in a local tmux environment, coordinating multiple AI agents to collaboratively develop software projects through configuration-driven workflows. It doesn't pursue complex cloud services or fancy interfaces, but focuses on enabling AI Agents to work efficiently in isolated git worktrees through structured Handoff protocols. This is a complete guide covering SwarmForge's architecture, core mechanisms, three preset workflows, and usage patterns.

## 1. Project Introduction and Overview

### 1.1 One-Line Pitch

**SwarmForge is a tmux-based multi-AI Agent orchestration platform that enables multiple AI agents to collaboratively develop software projects in isolated git worktrees through configuration-driven workflows.**

Its core philosophy is "Configuration as Code" — rather than relying on hardcoded workflows, it defines the entire team's collaboration approach through `swarmforge.conf` configuration files and role prompt definitions. Each role (Agent) works in its own isolated environment, passing tasks and context through structured Handoff files.

### 1.2 Project Metadata

| Field | Value |
|-------|-------|
| GitHub | [unclebob/swarm-forge](https://github.com/unclebob/swarm-forge) |
| Stars | TBD |
| License | TBD |
| Language | Shell + Config Files |
| Author | unclebob (fork by gyc567）|
| Dependencies | tmux, git |

### 1.3 Core Value Proposition

SwarmForge's core values can be summarized in three words:

- **Lightweight Execution**: Runs in a local tmux environment, no complex cloud infrastructure required
- **Configuration-Driven**: All workflows defined through configuration files, not hardcoded
- **Isolated Collaboration**: Each role works in an isolated git worktree, avoiding interference

### 1.4 Differences from Other Multi-Agent Systems

The key difference between SwarmForge and other multi-agent systems (like CrewAI, AutoGen, LangChain Agents):

```
┌─────────────────────────────────────────────┐
│  Other Multi-Agent Systems                   │
│  - Complex message passing mechanisms        │
│  - Centralized coordinator                  │
│  - Requires API keys and cloud services      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  SwarmForge                                  │
│  - Lightweight tmux sessions                │
│  - Distributed collaboration (via Handoff)   │
│  - Local execution, no external dependencies │
└─────────────────────────────────────────────┘
```

## 2. Core Design Philosophy

### 2.1 Configuration as Code

SwarmForge's most important design principle is **configuration-driven**. This is reflected in:

**Declarative Workflows**
- No complex coordination code to write
- Declare workflows and roles in `swarmforge.conf`
- System automatically creates tmux windows and sessions based on config

**Externalized Role Prompts**
- Each role's behavior defined by prompts in `roles/` directory
- Modify role behavior anytime without changing core code
- Support for project-specific custom roles

**Constitutional Constraints**
- Team behavior guidelines defined via `constitution.prompt`
- Includes engineering standards (engineering.prompt)
- Defines Handoff protocol (handoffs.prompt)
- Specifies workflow rules (workflow.prompt)

### 2.2 Isolation First

**Worktree Isolation**
- Each role works in an isolated git worktree
- Prevents multiple Agents from modifying the same codebase simultaneously
- Supports parallel processing of different task branches

**Session Isolation**
- Each role has its own tmux window
- Real-time observation of each Agent's status
- One Agent's problems don't affect other Agents

### 2.3 Handoff Protocol

**Structured Task Transfer**
- Agents pass tasks through Handoff files
- Includes current state, completed work, and next steps
- Ensures smooth task transfer between Agents

**Context Preservation**
- Each Handoff contains sufficient context
- Recipient can immediately take over work
- Reduces redundant work and state loss

## 3. Three Preset Workflows in Detail

### 3.1 two-pack: Fast Backend Tasks

**Best For**: Simple to moderately complex backend tasks

**Role Configuration**:
| Role | Responsibility |
|------|-----------------|
| coder | Code writing and implementation |
| cleaner | Code cleanup and optimization |

**Workflow**:
```
User starts two-pack
    ↓
coder writes code in isolated worktree
    ↓
coder completes, generates Handoff file
    ↓
cleaner reads Handoff, cleans code
    ↓
cleaner completes, outputs final code
```

**Characteristics**:
- Minimal configuration, great for quick tasks
- Two Agents focused on their respective responsibilities
- Suitable for small projects or single-feature development

### 3.2 four-pack: Medium Complexity Projects

**Best For**: Medium complexity fullstack projects

**Role Configuration**:
| Role | Responsibility |
|------|-----------------|
| specifier | Requirements analysis and specification |
| coder | Code writing and implementation |
| refactorer | Code refactoring and optimization |
| architect | Architecture design and decisions |

**Workflow**:
```
User starts four-pack
    ↓
specifier analyzes requirements, generates specification
    ↓
architect designs architecture based on specs
    ↓
coder writes code according to architecture
    ↓
refactorer refactors and optimizes code
    ↓
Outputs final codebase
```

**Characteristics**:
- Four roles covering complete development lifecycle
- From requirements to architecture to implementation and optimization
- Suitable for small-to-medium projects requiring some planning

### 3.3 six-pack: Large Projects

**Best For**: Large complex projects requiring strict quality assurance

**Role Configuration**:
| Role | Responsibility |
|------|-----------------|
| specifier | Requirements analysis and specification |
| coder | Code writing and implementation |
| cleaner | Code cleanup and optimization |
| architect | Architecture design and decisions |
| hardener | Security hardening and performance optimization |
| QA | Quality assurance and testing |

**Workflow**:
```
User starts six-pack
    ↓
specifier analyzes requirements, generates detailed specs
    ↓
architect designs system architecture
    ↓
coder implements functional code
    ↓
cleaner cleans up code style
    ↓
hardener performs security and performance hardening
    ↓
QA conducts comprehensive testing and quality checks
    ↓
Outputs production-grade codebase
```

**Characteristics**:
- Six roles covering complete development lifecycle and quality assurance
- Includes security and performance hardening phases
- Suitable for large projects or high-reliability requirements

## 4. Mechanism Details

### 4.1 Worktree Isolation

**Git Worktree Basics**

Git Worktree allows multiple working directories for the same repository. SwarmForge uses this feature to create isolated working directories for each role:

```bash
# List current worktrees
git worktree list

# Create worktree for new role
git worktree add ../worktree-coder coder-branch
```

**Worktree Application in SwarmForge**

```
Main repository (main)
├── worktree-specifier/  (specifier's working directory)
├── worktree-coder/      (coder's working directory)
├── worktree-architect/  (architect's working directory)
└── ...
```

Each worktree corresponds to a different branch, ensuring:
- Agents can work without affecting the main branch
- Multiple branches can be worked on simultaneously
- Work can be integrated into the main branch via merge or PR

### 4.2 tmux Session Management

**tmux Session Structure**

SwarmForge uses tmux's hierarchical structure to organize Agent sessions:

```
tmux session: swarmforge
├── window: specifier
├── window: coder
├── window: refactorer
├── window: architect
├── window: cleaner
└── window: QA
```

**Window Management**
- Each Agent runs in an isolated window
- Switch windows anytime to observe Agent status
- Support for split-pane views of multiple Agent outputs

**Session Control**
```bash
# List all sessions
tmux list-sessions

# Attach to specific session
tmux attach -t swarmforge

# Switch between windows
Ctrl+b w  # List all windows
Ctrl+b n  # Next window
Ctrl+b p  # Previous window
```

### 4.3 Handoff Protocol

**Handoff File Structure**

A Handoff file is a structured text file containing:

```
=== HANDOFF ===
FROM: coder
TO: refactorer
TASK: Complete user authentication module
STATUS: in_progress

Completed:
- User login API
- Password encrypted storage
- JWT Token generation

In Progress:
- User registration API (80% complete)

Pending:
- Email verification feature
- Password reset feature

Context:
- Using Express framework
- Database: PostgreSQL
- API prefix: /api/v1/auth
===
```

**Handoff Flow**

```
Agent A works
    ↓
Agent A generates Handoff file
    ↓
Agent B reads Handoff file
    ↓
Agent B continues work
```

**Key Design Principles**
- **Atomicity**: Each Handoff contains complete task context
- **Traceability**: Records all completed and pending work
- **Independence**: Recipient can continue independently of sender

## 5. Constitution Structure

### 5.1 Constitution Entry: constitution.prompt

`constitution.prompt` is the entry point for the entire constitution system:

```
This is the SwarmForge team's constitution.

Team members must adhere to the following articles:
1. Engineering Standards (engineering.prompt)
2. Handoff Protocol (handoffs.prompt)
3. Workflow Rules (workflow.prompt)

Before executing any task, please read and understand the constitutional articles.
```

### 5.2 Engineering Standards: constitution/articles/engineering.prompt

Defines code quality and engineering standards:
- Code style guidelines
- Commit message format
- PR/MR creation standards
- Code review criteria

### 5.3 Handoff Protocol: constitution/articles/handoffs.prompt

Defines task transfer rules between Agents:
- Handoff file format
- State transition rules
- Error handling mechanisms

### 5.4 Workflow Rules: constitution/articles/workflow.prompt

Defines workflow execution rules:
- Role responsibility definitions
- Task assignment rules
- Completion criteria

### 5.5 Role Definitions: roles/

The `roles/` directory contains prompts for each role:

```
roles/
├── specifier.prompt      # Requirements Analyst
├── coder.prompt          # Programmer
├── cleaner.prompt         # Code Cleaner
├── architect.prompt       # Architect
├── hardener.prompt        # Security Hardening Expert
└── QA.prompt             # Quality Assurance Engineer
```

Each role prompt includes:
- Role responsibility description
- Collaboration methods with other roles
- Specific application of constitutional articles

## 6. Multi-Backend Support

### 6.1 Supported Backends

SwarmForge supports multiple AI backends:

| Backend | Description |
|---------|-------------|
| claude | Anthropic Claude |
| codex | OpenAI Codex |
| copilot | GitHub Copilot |
| grok | x.ai Grok |

### 6.2 Configuration Method

Specify backend in `swarmforge.conf`:

```ini
[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
api_key = ${ANTHROPIC_API_KEY}

[backend.codex]
model = gpt-4
api_key = ${OPENAI_API_KEY}
```

### 6.3 Backend Switching

Switch backends based on task type:

```bash
# Use claude backend
SWARM_BACKEND=claude ./swarm

# Use codex backend
SWARM_BACKEND=codex ./swarm
```

## 7. Usage Examples and Best Practices

### 7.1 Quick Start

**Select workflow and launch**:

```bash
# Use four-pack workflow
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1
./swarm
```

**Complete startup flow**:

```bash
# 1. Clone or download SwarmForge
BRANCH=four-pack
curl -L "https://github.com/unclebob/swarm-forge/archive/refs/heads/${BRANCH}.tar.gz" | tar -xz --strip-components=1

# 2. Configure AI backend
export ANTHROPIC_API_KEY="your-api-key"

# 3. Configuration file (optional)
# Edit swarmforge.conf to configure workflow and roles

# 4. Start swarm
./swarm
```

### 7.2 Project Configuration Example

Create configuration for a new project:

```ini
# swarmforge.conf
[project]
name = my-awesome-project
description = A project developed with SwarmForge

[workflow]
type = four-pack

[backend]
default = claude

[backend.claude]
model = claude-sonnet-4
max_tokens = 8192

[roles.specifier]
system_prompt = You are a requirements analyst focused on user-friendly design

[roles.coder]
system_prompt = You are a full-stack engineer proficient in TypeScript and Python
```

### 7.3 Best Practices

**1. Choose the Right Workflow**
- Use two-pack for simple tasks
- Use four-pack for medium complexity
- Use six-pack for large projects

**2. Leverage Real-Time Monitoring**
- Use `tmux attach` to connect to session
- Use `Ctrl+b w` to switch windows
- Observe each Agent's output in real-time

**3. Use Handoff Correctly**
- Ensure each Handoff contains sufficient context
- Clearly mark completed and pending work in Handoff files
- Update status promptly to avoid duplicate work

**4. Regularly Sync Code**
- Regularly merge Agent work into main branch
- Use PR/MR for code review
- Keep worktrees synchronized with main branch

**5. Customize Roles**
- Modify role prompts based on project needs
- Create new role definitions in `roles/` directory
- Ensure new roles adhere to constitutional articles

### 7.4 Troubleshooting

**Common Issues**:

1. **tmux session fails to start**
   - Check if tmux is installed: `tmux -V`
   - Check if session exists: `tmux list-sessions`

2. **AI backend connection fails**
   - Verify API key is correctly set
   - Check network connection
   - Validate backend configuration

3. **Handoff file not taking effect**
   - Check Handoff file path
   - Ensure file format is correct
   - Verify Agent correctly read the Handoff

## 8. Key Takeaways

### 8.1 SwarmForge's Advantages

1. **Lightweight Design**
   - Runs in local tmux environment
   - No complex cloud infrastructure needed
   - Extremely low resource consumption

2. **Configuration-Driven**
   - All workflows configurable
   - Easy to customize and extend
   - Aligns with "Configuration as Code" principle

3. **Isolated Collaboration**
   - Each role works independently
   - No mutual interference
   - Supports parallel work

4. **Structured Handoff**
   - Clear task transfer
   - Complete context preservation
   - Strong traceability

### 8.2 Use Cases

- **Small Teams**: Rapid prototype development
- **Individual Developers**: Improve development efficiency
- **Large Projects**: Decomposed collaboration for complex tasks
- **Learning and Experimentation**: Understanding multi-agent systems

### 8.3 Limitations

- **Local Execution Constraints**: Not suitable for remote collaboration scenarios
- **tmux Dependency**: Requires some tmux experience
- **AI Backend Constraints**: Requires valid API keys

### 8.4 Future Outlook

SwarmForge represents a new approach to multi-agent systems — lightweight, configuration-driven, local-first. As AI Agent technology matures, this simple yet effective orchestration approach may become increasingly popular.

## 9. References

- [SwarmForge GitHub Repository](https://github.com/unclebob/swarm-forge)
- [tmux Official Documentation](https://github.com/tmux/tmux)
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)

---

*This article is automatically analyzed and compiled by TopDigg. Follow us for the latest updates on AI Agents and developer tools.*
