---
title: "Gitar AI Deep Dive: Code Review That Actually Fixes Your Code"
date: "2026-08-21"
description: "Deep dive into Gitar AI code review tool: automatically fixes broken builds, failing tests, and code review feedback. Core idea: code review is not about leaving comments, it's about driving code fixes."
tags:
  - Gitar
  - AI Code Review
  - CI Failure Analysis
  - Pull Request
  - GitHub
  - GitLab
  - Repository Rules
  - Automation
categories:
  - Deep Dive
  - AI Dev Tools
  - Code Review
---

# Gitar AI Deep Dive: Code Review That Actually Fixes Your Code

> **Core Philosophy:** *"Code review is not about leaving comments — it's about driving code fixes."*
>
> Unlike traditional code review tools that merely leave comments, Gitar automatically analyzes CI failures, identifies root causes, and **pushes fixes directly to your pull request**. Built by the team that constructed Uber's internal development stack, Gitar joined SonarSource (the company behind SonarQube) in 2026, becoming part of the enterprise-grade code quality ecosystem.

## 1. Project Overview: The Next Evolution of Code Review

Gitar is an AI-powered code review tool built by former Uber engineers, positioned as **"the code review bot that actually fixes your code."**

The fundamental difference from traditional code review tools:

| Tool Type | Examples | What It Does | What It Doesn't Do |
|-----------|----------|--------------|---------------------|
| **Traditional Bot Review** | GitHub Actions, some AI review tools | Leaves comments | Fixes code |
| **Gitar** | Gitar | Leaves comments **+ pushes fixes directly** | Requires you to merge manually |

User testimonials say it best:

> "Gitar has been a big help in maintaining the OpenMetadata open-source repository. Its code reviews are consistently actionable and relevant, not generic bot feedback, and it has caught real bugs and security vulnerabilities that reviewers might have missed."
> — Sriharsha Chintalapani, Co-founder & CTO, Collate (OpenMetadata)

### Key Metrics

- **Scale:** 130+ engineering teams, 1,100+ code repositories (Altruist)
- **Integrations:** GitHub, GitLab, Buildkite, CircleCI, Bitrise, Harness
- **CI Failure Types Supported:** Build errors, test failures, lint errors, flaky tests
- **Team Background:** Uber developer platform team; joined SonarSource in 2026

### One-Line Positioning

**Gitar = AI Code Review + CI Failure Auto-Fix + Natural Language Rule Engine** — all three happen within the PR interface, with no need to switch to external tools.

## 2. Quick Start Tutorial: Up and Running in 5 Minutes

### 2.1 Requirements

- A GitHub or GitLab account with admin access to at least one organization
- An open pull request (or a repository where you can create one)
- 14-day free trial — no credit card required

### 2.2 Installation Steps

**Step 1: Log in to Gitar**

Visit [app.gitar.ai](https://app.gitar.ai) and sign in with your GitHub or GitLab account.

**Step 2: Connect Your Code Repository**

<Tabs>
  <Tab title="GitHub">
    Click Install to install the Gitar GitHub App on your organization. You can authorize all repositories or select specific ones.
    
    > 💡 You can modify repository permissions later in your GitHub organization settings under **Installed GitHub Apps**.
  </Tab>

  <Tab title="GitLab">
    GitLab integration uses a service account + service account token:
    
    1. Create a **service account** under your top-level GitLab group (Settings → Service accounts)
    2. Generate a service account token with these scopes: `api`, `read_api`, `read_user`, `read_repository`, `write_repository`
    3. Invite the service account to the target group with the **Owner** role
    4. Paste the token into the Gitar dashboard to complete the connection
  </Tab>
</Tabs>

**Step 3: Connect Integrations (Optional)**

Gitar can pull context from issue tracking and observability tools. You can connect Jira, Linear, and others at this step, or add them later in settings.

**Step 4: Watch Gitar in Action**

Once connected, Gitar runs an initial scan across your repositories. There are two ways to see it in action:

- **Open a new PR:** Create a pull request with some changes, and Gitar will automatically run on all connected repositories
- **Try it on existing PRs:** Find the "Try Gitar on Open PRs" card in your dashboard to trigger a review on existing pull requests

**Step 5: Review Gitar's Feedback**

Within minutes, Gitar posts a **dashboard comment** on your PR with an analysis overview.

Here's what happens next:

- **CI Failure** → Gitar analyzes the failure reason and posts a root cause analysis. If auto-apply is enabled, Gitar pushes the fix commit directly
- **Code Review** → Gitar posts inline review comments on the problematic lines of code and a summary in the dashboard comment
- **Comment Commands** → Reply to Gitar's comments in natural language to request changes

> ⚠️ **Important:** Gitar **never force-pushes** to your branch. All fixes are added as new commits, preserving the full code history.

## 3. Core Features in Detail

### 3.1 AI Code Review

Gitar automatically reviews pull requests on GitHub and GitLab, providing AI-driven feedback on security, bugs, performance, edge cases, and code quality.

**Review Dimensions Supported:**

| Dimension | Coverage |
|-----------|----------|
| **Security Analysis** | Vulnerabilities, unsafe patterns, input validation issues |
| **Bug Detection** | Logic errors, null pointer risks, edge cases |
| **Performance Analysis** | Algorithmic complexity, database queries, memory usage |
| **Code Quality** | Readability, maintainability, best practices |

**Review Output Channels:**

1. **Inline Review Comments** — Each unresolved finding is posted on the corresponding file and line, delivering feedback exactly where you're reading the code
2. **Dashboard Comment — Code Review Section** — A summary view showing the overall verdict, severity breakdown, and tracking of resolved findings

**Custom Code Review Instructions:**

You can customize the review process by adding markdown files under the `.gitar/review/` directory. Gitar supports the `@` syntax to include other files:

```
your-repo/
  .gitar/
    review/
      gotchas.md
    documents/
      rust_best_practices.md
```

Usage in `.gitar/review/gotchas.md`:
```markdown
@../documents/rust_best_practices.md
@shared/common_rules.md
```

### 3.2 CI Failure Analysis & Auto-Fix

This is Gitar's most valuable feature — **it doesn't just tell you why your CI failed; it fixes it.**

**Workflow:**

1. Gitar reads CI logs and identifies the failing step
2. Determines the root cause of the failure
3. Posts a detailed explanation on the PR's dashboard comment
4. Depending on the auto-apply setting, either waits for approval or pushes the fix directly

**Supported Failure Types:**

| Failure Type | Examples |
|--------------|----------|
| **Build Errors** | Compilation failures, missing imports, type errors |
| **Test Failures** | Broken assertions, missing setup, incorrect expected values |
| **Lint Errors** | Code style violations, formatting issues |
| **Flaky Tests** | Race conditions, timing issues, non-deterministic behavior |

**CI Retry (Automatic Retry of Unrelated Failures):**

Gitar can automatically retry CI jobs that are unrelated to the PR's changes — for example, flaky tests, transient infrastructure failures, or failures caused by the target branch. When any failing job in the pipeline is classified as unrelated to the PR, those jobs are re-run without manual intervention.

**Multi-Iteration Fixes:**

CI failures may not be resolvable in a single iteration. Gitar supports multi-round fixes:

1. Gitar pushes a fix for the original CI failure
2. CI re-runs on the updated branch
3. If CI fails again, Gitar re-analyzes the new failure
4. Gitar attempts another fix, taking into account the full history of previous attempts

This loop continues automatically until CI passes or Gitar determines that no further progress is possible.

### 3.3 Repository Rules: Natural Language Workflow Automation

Repository Rules lets you define automation workflows using plain markdown files — **no code required**.

**Quick Start:**

```bash
mkdir -p .gitar/rules
```

Create `.gitar/rules/security-review.md`:

```markdown
---
title: "Security Review"
description: "Require security team review for sensitive changes"
when: "PRs modifying authentication or encryption code"
actions: "Assign security team and add label"
---

# Security Review

When sensitive code is modified:
- Assign @security-team as reviewer
- Add "security-review" label
- Post comment with security checklist
```

**Rule Trigger Timing:**

- **When a PR is opened** — Full evaluation against all applicable rules
- **When a new commit is pushed to a PR** — Re-evaluation of checks, potentially triggering automations
- **When CI fails on a PR** — Triggers CI-related automations
- **When PR metadata is updated** — Title, description, reviewer, or label changes
- **When a PR is closed or merged** — Enables post-merge workflows

**Supported Actions:**

- **Post Comments:** Post comments or inline code reviews on a PR
- **Apply Labels:** Add or remove labels based on detected conditions
- **Assign Reviewers:** Assign specific reviewers when changes are detected
- **Suggest Code Changes:** Suggest or apply code modifications

**Integration Support:**

- **Jira:** Link PRs to Jira tickets and automatically update issue status
- **Linear:** Link PRs to Linear issues and automatically update status
- **Slack:** Send notifications to Slack channels
- **Custom MCP (Enterprise):** Connect your own MCP servers as custom integrations

### 3.4 Feedback & Interaction

Gitar provides rich interaction options:

| Interaction | What It Does |
|-------------|--------------|
| Reply `gitar fix` | Apply the suggested fix |
| One-click apply | Check the suggested fix box on GitHub, or use the checkmark emoji reaction on GitLab |
| Reply to a finding | Comment "this is intentional" or "already fixed" — Gitar processes the reply and closes the finding |
| Resolve/Unresolve | Resolve a finding thread on GitHub or GitLab to dismiss or re-activate the finding in real time |
| Ambiguous replies | If your reply is unclear, Gitar asks for clarification rather than guessing |

## 4. Architecture & Integrations

### 4.1 Supported Platforms

| Category | Supported Options |
|----------|-------------------|
| **Code Repositories** | GitHub, GitLab (including self-hosted) |
| **CI Systems** | Buildkite, CircleCI, Bitrise, Harness |
| **Integration Tools** | Jira, Linear, Slack |
| **SSO** | Enterprise-grade SSO configuration supported |
| **GPG Signing** | GPG key verification supported for commits signed by Gitar |

### 4.2 Deployment Model

Gitar deploys as a GitHub App / GitLab App. All interactions happen within the PR interface — no external dashboard required.

### 4.3 Security & Compliance

- SOC 2 certified
- ISO 27001 certified
- GDPR compliant
- Comprehensive code and data protection measures in place

## 5. Design Philosophy: Four Core Principles

### 5.1 Fix, Don't Just Find

The philosophy of traditional code review tools is **"find problems and tell the developer."** Gitar's philosophy is **"find problems and fix them."**

This sounds simple, but delivering on it requires:
- Understanding the root cause of CI failures (not just the surface-level error messages)
- Generating valid code fixes (not just suggestions)
- Verifying CI passes after the fix (not just pushing and walking away)
- Iterating multiple rounds until success (not just a single attempt)

This is a fundamentally different product shape — **Gitar is not an auditor; it's closer to the role of a junior engineer** who can both review code and make actual changes.

### 5.2 CI-Aware: Don't Look at Code in Isolation

Many AI code review tools **only look at code, not at CI**. This leads to a common problem: the review looks fine, but CI fails.

Gitar is designed to be **CI-Aware**:
- Code review and CI analysis are two features of the same product — not two separate tools
- When CI fails, Gitar analyzes and fixes it, not ignores it
- If a fix introduces a new CI failure, Gitar automatically retries

### 5.3 Zero Configuration to Start — No Workflow Changes Required

Gitar's default experience is **install and go**:

- No rules to configure before it works
- No branch strategy to change
- No new CLI tool to learn
- All interactions happen within the PR interface you're already using

This lowers the barrier to adoption — teams don't need to change any process to use Gitar.

### 5.4 Synergy with the SonarQube Ecosystem

Gitar joined SonarSource (the company behind SonarQube) in 2026. This means:

- Gitar handles **dynamic analysis** (real-time PR-level review and fixing)
- SonarQube handles **static analysis** (broader codebase-level quality checks)
- The two are complementary, together covering the full lifecycle of code quality

This is a smart positioning move — Gitar doesn't try to replace SonarQube. Instead, it fills the gap that SonarQube can't cover: real-time PR-level review and fixing.

## 6. Key Insights & Takeaways

### Insight 1: The "Last Mile" of AI Code Review Is Fixing

Current AI code review tools on the market (CodeRabbit, Copilot Reviews, some open-source bots) are all stuck at the stage of "find problems and tell the developer." The limitations of this stage:

- Developers still need to understand the problem themselves
- Developers still need to write the fix themselves
- Developers still need to run CI to verify themselves

Gitar's value proposition cuts directly to the **"last mile"**: it doesn't just tell you there's a problem — it fixes it and verifies the result. The time saved isn't just "finding the problem"; it's the entire "fix + verify" cycle.

### Insight 2: "Built at Uber" Is the Most Credible Endorsement

Gitar's founding team came from Uber's developer platform team. Uber is one of the largest and most engineering-complex tech companies in the world, and its development stack was stress-tested by tens of thousands of engineers across thousands of repositories.

This background means:
- Gitar wasn't designed from "ideal conditions" — it was designed from "real workflows of massive teams"
- Feature decisions lean toward "practical" over "impressive"
- The team has mature understanding of CI, code review, and large-scale codebase management

### Insight 3: Doing Everything Within the PR Interface Is the Right Product Decision

A common problem with developer tools is **context switching**: reviews on GitHub, CI details on the CI system, code changes in the IDE, issue tracking in Jira.

Gitar chooses to do everything within the PR interface, meaning:
- Developers don't need to remember another tool's URL
- Code review, CI analysis, and rule automation all happen in one place
- Context switching cost is zero

### Insight 4: Natural Language Workflows via Repository Rules Are the Right Direction

Traditional CI/CD configuration (GitHub Actions, GitLab CI) requires writing YAML files, understanding workflow syntax, and handling complex conditional logic.

Gitar's Repository Rules define workflows in **natural language**:
- Write "When PRs modifying authentication code" instead of YAML conditionals
- Write "Assign security team and add label" instead of YAML actions
- Rule files are just markdown — manageable with any text editor

This is the right approach. **Workflows should be human-readable, not machine-parseable configuration files.**

### Insight 5: Joining SonarSource Was Gitar's Best Exit

Gitar's choice to join SonarSource rather than go independent was a mature product decision:

- SonarQube has the largest code quality user base in the world
- Gitar can leverage Sonar's sales and distribution network to reach enterprise customers
- SonarQube lacks "PR real-time review and fix" capability — Gitar fills exactly that gap

For users, this means Gitar will have a longer product lifecycle and more stable enterprise support.

### Insight 6: Auto-Apply Requires Trust — But It's Worth Building

Gitar's auto-apply feature means the AI pushes commits directly to your branch. This requires teams to trust the AI's fix capabilities.

Building that trust requires:
- High accuracy of AI fixes (user feedback: "we haven't found a single invalid comment")
- All fixes are new commits, never force-pushed (full code history preserved)
- Multi-round iteration mechanism ensures fixes don't introduce new problems

Once trust is established, the efficiency gains from auto-apply are massive — developers no longer need to debug CI failures themselves, write fixes, push them, and wait for CI to rerun.

## 7. Relationship with SonarQube

A common question: what's the difference between Gitar and SonarQube? Are they in conflict?

| Dimension | Gitar | SonarQube |
|-----------|-------|-----------|
| **Analysis Timing** | On PR creation/update (real-time) | In CI/CD pipeline or scheduled scans |
| **Analysis Scope** | Incremental changes in the PR | Entire codebase |
| **Core Capability** | Review + **Fix** | Static analysis + quality gates |
| **Workflow** | Done within the PR interface | Independent web UI |
| **Fix Capability** | Automatically pushes fixes | Provides problem locations and suggestions |
| **Users** | Development teams | Development teams + security/compliance teams |

**They are complementary, not competitive:**

- Gitar handles real-time PR-level review and fixing
- SonarQube handles codebase-level static analysis and technical debt management

Following Gitar's addition to SonarSource, the two products will integrate more closely, providing complete code quality coverage from PR to codebase.

## 8. Technical Specifications

| Dimension | Specification |
|-----------|--------------|
| **Form Factor** | GitHub App / GitLab App |
| **Code Repositories** | GitHub, GitLab (including self-hosted) |
| **CI Integrations** | Buildkite, CircleCI, Bitrise, Harness |
| **Review Dimensions** | Security, bugs, performance, code quality |
| **CI Failure Types** | Build errors, test failures, lint errors, flaky tests |
| **Rule Engine** | Natural language `.gitar/rules/*.md` files |
| **Integration Tools** | Jira, Linear, Slack, MCP (Enterprise) |
| **Security & Compliance** | SOC 2, ISO 27001, GDPR |
| **Pricing** | Free 14-day trial; Pro (5 custom rules); Enterprise (unlimited rules) |
| **Team Background** | Uber developer platform team |
| **Corporate Ownership** | Joined SonarSource in 2026 |

## 9. Closing Thoughts

Gitar's greatest value isn't "yet another AI code review tool" — it's **redefining the role of code review.**

Traditional tools act as referees: find problems, notify the developer, don't touch anything themselves.

Gitar acts as a teammate: find problems, analyze root causes, fix them, verify the results.

The shift from referee to teammate is a microcosm of AI's escalating role in the development process. Gitar doesn't just tell you "there's a problem here" — it does the work for you. That's what AI programming tools should look like.

---

*Website: https://gitar.ai*
*Documentation: https://docs.gitar.ai*
*GitHub: https://github.com/gitarcode*
*Note: Gitar joined SonarSource in 2026, forming a complementary ecosystem with SonarQube*
