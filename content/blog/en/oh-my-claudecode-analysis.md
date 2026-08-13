---
slug: oh-my-claudecode-analysis
title: "oh-my-claudecode: A Comprehensive Guide to Claude Code's Intelligent Multi-Agent Orchestration Framework"
description: "Comprehensive analysis of oh-my-claudecode (38.5k+ stars, MIT, TypeScript) — Claude Code's intelligent multi-agent orchestration framework. Core design philosophy: zero learning curve, multi-agent orchestration, intelligent routing, skill composition. Detailed coverage: 19 specialized agents, 3-tier model routing, 31 Skills, 5-stage Team Pipeline, Magic Keywords natural language triggering, installation tutorial, team collaboration mode, and best practices."
date: "2026-08-13"
author: "TopDigg"
tags: ["oh-my-claudecode", "Claude Code", "Multi-Agent", "Orchestration", "TypeScript", "AI Agents", "Developer Tools", "Skills", "Team Pipeline"]
categories: ["Deep Dive"]
keywords: ["oh-my-claudecode", "Claude Code Multi-Agent Orchestration", "Multi-Agent", "Orchestration System", "TypeScript", "AI Agent", "Developer Tools", "Skills System", "Team Pipeline", "Magic Keywords", "autopilot", "ralph", "ultrawork", "Team Collaboration", "Intelligent Routing"]
---

# oh-my-claudecode: A Comprehensive Guide to Claude Code's Intelligent Multi-Agent Orchestration Framework

> Core Philosophy: **Don't learn Claude Code. Just use OMC.** oh-my-claudecode (OMC) is a multi-agent orchestration layer running on top of Claude Code, enabling human engineers to drive an AI team using natural language through 19 specialized agents, 3-tier model routing, 31 Skills, and a 5-stage Team Pipeline. It doesn't replace Claude Code—it layers on top of it with zero learning curve and seamless integration with existing workflows. This is a complete guide from scratch covering project introduction, core design philosophy, installation and configuration, team collaboration modes, agent catalog, skills system, usage examples, and best practices.

## 1. Project Introduction and Overview

### 1.1 One-Sentence Description

**oh-my-claudecode (OMC) is a multi-agent orchestration system that runs on Claude Code, using Skills and specialized agents to replace manual configuration and prompt engineering.** The slogan is "Don't learn Claude Code. Just use OMC."—it transforms Claude Code from a single-agent tool requiring carefully crafted prompts into a development environment where you can drive multi-agent teams using natural language.

### 1.2 Project Metadata

| Field | Value |
|-------|-------|
| GitHub | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) |
| Stars | 38,500+ (continuously growing) |
| Forks | 3,400+ |
| License | MIT |
| Language | TypeScript |
| Latest Version | 4.15.7+ |
| npm Package | `oh-my-claude-sisyphus` |
| Founder | Yeachan Heo ([@Yeachan-Heo](https://github.com/Yeachan-Heo)) |
| Website | https://yeachan-heo.github.io/oh-my-claudecode-website |
| Discord | https://discord.gg/jq6jnSGABY |

### 1.3 Core Value Proposition

OMC's core value can be summarized in three words:

- **Zero Learning Curve**: No need to memorize complex commands or syntax—just describe what you need in natural language
- **Multi-Agent Orchestration**: 19 specialized agents working together, covering the complete development lifecycle from exploration to verification
- **Intelligent Composition**: The Skills system lets you build functionality like assembling building blocks, enhanced on demand

### 1.4 Relationship with Claude Code

OMC is **not** a replacement for Claude Code—it's an enhancement layer:

```
┌─────────────────────────────────────────────┐
│  User (Natural Language)                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  OMC Orchestration Layer (Skills + Agents + Hooks) │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Claude Code (Underlying Execution Engine)  │
└─────────────────────────────────────────────┘
```

This means:
- All Claude Code features remain available
- OMC only provides orchestration capabilities when you need multi-agent collaboration
- No need to change your existing Claude Code usage habits

## 2. Core Design Philosophy

### 2.1 Zero Learning Curve Philosophy

OMC's most important design principle is **zero learning curve**. This is reflected in:

**Natural Language First**
- No special command syntax to learn
- Directly describe what you want in human language
- System automatically recognizes intent and triggers appropriate skills

**Progressive Complexity**
- Start with the simplest usage: `/team "task description"`
- Add complexity only when needed: specify models, choose skill combinations
- No forced commitment to mastering all features at once

**Seamless Existing Workflow Integration**
- No need to rebuild your development process
- OMC can be incrementally added to existing workflows
- Can always fall back to pure Claude Code at any time

### 2.2 Multi-Agent Orchestration Philosophy

**Specialized Division of Labor**
- Each agent does one thing, but does it extremely well
- 19 agents cover 4 lanes: Build/Analyze, Review, Domain Expert, Coordination
- Agents collaborate through well-defined interfaces

**Dynamic Routing**
- Automatically select appropriate models based on task complexity
- Simple tasks use haiku (fast and cheap)
- Complex tasks use opus (highest reasoning quality)
- Everything is automatic—no need for users to worry

**Team Collaboration Model**
- 5-stage pipeline ensures every task receives thorough consideration
- team-plan → team-prd → team-exec → team-verify → team-fix
- Each stage has clear inputs, outputs, and acceptance criteria

### 2.3 Intelligent Routing Philosophy

OMC's model routing follows a simple principle: **Use the most appropriate resource for each task**.

| Task Type | Recommended Model | Reason |
|-----------|------------------|--------|
| Codebase Exploration | haiku | Quickly scan large numbers of files |
| Requirements Analysis | opus | Requires deep reasoning and implicit constraint discovery |
| Code Implementation | sonnet | Balance of speed and quality |
| Security Review | sonnet | Requires sufficient reasoning capability |
| Architecture Design | opus | Complex trade-off analysis |
| Documentation Writing | haiku | Simple, straightforward tasks |

### 2.4 Skills Composition Philosophy

The Skills system is one of OMC's most powerful features. Its design philosophy is a **composable layered structure**:

```
┌─────────────────────────────────────────────┐
│  GUARANTEE LAYER (Optional)                │
│  Example: ralph — Cannot stop until verification is complete │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  ENHANCEMENT LAYER (0-N layers)           │
│  Example: ultrawork (parallel) | git-master (commits) │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  EXECUTION LAYER (Main Skills)              │
│  Example: default (build) | planner (planning) │
└─────────────────────────────────────────────┘
```

Advantages of this design:
- **On-demand composition**: Only load layers you need
- **Predictability**: Each layer has clear responsibilities, no confusion
- **Extensibility**: Can create custom Skills combinations

## 3. Installation and Configuration Tutorial

### 3.1 Environment Requirements

Before starting installation, ensure your environment meets these requirements:

| Requirement | Minimum Version | Recommended Version |
|-------------|-----------------|---------------------|
| Node.js | 18.0+ | 20.0+ |
| npm | 8.0+ | 10.0+ |
| Claude Code | Latest version | Latest version |
| Operating System | macOS/Linux/Windows (WSL) | macOS/Linux |

### 3.2 Installation Steps

**Method 1: npm Global Install (Recommended for Plugin Mode)**

```bash
# Install latest version
npm install -g oh-my-claude-sisyphus

# Verify installation
omc --version

# Run setup wizard
omc setup
```

**Method 2: Local Development Install**

```bash
# Clone repository
git clone https://github.com/Yeachan-Heo/oh-my-claudecode.git
cd oh-my-claudecode

# Install dependencies
npm install

# Link to global (development mode)
npm link

# Run setup
npm run setup
```

**Method 3: Docker Deployment**

```bash
# Build image
docker build -t oh-my-claudecode .

# Run container
docker run -it oh-my-claudecode omc --version
```

### 3.3 Configuration File

OMC's configuration file is located in the `~/.omc/` directory. Create or edit `~/.omc/config.json`:

```json
{
  "version": "4.15.7",
  "model": {
    "default": "sonnet",
    "routing": {
      "haiku": ["explore", "writer"],
      "sonnet": ["executor", "debugger", "test-engineer"],
      "opus": ["architect", "planner", "critic"]
    }
  },
  "skills": {
    "default": ["default"],
    "autoLoad": true
  },
  "team": {
    "pipeline": ["team-plan", "team-prd", "team-exec", "team-verify", "team-fix"]
  },
  "hooks": {
    "enabled": true,
    "events": ["onStart", "onError", "onComplete"]
  }
}
```

### 3.4 Claude Code Integration Setup

To enable seamless collaboration between OMC and Claude Code, configure the following:

**Enable OMC in Claude Code Configuration**

```bash
# Initialize OMC connection
omc init

# Activate skills in Claude Code
/claude-code:omc-setup
```

**Set Environment Variables**

```bash
# Add to ~/.bashrc or ~/.zshrc
export OMC_API_KEY="your-api-key"
export OMC_MODEL_PROVIDER="anthropic"  # or "openai", "google"
export OMC_DEFAULT_MODEL="claude-sonnet-4-20250514"
```

### 3.5 Verify Installation

After installation, run these commands to verify your setup:

```bash
# Check version
omc --version
# Output should be: omc v4.15.7

# Check Claude Code connection
omc doctor

# Run benchmark tests
./setup.sh
./quick_test.sh
```

If all checks pass, congratulations! OMC is successfully installed and configured.

## 4. Team Collaboration Mode (Team Pipeline) - Complete Guide

### 4.1 Team Mode Overview

Team mode is the recommended orchestration approach starting from OMC v4.1.7. It decomposes complex tasks into 5 stages, with each stage handled by dedicated agents, ensuring tasks receive comprehensive consideration and high-quality completion.

### 4.2 Five-Stage Pipeline Details

**Stage 1: team-plan (Planning Phase)**

Input: User's natural language requirements
Output: Structured task list and execution plan

Main Responsibilities:
- Analyze requirements, identify implicit constraints
- Decompose large tasks into executable subtasks
- Determine task dependencies and execution order
- Assess risks and resource requirements

Agents Used: `analyst` + `planner`

**Stage 2: team-prd (Product Requirements Phase)**

Input: Task list from planning phase
Output: Detailed PRD (Product Requirements Document)

Main Responsibilities:
- Write detailed specifications for each feature
- Define acceptance criteria and success conditions
- Identify edge cases and error handling requirements
- Coordinate stakeholder input

Agents Used: `writer` + `analyst`

**Stage 3: team-exec (Execution Phase)**

Input: PRD document
Output: Implemented code and initial tests

Main Responsibilities:
- Execute development tasks according to plan
- Write unit tests and integration tests
- Follow code standards and best practices
- Document any issues encountered

Agents Used: `executor` + `explore` + `debugger`

**Stage 4: team-verify (Verification Phase)**

Input: Implemented code
Output: Verification report and test results

Main Responsibilities:
- Run complete test suite
- Check code quality and coverage
- Verify features meet PRD requirements
- Identify any regression issues

Agents Used: `verifier` + `test-engineer`

**Stage 5: team-fix (Fix Phase)**

Input: Verification report
Output: Fixed code and final verification

Main Responsibilities:
- Fix issues found during verification phase
- Re-run verification to ensure all issues resolved
- Update relevant documentation
- Prepare for final commit

Agents Used: `executor` + `debugger` + `verifier`

### 4.3 Team Mode Usage Examples

**Basic Usage**

```bash
# Start Team mode in Claude Code
/team 3:executor "Implement a user authentication system"
```

This starts a team with 3 executor agents to complete the authentication system implementation.

**Specify Specific Agent Combinations**

```bash
# Start a team with specific roles
/team architect + 2:executor + qa-tester "Refactor order processing module"
```

**Team Mode Output Example**

```
[team-plan] Analyzing requirements, creating execution plan...
[team-plan] ✓ Identified 12 subtasks, 4 dependencies

[team-prd] Writing detailed specifications...
[team-prd] ✓ PRD generated, 5 acceptance criteria

[team-exec] Starting execution...
[team-exec] [1/5] Implementing user registration API...
[team-exec] [2/5] Implementing login API...
[team-exec] [3/5] Writing unit tests...
[team-exec] ✓ 4/5 tasks completed, 1 needs fixing

[team-verify] Running tests...
[team-verify] ⚠ Found 2 test failures

[team-fix] Fixing issues...
[team-fix] ✓ All tests passing

[team] Task complete! Final verification passed.
```

### 4.4 Comparison with Other Modes

| Mode | Applicable Scenario | Complexity | Team Size |
|------|-------------------|------------|-----------|
| Team | Coordinated tasks with shared task lists | Medium-High | 2-5 agents |
| Autopilot | End-to-end feature development | Low | Single agent led |
| Ultrawork | Bursty parallel fixes/refactoring | Medium | Multi-agent parallel |
| Ralph | Critical tasks that must complete fully | Medium | Single agent + verify loop |
| UltraQA | Quality gates requiring repeated verification | Medium | Dual agent loop |

## 5. Agent Catalog and Role Descriptions

### 5.1 Agent Overview

OMC provides 19 dedicated agents across 4 lanes. Each agent is invoked as `oh-my-claudecode:<agent-name>`.

### 5.2 Build/Analyze Lane

These agents cover the complete development lifecycle from exploration to verification:

| Agent | Default Model | Core Responsibilities |
|-------|--------------|---------------------|
| `explore` | haiku | Codebase discovery, file/symbol mapping |
| `analyst` | opus | Requirements analysis, implicit constraint discovery |
| `planner` | opus | Task ordering, execution plan creation |
| `architect` | opus | System design, interface definition, trade-off analysis |
| `debugger` | sonnet | Root cause analysis, build error fixing |
| `executor` | sonnet | Code implementation, refactoring |
| `verifier` | sonnet | Completion verification, test adequacy confirmation |
| `tracer` | sonnet | Evidence-driven causal tracing, competing hypothesis analysis |

**Typical Usage Scenarios**

```bash
# Explore codebase
/explore "Find all payment-related modules"

/analyst "Analyze implicit requirements for user authentication"

/planner "Create execution plan for new feature"

/architect "Design microservices architecture"

/debugger "Fix login failure issue"

/executor "Implement order return functionality"

/verifier "Verify test coverage for payment module"

/tracer "Trace root cause of memory leak"
```

### 5.3 Review Lane

These agents provide quality gate checks before handoff:

| Agent | Default Model | Core Responsibilities |
|-------|--------------|---------------------|
| `security-reviewer` | sonnet | Security vulnerabilities, trust boundaries, authn/authz review |
| `code-reviewer` | opus | Full code review, API contracts, backward compatibility |

**Typical Usage Scenarios**

```bash
# Security review
/security-reviewer "Review new API endpoints"

/code-reviewer "Review code changes for order module"
```

### 5.4 Domain Expert Lane

These agents provide on-demand domain expertise:

| Agent | Default Model | Core Responsibilities |
|-------|--------------|---------------------|
| `test-engineer` | sonnet | Testing strategy, coverage, flaky test prevention |
| `designer` | sonnet | UI/UX architecture, interaction design |
| `writer` | haiku | Documentation, migration guides |
| `qa-tester` | sonnet | Interactive CLI/service runtime verification via tmux |
| `scientist` | sonnet | Data analysis, statistical research |
| `git-master` | sonnet | Git operations, commits, rebasing, history management |
| `document-specialist` | sonnet | External documentation, API/SDK reference lookup |
| `code-simplifier` | opus | Code clarification, simplification, maintainability improvements |

**Typical Usage Scenarios**

```bash
# Test engineering
/test-engineer "Design test strategy for payment module"

/designer "Design UI components for checkout flow"

/writer "Write API documentation for user authentication"

/qa-tester "Run end-to-end tests to verify order flow"

/scientist "Analyze user behavior data"

/git-master "Create feature branch and commit code"

/document-specialist "Look up latest Stripe API documentation"

/code-simplifier "Simplify complex business logic in order service"
```

### 5.5 Coordination Lane

This agent provides high-level plan and design review:

| Agent | Default Model | Core Responsibilities |
|-------|--------------|---------------------|
| `critic` | opus | Gap analysis for plans/designs, multi-perspective review |

**Typical Usage Scenarios**

```bash
# Plan review
/critic "Review implementation plan for new feature"

/design-review "Review trade-offs in microservices splitting approach"
```

### 5.6 Combined Agent Usage

Multiple agents can be combined to complete complex tasks:

```bash
# Complete feature development workflow
/team architect + 2:executor + verifier "Implement real-time notification system"

/# Emergency fix workflow
/team debugger + verifier "Fix production payment issue"

/# Architecture refactoring
/team architect + code-reviewer + code-simplifier "Refactor monolith to microservices"
```

## 6. Skills System Deep Dive

### 6.1 What Are Skills

Skills are OMC's behavior injection mechanism. They modify how the orchestrator works, allowing you to enhance agent capabilities on demand. Each Skill is an independent behavior module that can be stacked on top of agents.

### 6.2 Core Concepts

**Execution Layer**
Main skill types defining the primary way tasks are executed:
- `default`: Standard build process
- `planner`: Planning-driven workflow
- `orchestrate`: Multi-agent coordination

**Enhancement Layer**
Optional enhancement features, can add 0-N:
- `ultrawork`: Maximum parallelism execution
- `git-master`: Git operation integration
- `frontend-ui-ux`: Frontend development enhancement

**Guarantee Layer**
Optional guarantee mechanisms:
- `ralph`: Persistent loop ensuring task completion

### 6.3 Common Skills Details

**autopilot**

Autonomous execution skill, suitable for end-to-end feature development.

Trigger Keywords: `autopilot`, `build me`, `I want a`

```bash
/autopilot "Build a blog system"
```

Characteristics:
- Single leading agent
- Minimal ceremony
- Automatically handles full flow from planning to verification

**ultrawork**

Maximum parallelism execution skill, suitable for bursty parallel tasks.

Trigger Keywords: `ultrawork`, `ulw`, `parallel`

```bash
/ultrawork "Fix all security vulnerabilities in parallel"
```

Characteristics:
- Multiple agents working simultaneously
- Maximum parallelism
- No sequential coordination like Team requires

**ralph**

Persistent loop skill ensuring complete task completion.

Trigger Keywords: `ralph`, `don't stop`, `must complete`

```bash
/ralph "Complete database migration, cannot stop halfway"
```

Characteristics:
- Won't exit until verifier confirms completion
- Won't silently skip partial tasks
- Suitable for critical tasks

**deep-interview**

Socratic deep interview skill for requirements clarification.

Trigger Keywords: `interview`, `deep interview`, `gather requirements`

```bash
/deep-interview "Collect detailed requirements for new feature"
```

Characteristics:
- Clarifies ambiguities through questioning
- Ambiguity gating ensures thorough understanding
- Ouroboros-inspired dialogue design

**ralplan**

Iterative consensus planning skill.

Trigger Keywords: `ralplan`, `consensus plan`

```bash
/ralplan "Develop project consensus plan"
```

Characteristics:
- RALPLAN-DR iterative method
- Multiple discussion rounds to reach consensus
- Decision process documentation

### 6.4 Magic Keywords

OMC provides Magic Keywords functionality that automatically triggers Skills through natural language:

| Keyword | Triggered Skill | Effect |
|---------|----------------|--------|
| `ralph` / `don't stop` / `must complete` | `$ralph` | Persistent loop, exits only after verifier confirms |
| `autopilot` / `build me` / `I want a` | `$autopilot` | Autonomous execution pipeline |
| `ultrawork` / `ulw` / `parallel` | `$ultrawork` | Maximum parallel agent orchestration |
| `plan this` / `plan the` | `$plan` | Planning workflow |
| `interview` / `deep interview` / `gather requirements` | `$deep-interview` | Socratic deep interview |
| `ralplan` / `consensus plan` | `$ralplan` | RALPLAN-DR iterative consensus planning |
| `ecomode` / `eco` / `budget` | `$ecomode` | Token-efficient mode |
| `cancel` / `stop` / `abort` | `$cancel` | Cancel active mode |

### 6.5 Custom Skills Combinations

You can create custom Skills in the `~/.omc/skills/` directory:

```bash
# Create custom Skill
mkdir -p ~/.omc/skills/my-custom-skill
cd ~/.omc/skills/my-custom-skill

# Create SKILL.md
cat > SKILL.md << 'EOF'
# My Custom Skill

## Description
This is a custom skill

## Trigger Condition
Triggers when user says "my task"

## Execution Flow
1. Step one
2. Step two
3. Step three
EOF
```

## 7. Key Insights Summary

### 7.1 OMC's Core Values

1. **Lower Barrier**: No need to learn complex prompt engineering—just use natural language to drive complex multi-agent workflows
2. **Specialized Division of Labor**: 19 specialized agents each handle their responsibilities, ensuring every task is processed by the most appropriate agent
3. **Intelligent Resource Allocation**: Automatically select models based on task complexity, optimizing cost and efficiency
4. **Composability**: The Skills system lets you build workflows like assembling building blocks
5. **Team Collaboration**: Team Pipeline provides a complete framework for team collaboration

### 7.2 Applicable Scenarios

**Strongly Recommended OMC Scenarios**

- Complex multi-file refactoring projects
- Large features requiring multiple domain collaborations
- Production-grade code development with high quality requirements
- Bug fixing processes requiring repeated verification and fixes
- Systematic refinement after rapid prototype development

**Scenarios Where OMC May Not Be Needed**

- Simple single-file modifications
- Quick temporary script writing
- Tasks requiring only simple find-and-replace
- Incremental changes with already mature CI/CD processes

### 7.3 Best Practice Recommendations

1. **Start Simple**: Use the `/team` command for medium-complexity tasks first, then try more advanced combinations after getting familiar
2. **Choose Appropriate Mode**: Select the right orchestration mode based on task type (Team, Autopilot, Ultrawork, etc.)
3. **Leverage Magic Keywords**: Use natural language triggering to reduce command memorization burden
4. **Value the Verification Stage**: Don't skip the team-verify stage—quality gates are important guarantees for code delivery
5. **Continuous Learning**: Follow OMC updates and new features to continuously optimize your workflow

### 7.4 Limitations Awareness

OMC is not a silver bullet. Be aware of its limitations:

- For very simple, straightforward tasks, OMC's overhead may exceed its benefits
- Multi-agent collaboration increases system complexity, making debugging correspondingly harder
- Team collaboration mode requires some task decomposition ability
- Intelligent routing, while smart, is not perfect—manual intervention may be needed occasionally

## 8. Usage Examples and Best Practices

### 8.1 Daily Development Scenarios

**Scenario 1: Implementing New Features**

```bash
# Use Team mode for complete feature implementation
/team architect + 2:executor + verifier "Implement product review feature"
```

Execution flow:
1. architect analyzes architectural requirements
2. executor implements API and frontend components in parallel
3. verifier validates test coverage

**Scenario 2: Bug Fixing**

```bash
# Use ralph to ensure complete fix
/ralph "Fix user session loss after login"
```

Execution flow:
1. debugger analyzes root cause
2. Implement fix
3. verifier confirms issue resolved
4. Only exits after verification passes

**Scenario 3: Code Refactoring**

```bash
# Use ultrawork for parallel refactoring
/ultrawork "Refactor all service layer synchronous calls to async in parallel"
```

Execution flow:
- Multiple executors handle different modules simultaneously
- Maximum parallelism speeds up refactoring

### 8.2 Advanced Usage Tips

**Tip 1: Custom Team Composition**

```bash
# Specify specific numbers and types of agents
/team 2:architect + 3:executor + 2:verifier + security-reviewer "Refactor entire backend architecture"
```

**Tip 2: Use ecomode for Cost Optimization**

```bash
# Enable token-efficient mode
/ecomode /team "Develop internal tools"
```

Use haiku for more tasks when budget is limited.

**Tip 3: Deep Requirements Interview**

```bash
# Conduct deep requirements clarification before starting implementation
/deep-interview "Collect complete requirements for e-commerce platform"
```

Ensure thorough understanding before starting to avoid rework.

### 8.3 Performance Optimization Tips

**Optimization 1: Choose Models Wisely**

```json
// Set agent-to-model mapping in configuration
{
  "model": {
    "routing": {
      "haiku": ["explore", "writer", "document-specialist"],
      "sonnet": ["executor", "debugger", "test-engineer", "verifier"],
      "opus": ["architect", "planner", "critic", "analyst"]
    }
  }
}
```

**Optimization 2: Parallel Task Composition**

```bash
# Execute independent tasks in parallel
/ultrawork "Run in parallel: code review + security scan + performance test"
```

**Optimization 3: Incremental Workflow**

```bash
# Execute in stages, verify after each stage
/team "Implement user module"
# Continue after verification passes
/team "Implement order module"
```

### 8.4 Troubleshooting

**Problem: Team Mode Execution Takes Too Long**

Solutions:
- Check for circular dependencies
- Reduce number of parallel agents
- Use ultrawork instead of Team (if sequential coordination isn't needed)

**Problem: Verification Stage Repeatedly Fails**

Solutions:
- Use ralph mode for deep fixing
- Check for unresolved dependencies
- Consider decomposing tasks into smaller units

**Problem: Model Response Quality Declines**

Solutions:
- Switch to higher-tier model (sonnet → opus)
- Simplify prompts
- Check if context length exceeds limits

## Conclusion

oh-my-claudecode represents a new paradigm in AI-assisted development. It's not about replacing Claude Code, but enhancing it—transforming a single tool into an AI team that can work together. Through specialized agent division of labor, intelligent model routing, and flexible composable Skills system, OMC makes complex software development more manageable and efficient.

Whether you're an independent developer or a team lead, OMC has value worth exploring. Start today by introducing OMC in your next project and experience the feeling of driving an AI team with natural language.

**Remember: Don't learn Claude Code. Just use OMC.**

---

*This article was written based on oh-my-claudecode v4.15.7. For updates, please refer to the official documentation.*
