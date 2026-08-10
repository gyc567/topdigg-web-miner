---
title: "FDE Guide Deep Dive: Engineering Value Before Autonomy — A Production-Grade Delivery Methodology for FDEs and AI Engineers (Project Overview + 7-Stage Delivery Loop + 12-Factor Value Engineering Tutorial + Design Philosophy)"
description: "Using davidahmann/fde-guide (open-source GitHub project, Apache-2.0, by David Ahmann) as the blueprint, this is a complete analysis of the 'forward-deployed engineer (FDE) and applied-AI delivery' methodology. Core idea in one sentence: **Tokens are an input. Autonomy is a design choice. The accepted outcome is the product.** The project offers three layers of depth: ① The Guide (a 20-minute mental model: the FDE's four responsibilities = Discovery/Product/Engineering/Operation; one 7-stage delivery loop running throughout = Observe → Charter → Select Mechanism → Build a Controlled Slice → Prove → Launch and Transfer Ownership → Operate, Learn, or Retire); ② The Handbook (lifecycle playbooks + 12-factor AI value engineering: a ledger of 'cost per accepted outcome' and 'realized net value,' with 4 hard gates = owned outcome / credible independent verifier / bounded authority and expected loss / plausible positive value case after full cost, remaining factors scored 0/1/2, where scoring supports conversation but strong factors cannot average away a failed gate); ③ The Engineering Kit (executable assets: the controlled-write reference system invoice-exception — 'the model proposes, trusted software authorizes and commits, a source-of-truth readback proves the result' — including authority policies, tool contracts, a threat model, regression tests, and release evidence; the hybrid system shipment-risk-triage — classic ML scoring + deterministic routing + optional model explanations + human review — proving AI systems need not be agent-first). Design philosophy: AI has an 'accounting problem' — teams measure tokens, calls, and agent counts rather than changed outcomes; observe real work before designing systems (don't automate the process in a slide deck); 'use AI' is not an architecture decision — decompose by decision and use the smallest sufficient mechanism; capability does not grant authority — the model can only ever propose; value engineering (valuemaxxing) is not about maximizing automation but about maximizing the durable net value obtainable from a verifiable, operable, stoppable system. The article contains: project overview, core ideas, a factor-by-factor tutorial of the 7-stage delivery loop and the 12 factors, architecture breakdowns of two executable examples, five design-philosophy positions, and a 10-point summary of takeaways."
date: "2026-08-10"
author: "TopDigg Research Team"
tags: ["FDE", "Forward Deployed Engineering", "AI Value Engineering", "Production AI", "AI Agent", "Value Engineering", "12 Factors", "Accepted Outcome", "Frugal Architecture", "Intelligence Selection", "Agent Architecture", "LLM", "David Ahmann"]
categories: ["Deep Dive"]
keywords: ["FDE", "Forward-Deployed Engineer", "AI Value Engineering", "Accepted Outcome", "Production AI", "Smallest Sufficient Mechanism", "12 Factors", "Verifier", "Authority Boundary", "Source-of-Truth Readback", "Controlled Write", "Design Philosophy", "David Ahmann"]
---

# FDE Guide Deep Dive: Engineering Value Before Autonomy — A Production-Grade Delivery Methodology for FDEs and AI Engineers

> Core idea: **Tokens are an input. Autonomy is a design choice. Accepted outcomes are the product.** davidahmann/fde-guide is an independent open-source guide and engineering kit maintained by the author David Ahmann (cloud, data, and AI platform leader, former Field CTO), with a single goal: **turn a real customer or internal workflow into a measurable, operable AI service.** Its first principle is "engineering value before autonomy" — starting from a model or agent topology is wrong; you start from **the work itself and its accepted outcome.** Production-grade AI systems can't just produce plausible-sounding answers; they must know: who has the authority to act, which piece of information is current, how failures are bounded, how completion is verified, how much the whole service costs, and who can operate it or call it off. Agents are just one component option; for every critical decision, compare deterministic software, optimization, classic ML, retrieval, foundation-model calls, bounded agent workflows, and human review, and choose the **smallest sufficient mechanism** — keeping its evidence, authority, cost, fallback, and retirement paths. The project's "12 Factors of AI Value Engineering" turns this principle into explicit gates on value, verifier, adoption, authority, cost, proof, and lifecycle.

---

## 1. Project Overview

### 1.1 What Is It?

This article analyzes the **GitHub open-source repository `davidahmann/fde-guide`** — subtitled *"Value engineering and production architecture for FDEs, applied-AI engineers, product teams, and operators"*. It positions itself as "an independent open-source guide and engineering kit" for **turning real customer or internal workflows into measurable, operable AI services**.

It is not yet another agent framework, but a composite of **engineering method + executable evidence**: the method (The Guide) teaches you how to think, the handbook (The Handbook) supports your judgment, and the engineering kit (The Engineering Kit) makes claims, authority, behavior, and changes inspectable and testable. The three are three depths of one method, not three separate frameworks.

**Three depths, use as needed:**

| Layer | When to use | Entry point |
|------|---------|------|
| **The Guide** | Want the mental model, core principles, and the complete delivery loop, ~20 minutes | `guide/README.md` |
| **The Handbook** | Evaluating, designing, delivering, transferring, or operating a real workflow | `playbooks/` lifecycle playbooks + `library/00-start-here.md` |
| **The Engineering Kit** | Need implementation artifacts, architectures, machine-readable contracts, release controls, executable examples, or tests | `examples/`, `blueprints/`, `templates/`, `controls/`, `schemas/`, `operations/`, `tests/` |

### 1.2 Key Facts and Information

- Repository: `https://github.com/davidahmann/fde-guide` (Apache-2.0 license, 21 stars / 2 forks, 17 commits, includes `CITATION.cff` citation metadata)
- Author: **David Ahmann** — cloud, data, and AI platform leader with Field CTO experience; an independent project, not representing endorsement by any current or former employer
- Positioning: requires no specific model, cloud, or agent framework; not a substitute for deployable runtime, certification, or target-organization review
- Governance assets: `AGENTS.md` (repository working contract), `catalog.json` (governed artifact registry), `llms.txt` (compact machine navigation index)
- Executable baseline: Node.js 22+, `npm ci --ignore-scripts && npm run test:reference && npm run test:evals && npm run test:hybrid`
- Two teaching systems: **controlled write** example (invoice-exception, invoice exception resolution) + **hybrid system** example (shipment-risk-triage, shipment risk triage)
- Ten optional agent skills: `$qualify-ai-workflow`, `$engineer-ai-value`, `$select-ai-mechanism`, `$design-production-ai-system`, `$build-ai-evaluation`, `$secure-ai-action-boundary`, `$review-ai-production-readiness`, `$operate-ai-service`, `$transfer-ai-service`, `$productize-field-learning` (instructions only — grant no tools/credentials/permissions/approvals/evidence)
- Business-flow compositions: exception-to-resolution, signal-to-investigation, risk-to-prioritized-action, request-to-activation; vertical profiles include healthcare access coordination, financial services investigations, industrial operations response

### 1.3 What Problem Does It Solve?

The article opens by naming the core pain point: **AI has an accounting problem.** Teams measure tokens, model calls, generated code, deployed agents, and "claimed hours saved" — these metrics describe the production and consumption of intelligence, **but don't establish that anything valuable happened.** Organizations ultimately pay for changed outcomes: an invoice exception is resolved and confirmed in the ledger; a shipment case reaches the right coordinator before it impacts service; a release reaches production, passes checks, and stays healthy.

An **accepted outcome** is a unit of work that is complete and accepted as correct by an independent verifier, an authoritative system, or an accountable reviewer. AI value engineering connects that outcome to eligible requirements, adoption, attribution, full cost, and risk.

The problem it solves is therefore: **how do you turn "AI activity" into "accepted outcomes"? How do you ensure the delivered system is not a demo, not a prompt, not a model call, not an agent, not a dashboard, but an owned change to real work** — with an accepted outcome, a credible verifier, bounded authority, a full-cost value case, an operating team, and a retirement path.

---

## 2. Core Ideas

### 2.1 The One-Line Worldview

> **"Tokens are an input. Autonomy is a design choice. Accepted outcomes are the product."**

This is the project's motto and the line that separates it from most "agent hype" content: **maximizing intelligence, tokens, automation, or autonomy is not the goal — the goal is improving an owned outcome within accepted cost and risk ceilings.**

### 2.2 Engineering Value Before Autonomy

> **"Start with the work and the accepted outcome—not with a model or agent topology."**

The seven questions a production-grade AI system must answer: who can act, which information is current, how failure is bounded, how completion is verified, how much the whole service costs, who can operate it, and who can call it off. An agent is a component option; for every critical decision, compare 7 mechanisms (deterministic software / optimization / classic ML / retrieval / foundation-model calls / bounded agent workflows / human review), choose the smallest sufficient mechanism, and keep its evidence, authority, cost, fallback, and retirement paths.

### 2.3 The FDE's Four Responsibilities and the "Owned Change" Output

A forward-deployed engineer (FDE) turns **vague operational problems** into **supported software services that produce measurable outcomes**. The work spans four responsibilities:

1. **Discovery**: understand where the work, judgment, latency, risk, and value actually happen.
2. **Product**: decide what users should change and what should stay human, local, or manual.
3. **Engineering**: build the smallest reliable system that improves the workflow.
4. **Operation**: prove outcomes, transfer ownership, support the service, learn from production.

**The output is not a demo, a prompt, a model call, an agent, or a dashboard** — it is an **owned change to real work**: with an accepted outcome, a credible verifier, bounded authority, a full-cost value case, an operating team, and a retirement path. The same method applies inside a company — applied-AI engineers, even without the FDE title, must connect business context, product judgment, software architecture, adoption, and production operations.

### 2.4 One Delivery Loop Throughout

The entire repository follows a single lifecycle (7 stages) rather than creating parallel methods per customer, model, or framework:

```
Observe work → Charter value and scope → Select mechanisms → Build a controlled slice → Prove with cases and users → Launch and transfer ownership → Operate, learn, or retire → (back to Charter)
```

Each stage ends with a **decision + evidence that others can inspect**. Stopping, narrowing, or redesigning weak work is a valid outcome — a pretty model score, a sponsor, a renewal, a launch, or usage numbers **cannot average away failed value, authority, safety, ownership, or production gates**.

---

## 3. Detailed Tutorial: The 7-Stage Delivery Loop + 12-Factor Value Engineering

### 3.1 Stage 1: Observe the Work Before Designing the System (Observe)

**Context extraction is not collecting all documentation; it's discovering the minimum operational truth needed to make key design decisions.** Observe real cases with the people who perform, receive, review, and support the work, and record:

1. Triggers and work interfaces;
2. The decisions being made;
3. Inputs and their authoritative sources;
4. Allowed actions and the maximum tolerable impact;
5. Normal paths, exceptions, workarounds, and recovery;
6. Who owns the business outcome;
7. Which person or system can independently accept the outcome;
8. The team that will operate the changed workflow.

**Interviews produce hypotheses; operator walkthroughs, source artifacts, system traces, and reconciliation records produce stronger evidence.** If the workflow is only clear in a slide deck, discovery is not done.

Warning: **don't automate a workaround before asking whether the workflow, policy, source system, or handoff should be fixed.** AI can make a broken process run faster while making the underlying problem harder to see.

### 3.2 Stage 2: Engineer the Value Contract (Charter) — The Seven Fields That Make a Use Case Buildable

A use case is buildable when its outcome **can be owned, measured, and challenged**. Define these fields before architecture:

- **Eligible population**: which work may legitimately use the system, including exclusions.
- **Baseline**: current performance, status, dates, population, and confidence.
- **Accepted outcome**: the event where the work is independently accepted — not that the model "generated" or "completed" it.
- **Verifier**: the person, rule, reconciliation, or source-of-truth event that establishes acceptance.
- **Target and guardrails**: the expected change, and what must never get worse.
- **Attribution**: how the team distinguishes system effects from other changes.
- **Full cost**: discovery, delivery, change, model, infrastructure, tooling, human review, support, incidents, recovery, and maintenance.
- **Residual loss**: expected or realized harm not included in other benefit or cost items.
- **Owner**: the role accountable for the metrics and the decisions they drive.

Useful operating units:

```text
Cost per accepted outcome =
  total operating and amortized lifecycle costs
  / number of independently accepted outcomes
```

```text
Realized net value =
  attributable value of accepted outcomes
  + non-overlapping avoided losses
  − lifecycle costs
  − residual losses not netted elsewhere
```

**Separate forecasts, proven pilot evidence, and realized production value.** Don't annualize a narrow pilot without an explicit, owned extrapolation. Don't double-count the same benefit through time saved, unit value, avoided loss, or headcount reduction.

### 3.3 Stage 3: Select the Smallest Sufficient Mechanism (Select)

**"Use AI" is not an architecture decision.** Decompose the workflow into key decision steps and select a mechanism for each step individually:

| Mechanism | Good for | Warning signs |
|------|------|---------|
| **Deterministic software** | Stable rules, transformations, validation, routing, authorization | Natural-language ambiguity hidden in brittle if-else branches |
| **Optimization algorithms** | Allocation, scheduling, sorting, planning (with explicit objectives and constraints) | Objectives or constraints cannot be owned or measured |
| **Classic ML** | Repeated prediction (with labels, calibrated uncertainty, drift monitoring) | No representative outcomes or feedback path exists |
| **Retrieval** | Evidence must be looked up across governed sources | Retrieval output is allowed to become policy or authority |
| **Foundation-model calls** | Bounded interpretation, extraction, classification, or drafting | Fluent output is treated as verified fact |
| **Bounded agent workflows** | Multi-step judgment genuinely depends on changing evidence or tool use | Steps are known and plain workflow code would be simpler |
| **Human review** | Judgment is weakly verifiable, high risk, or policy requires accountability | Review is used to mask an unusable system or unbounded workload |

A production system can combine multiple mechanisms. Keep every path observable, testable, replaceable, and costable. **Model paths do not weaken identity, authorization, data, release, or ordinary software engineering controls.** Add agents only when bounded multi-step judgment is genuinely useful; add multiple agents only when the **real difference** in permissions, tools, context, ownership, or latency justifies the coordination cost.

### 3.4 Stage 4: Build a Controlled Vertical Slice (Build)

The first slice should cut through **real interfaces and control boundaries** without attempting the full product. It should demonstrate:

- A representative trigger point and user;
- Authoritative context with real permission behavior;
- The selected decision path;
- The final operator work surface;
- Simulated, staged, reversible, or otherwise bounded impact;
- Explicit failure and escalation states;
- Telemetry, cost, and acceptance evidence;
- An owned recovery or rollback path.

**Start adoption and transfer during the pilot.** The receiving team should pair on evaluation, release, support, policy changes, incidents, rollback, and retirement before the delivery team exits.

**Pre-declare the pilot's maximum duration, evidence cutoff, and independent graduation gates (technical / operator / adoption / value / economics / production readiness).** A demo should not quietly become production just because it impressed a sponsor.

### 3.5 Stage 5: Prove Claims on Representative Work (Prove)

**Evaluation is a "release claim under stated conditions," not a permanent score.** Use representative normal cases, hard slices, known exceptions, adversarial inputs, dependency failures, policy changes, timeouts, retries, cancellations, recovery, and human review capacity. **Keep the full environment and behavior versions needed to replay results.**

Separate three questions:

1. **Capability**: can the mechanism perform the task?
2. **Behavior**: does the whole system take the right path and stop safely?
3. **Outcome**: does the workflow improve accepted outcomes for the target population within guardrails?

Deterministic checks are strongest for closed invariants; statistical metrics need denominators and uncertainty; model judges need calibrated rubrics and human comparison; production feedback must not silently pollute the holdout set, and candidate models must not control their own evaluators. Promote through bounded stages such as **offline evaluation → shadow operation → canary → named production segment**; **define the rollback before going live**.

### 3.6 Stage 6: Operate the Service and Transfer Ownership (Launch + Operate)

**Production is a recurring decision, not the last deployment step.** Monitor the whole system: accepted outcomes, value, adoption, and guardrails; sources, permissions, freshness, and reconciliation; versions of paths, models, prompts, tools, and policies; latency, cost, retries, steps, and termination reasons; rejected/blocked/duplicate/effect-unknown/readback-mismatch events; reviewer load, corrections, abandonment, training, and support; owner continuity, incident readiness, rollback, and retirement capability.

**Transfer is complete only when the receiving team can operate, change, recover, support, and retire the service without the delivery team's heroics. Documentation alone doesn't prove operational capability — drills do.**

### 3.7 Stage 7: Turn Field Learning Into Product Capability (Field Learning)

The compounding advantage of FDE work is not reusable customer data or piled-up custom code, but the ability to **separate local context from portable engineering knowledge**. Keep customer/business-unit specific by default: policies, thresholds, identities, permissions, sensitive data, source details, and operational decisions. Reusable candidates include: contract shapes, failure categories, evaluation methods, work-surface patterns, integration primitives, controls, runbooks, and platform gaps.

**Productize only when evidence shows repeated occurrence across independent environments, the candidate has been sanitized, a destination and owner exist, target-specific validation succeeds, and it goes through the normal release path.** Classify first (customer configuration / target-owned extension / shared product or platform capability / time-boxed experiment / forbidden or deferred), then implement. **Don't create dependencies; keep negative and stop evidence; keep an exit path.**

### 3.8 Tutorial Core: The 12 Factors of AI Value Engineering (Valuemaxxing)

This is the project's "ledger" framework — converting AI activity into accepted outcomes:

| # | Factor | One-line point |
|---|------|-----------|
| 1 | **Observe real work** | Don't automate the process in a slide deck; a workaround is not automatically domain expertise (`FDE-002`) |
| 2 | **Own the outcome** | Define the operational outcome before choosing technology; "generating a reply" is an output, "resolving the exception and confirming the corrected balance in the ledger" is an outcome (`FDE-001`, `VAL-001`) |
| 3 | **Define eligible work** | Be explicit about which work qualifies and which doesn't; declare the denominator before computing adoption rates; "a system that handles most simple cases" may be worth less than "a system that handles a few expensive cases" (`VAL-001`) |
| 4 | **Establish the counterfactual** | Measure the current workflow before claiming improvement; a before/after chart is not automatically causal evidence — state known confounders and attribution-method limitations (`VAL-001`, `VAL-002`) |
| 5 | **Name the verifier** | The production system should not be the sole judge of whether it succeeded; the verifier must be able to veto the outcome; acceptance ≠ the agent reaching the end of the workflow (`FDE-001`, `EVA-001`, `REL-003`) |
| 6 | **Engineer the workflow and adoption** | Technical success with no users = zero value; if users must rebuild every outcome before trusting it, the work hasn't been automated (`FDE-003`, `ADP-001`, `ADP-002`) |
| 7 | **Use the smallest sufficient intelligence** | Don't decide up front that the problem needs an agent; decompose into decisions and compare each one; escalate hard cases instead of routing every decision through the strongest model (`ARC-004`, `ARC-005`) |
| 8 | **Bound authority and loss** | Capability does not grant authority; individually permitted actions can compose into unacceptable outcomes — review the full action path (`IAM-003`, `SEC-004`, `REL-001/003/005`) |
| 9 | **Price the entire service** | Tokens are only one cost; a cheaper model can make surrounding workflows more expensive; a technically correct outcome can still be economically unacceptable (`CST-001`, `CST-002`) |
| 10 | **Prove on representative work** | A successful demo proves the path is feasible, not that the system is launch-ready; pilots pre-declare maximum duration, evidence cutoff, decision owner, and independent graduation gates (`EVA-001/003`, `DEL-001`) |
| 11 | **Measure attributable realized value** | Eligible work → enters the workflow → completes the workflow → accepted outcome → measured business impact → sustained net value; report non-adoption, coverage, rework, reviewer load, incidents, recovery, and full cost (`VAL-002`, `OPS-004/006`, `CST-001`) |
| 12 | **Scale, constrain, or retire on evidence** | Autonomy and investment must earn the right to continue through forward outcomes; a stronger benchmark, a larger model, or higher usage numbers do not automatically prove more authority (`VAL-003`, `ADP-002`, `OPS-007`) |

**The four hard gates (non-negotiable, not averageable):**

1. An owned, measurable outcome
2. A credible independent verifier
3. Bounded authority and expected loss
4. A plausible positive value case after full cost

If any gate is missing, the correct decision may be `defer`, `redesign`, or `do_not_build`. Remaining factors are scored **0 — undefined / 1 — declared / 2 — proven**; scores support conversation, not certification, and strong factors cannot average away a failed gate.

**The value formula:**

```text
Expected net value =
  eligible volume × expected adoption rate × expected incremental accepted-outcome rate × value per accepted outcome
  − expected lifecycle costs
  − expected residual losses not netted against avoided losses or unit value
```

### 3.9 Tutorial Example 1: A Controlled-Write System (invoice-exception, Invoice Exception Resolution)

Demonstration goal: **the model proposes; trusted software authorizes and commits; a source-of-truth readback proves the result.** Target flow:

```text
Invoice exception event → gather ledger/vendor/policy evidence → propose a resolution → verify invariants
  → authorize and stage → approve the exact proposal summary → idempotently re-authorize and commit
  → reconcile any 'effect unknown' timeouts → read back ledger state → completion receipt | compensation + incident
```

Core mechanisms and invariants (this is what "controlled write" demonstrates):

- `resolution_commits(tenant_id, business_operation_id) <= 1` (idempotency: one business operation can only be committed once)
- The runtime release digest at commit time == the admitted solution release digest; the committed invoice revision == the current invoice revision; the committed proposal digest == the approved proposal digest; the policy revision == the current policy revision
- The caller tenant == the invoice tenant; every data/impact boundary checks the current caller scope and the current policy revision
- `committed == true` only after a source-of-truth readback; `effect_unknown` is reconciled before retry or completion
- `completed == true` only after verification of the trusted receipt and readback proof; steps, wall-clock time, and cost stay within the declared runtime budget; **`model_access(credentials) == false` (the model can never reach the credentials)**

Supporting artifacts: executable runtime `reference-loop.mjs`, authorization policy `authorization-policy.mjs`, typed tool contracts (read/stage/commit/readback), capability inventory and provenance records, threat model, evaluation cases (authorized commit / unauthorized write / duplicate retry / revision-drift retry / prompt injection), independent grader, evaluation report, and review-only solution release. Regression coverage: authorization, tenant isolation, stale policy, duplicate retry, approval timing, release revocation, receipt verification, effect-unknown recovery, and source-of-truth readback.

### 3.10 Tutorial Example 2: A Hybrid System (shipment-risk-triage, Shipment Risk Triage)

Proves that **AI systems need not be agent-first**: classic ML scoring → deterministic policy routing → optional model explanations → human retains the operational decision. Four mechanisms combine inside a bounded workflow, each component carrying an intelligence-selection record (`intelligence-selection.md`), evaluation cases, and regression tests. It is the executable companion to the "hybrid intelligence system blueprint."

### 3.11 The Eight Explicit Layers of System Design

The model is one component inside a larger software and operational boundary. Design these layers (corresponding to `design-production-ai-system`):

- **Domain and state**: objects, identity, revisions, lifecycle states, invariants, and source-of-truth systems
- **Context**: provenance, permissions, attribution, freshness, sufficiency, trust, and invalidation
- **Behavior**: code, rules, model paths, prompts, tools, guardrails, and compatibility
- **Authority**: caller or workload identity, tenant, scope, policies, approvals, and maximum impact
- **Capabilities**: typed inputs and outputs, exact destinations, credential patterns, failure contracts, duplicate safety, and readback
- **Runtime**: persistent state, cancellation, timeouts, resource budgets, retries, circuit breakers, and explicit termination states
- **Work surface**: persistent artifacts, evidence, status, uncertainty, alternatives, and permitted human actions
- **Operation**: traces, service objectives, alerting, runbooks, change paths, rollback, ownership, and retirement

**Core action rule**: the model may propose. Trusted software authorizes and commits. A source-of-truth readback proves the result. Secrets and credentials stay outside the model-visible context; re-check current identity, tenant, scope, policy, release admission, and approvals at the boundary that executes consequential effects; derive duplicate safety from a stable business-operation identity; after producing an effect, verify the result in the authoritative system before reporting completion.

### 3.12 Architecture Non-Negotiables and Anti-Patterns

**Non-negotiables:**

- When a model is used: the model proposes, and deterministic software verifies, authorizes, executes, persists, and validates consequential work (`ARC-002`)
- Every component has a named purpose, version, owner, authority ceiling, evidence, cost allocation, monitoring, rollback, and retirement path (`ARC-005`, `DEL-001`)
- Source-of-truth state, identity, approval, and completion proof live outside prompts and transient model context (`CTX-001`, `IAM-001`, `REL-003`)
- Release units bind data, domain, intelligence components, tools, policies, evaluations, user interfaces, and operations — not just code (`DEL-001`)
- A foundation model or agent is retained because it improves accepted outcomes under the required guardrails, not because it is novel or usable (`ARC-004`, `VAL-002`)

**Anti-patterns:** calling deterministic policy decisions "agent reasoning"; treating the model path as the architecture while state/access/impact/recovery stay implicit; adding an LLM to scheduling, allocation, verification, or classification problems without comparing simpler mechanisms; training or routing ML models without stable labels, error metrics, drift monitoring, or an owner; optimizing inference cost while ignoring tooling, review, recovery, and customer-support costs; treating an architecture diagram with no state transitions, trust boundaries, failure behavior, or release tests as complete.

---

## 4. Design Philosophy

### 4.1 "AI Has an Accounting Problem": From Activity Metrics to Outcome Metrics

The starting point of the design philosophy is a critique of the status quo: **teams measure tokens, calls, code, agents, and "claimed hours saved" — these only describe the production and consumption of intelligence, and establish no value occurring.** Organizations ultimately pay for changed outcomes. Hence "valuemaxxing" does not mean maximizing automation — it means **maximizing durable net value from a system a person can verify, operate, and stop.**

### 4.2 "Engineering Value Before Autonomy": The Model Is Not the Starting Point

The project's first principle runs against the mainstream industry narrative: **don't start from "which model" or "what agent topology"; start from the work and its accepted outcome.** An agent is a component option. For every critical decision, compare the 7 mechanisms (deterministic software / optimization / classic ML / retrieval / foundation models / bounded agents / human) one by one and choose the smallest sufficient mechanism. **"More AI" may mean the workflow was never properly decomposed.**

### 4.3 "Capability Does Not Grant Authority": Minimal-Trust Design

**The model can only ever propose.** Trusted software (deterministic code) is responsible for authorizing, executing, persisting, and validating consequential work. Authority is bound to the workflow, actor, tenant, purpose, task, objective, duration, and consequence; individually permitted actions can compose into unacceptable outcomes, so review the full action path. Source-of-truth state, identity, approval, and completion proof always live outside prompts and transient model context — **secrets and credentials the model can never reach (`model_access(credentials) == false`)**.

### 4.4 "The Verifier Must Be Able to Veto": A Production System Cannot Grade Itself

The evaluation triad separates capability/behavior/outcome; **the production system should not be the sole judge of whether it succeeded** — the verifier (a deterministic check, source-of-truth reconciliation, independent evaluation, downstream confirmation, or an accountable human reviewer) must be able to veto the outcome. "Acceptance" demands more than "the agent reached the end of the workflow." This philosophy is continuous with "don't let the agent self-verify," but escalates it into **a hard field of the value contract (the named verifier)**.

### 4.5 "Scores Support Conversation, Gates Are Not Averageable": Evidence Ethics

The separation between the 0/1/2 scoring framework and the 4 hard gates is the project's sharpest philosophical claim: **demos and composite scores cannot average away a failed gate; forecasts, proven pilots, and realized value must be kept apart; zero is evidence, not a default.** Stopping, narrowing, or redesigning weak work is a valid outcome — a strong model score, a sponsor, or launch numbers cannot mask failed value/authority/safety/ownership/production gates. **Evaluation is a "release claim under stated conditions," not a permanent score.**

### 4.6 "A Workaround Is Not Domain Expertise": Humility Toward the Field

Observe real work (not the process in a slide deck); classify every observed behavior as retain/fix/remove/escalate. **AI can make a broken process run faster while making the underlying problem harder to see.** The compounding advantage of field learning is the ability to separate local context from portable engineering knowledge; don't create dependencies, keep negative and stop evidence, and keep an exit path.

---

## 5. Evaluation Summary: Viewpoints and Conclusions

### 5.1 Core Viewpoints List

1. **Definition of value:** the accepted outcome (a unit of work accepted as correct by an independent verifier, authoritative system, or accountable reviewer) is the product; tokens and automation are only inputs and means.
2. **Starting point:** start from the work and its accepted outcome, not from a model or agent topology; an agent is a component option, not an architecture.
3. **Smallest sufficient mechanism:** compare across the 7 mechanisms for every critical decision and pick the smallest sufficient one; "use AI" is not an architecture decision; "more AI" may mean the workflow was never properly decomposed.
4. **Observation first:** observe real work (operator walkthroughs / source artifacts / system traces) before designing; interviews only produce hypotheses; don't automate the process in a slide deck, and don't automate a workaround before fixing it.
5. **Value-contract fields:** eligible population / baseline / accepted outcome / verifier / target guardrails / attribution / full cost / residual loss / owner — the nine fields come before architecture.
6. **12 factors + 4 hard gates:** owned outcome / credible independent verifier / bounded authority and expected loss / plausible positive value case after full cost; any missing → defer / redesign / do_not_build; 0/1/2 scoring supports conversation but cannot average gates.
7. **Authority boundaries:** capability does not grant authority; the model proposes, trusted software authorizes and commits, a source-of-truth readback proves; secrets and credentials always live outside model context; idempotency (one business operation, one commit) and effect-unknown reconciliation are hard invariants.
8. **Adoption and operation:** technical success with no users = zero value; transfer is complete only when the receiving team can operate/change/recover/support/retire (drills, not documentation); production is a recurring decision, not the last deployment step.
9. **Against agent-first:** the hybrid-system example proves deterministic policy + classic ML + human review can be the correct architecture; add agents only when bounded multi-step judgment is genuinely useful.
10. **Field learning:** the compounding advantage = separating local context from portable knowledge; productize only with cross-environment reproduction evidence + sanitization + destination owner + normal release path; don't create dependencies.

### 5.2 Key Quotes Worth Memorizing

- "Tokens are an input. Autonomy is a design choice. Accepted outcomes are the product."
- "Start with the work and the accepted outcome—not with a model or agent topology."
- "Capability does not grant authority."
- "The model may propose. Trusted software authorizes and commits. A source-of-truth readback proves the result."
- "AI has an accounting problem."
- "The system producing the work should not be the sole judge of whether it succeeded."
- "A workaround is not automatically domain expertise."
- "A more capable model will not repair an undefined task."
- "The point is not to use more AI. The point is to make the outcome worth the system required to produce it."

### 5.3 Connections to Other Deep Dives on This Site (Reader's Next Steps)

- **Graph Engineering Guide (2026)** (`graph-engineering-guide-2026-analysis`): graph engineering asks "when to weave agents into a graph"; fde-guide answers an earlier question — **decide first whether this workflow is worth turning into a system, how mechanisms are chosen, and how outcomes are accepted.** The two are complementary: the graph is a structural choice; the FDE Guide is the value-and-governance prerequisite.
- **The Art of Loop Engineering (LangChain official)** (`loop-engineering-langchain`): LangChain talks about "loop stacking" (agent/verification/event-driven/hill-climbing loops); fde-guide provides the matching **ledger and gates** — every loop layer must have an accepted outcome, a verifier, an authority boundary, and a full cost.
- **The Loop Engineering series** (`loop-engineering-*`): loops are the runtime shape; fde-guide stresses that "autonomy is a design choice" — loops, graphs, and agents are all mechanism options; choose the smallest sufficient one.

---

## References

- Project home: `https://github.com/davidahmann/fde-guide` (Apache-2.0, David Ahmann)
- The Guide: `guide/README.md` — FDE responsibilities, 7-stage delivery loop, value contract, mechanism-selection table, eight-layer system design, controlled slices, the evaluation triad, operational transfer, field learning
- The 12 Factors of AI Value Engineering: `library/14-twelve-factors-ai-value-engineering.md` — the 4 hard gates + 0/1/2 scoring + expected/realized net value formulas
- Software Architecture and Intelligence Selection: `library/12-software-architecture-and-intelligence-selection.md` — mechanism decision table, hybrid-system design, Beyond Twelve-Factor baseline, architecture non-negotiables and anti-patterns
- Controlled-write example: `examples/invoice-exception/README.md` — the model proposes / trusted software authorizes and commits / source-of-truth readback; the effect invariant list
- Hybrid-system example: `examples/shipment-risk-triage/` — classic ML + deterministic routing + optional model explanations + human review
- Governance assets: `AGENTS.md` (working contract), `catalog.json` (artifact registry), `llms.txt` (machine navigation index), `controls/control-catalog.json` (governed production requirements)
- Related reading (this site): *Graph Engineering Guide (2026) Deep Dive*, *The Art of Loop Engineering Deep Dive (LangChain official)*, *Loop Engineering series deep dives*
