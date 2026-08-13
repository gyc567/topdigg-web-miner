---
title: "Spatiotemporal Composability: A Programming Paradigm Redefining Dynamic Software Architecture"
date: "2026-08-13"
description: "An in-depth analysis of the cordiverse/paper paper, exploring the programming paradigm for dynamic software composition, covering core concepts such as Revertible Effects, Reactive Coeffects, and Context Types"
tags:
  - programming paradigm
  - software architecture
  - dynamic composition
  - effect system
  - coeffect system
categories:
  - Paper Analysis
  - Programming Language Theory
---

# Spatiotemporal Composability: A Programming Paradigm Redefining Dynamic Software Architecture

## Project and Paper Introduction

**paper** is an academic preprint published by the cordiverse organization (draft August 2026), introducing a programming paradigm called **Dynamic Composition**. It aims to solve fundamental problems in dynamic interaction and dependency management between components in modern software architecture.

### Core Problem: Why Do We Need Dynamic Composition?

Traditional software architecture emphasizes modularity and composability, but falls significantly short when it comes to dynamically loading, replacing, and composing components at runtime. Modern application scenarios—from microservice architectures to hot module replacement (HMR) in frontend frameworks to plugin systems—all demand higher requirements for runtime composition.

The paper points out that current programming paradigms struggle with the following scenarios:

- **Hot Module Replacement**: Dynamically updating code modules without restarting the application
- **Plugin Systems**: Loading and unloading functional extensions at runtime
- **Reactive Dependency Management**: Automatically updating dependents when dependencies change
- **Transactional Rollback**: Completely reverting all side effects when a component fails

### Project Information

| Attribute | Value |
|-----------|-------|
| Project Name | paper |
| Organization | cordiverse |
| Type | Academic Preprint (not a software library) |
| Statistics | 281 stars, 2 forks |
| Publication Status | Draft (August 2026) |

---

## Core Design Philosophy

### Two Orthogonal Dimensions

The paper identifies two fundamental dimensions of composability that are independent yet jointly determine a system's expressiveness:

### 1. Temporal Composability

**Temporal composability** refers to the ability to **completely revert side effects** when removing a component. Traditional resource management only focuses on acquire/release but ignores the deeper side effects generated during a component's lifecycle.

For example, when a component performs:
- Modifying global state
- Creating background tasks
- Registering event handlers
- Establishing network connections

Temporal composability requires: when removing the component, these side effects must be **completely and predictably reverted**, as if the component never executed.

### 2. Spatial Composability

**Spatial composability** refers to the ability to **declare and reactively manage inter-component dependencies**. In a component system, components are not isolated—they depend on data and services provided by other components.

Spatial composability focuses on:
- How components **declare** their dependencies
- How components **respond** when dependencies **change**
- How dependency changes **propagate** to components that depend on them

### Why Do We Need Both Dimensions?

The paper's core argument is: **temporal and spatial composability are orthogonal and cannot replace each other**.

- Temporal composability only: components can be safely removed but cannot manage dependencies
- Spatial composability only: dependencies are declared and managed but without a reversion mechanism

Only by combining both can we achieve a true dynamic composition system.

---

## Core Concepts in Detail

### Revertible Effects

#### Conceptual Origin

Traditional **Effect** describes the **visible impact** a program has on the external world during execution—such as file operations, network requests, and state modifications. Effect systems (like Haskell's mtl, Effect-TS) allow programmers to track and manage these side effects in a type-safe manner.

**Revertible Effects** adds a critical capability on this foundation: **tracking inverse transformations**.

#### Core Idea

Each Effect not only describes "what to do" but also carries a context for a **reversion operation (reverter)**. When a component needs to be removed, the system can execute this reversion operation to restore state.

```typescript
// Conceptual example
interface RevertibleEffect<State, Effect> {
  perform: (state: State) => Effect;
  revert: (state: State, effect: Effect) => State;
}
```

#### Application Scenarios

1. **Database Transactions**: Automatically rollback uncommitted changes
2. **UI State Management**: Reverting user operations
3. **Resource Acquisition Tracking**: Precisely releasing all allocated resources
4. **Audit Logging**: Recording and reversible operation history

### Reactive Coeffects

#### Conceptual Origin

The **Coeffect** concept comes from functional programming, describing what a function **needs** to execute—its **contextual dependencies**. For example, a function that reads a config file "needs" the configuration data; a function that logs "needs" a logger.

Traditional Coeffect systems focus on **static dependency declarations**, while **Reactive Coeffects** extends this to **dynamic, reactive dependency management**.

#### Core Idea

When the context a component depends on changes, the system **actively notifies** the component, rather than having the component poll or manually check. This pattern borrows from Reactive Programming but applies it to the domain of dependency injection.

```typescript
// Conceptual example
interface ReactiveCoeffect<T> {
  // Declare dependencies
  dependsOn: () => T[];
  // Callback when dependencies change
  onChange: (newValue: T, oldValue: T) => void;
}
```

#### Differences from Traditional Dependency Injection

| Feature | Traditional DI | Reactive Coeffects |
|---------|---------------|-------------------|
| Dependency Resolution | At construction | Dynamic at runtime |
| Change Notification | None | Yes (push model) |
| Dependency Tracking | Explicit | Implicitly declared |
| Lazy Loading Support | Limited | Natively supported |

### Context Types

#### Unifying Effect and Coeffect

The paper proposes a unified conceptual framework that brings **Effect** (a component's impact on the outside) and **Coeffect** (a component's dependency on the outside) together under **Context Types**.

In traditional effect/coeffect systems, these two concepts are handled separately. Context Types provides a unified type system that can simultaneously express:

- **Produced Effects**: Side effects produced by components
- **Consumed Coeffects**: Dependencies required by components
- **Effect Tracking**: Tracking executed effects for rollback
- **Coeffect Resolution**: Dynamically resolving dependencies and propagating changes

#### Formal Definition

```typescript
// Conceptual form of Context Type
interface ContextType<S, E, C> {
  // State type
  state: S;
  // Effect type (revertible effects)
  effects: RevertibleEffect[];
  // Coeffect type (reactive dependencies)
  coeffects: ReactiveCoeffect[];
}
```

---

## Cordis Meta-Framework Architecture

### Framework Overview

**Cordis** (Latin for "heart") is a conceptual framework implementing the paper's ideas, demonstrating how to apply dynamic composition theory in practice.

### Core Components

#### 1. Core Library (@cordis/core)

Responsible for the most fundamental mechanisms:
- **Effect Tracking**: Tracking all revertible effects
- **Coeffect Resolution**: Managing dependency resolution and change propagation
- **Context Management**: Maintaining runtime context state

#### 2. Component System (@cordis/component)

Provides the **composition mechanism** for dynamic composition:

```typescript
// Component definition example (conceptual)
const myComponent = component({
  name: 'my-component',
  // Declare dependencies via coeffects
  coeffects: [databaseService, configService],
  // Provide or trigger effects
  effects: [loggingEffect],
  // Component logic
  setup(ctx) {
    // Use dependencies
    const db = ctx.coeffects.databaseService;
    // Execute operations
    ctx.effects.log('Hello');
  },
  // Optional teardown logic
  teardown(ctx) {
    // Cleanup work, effects will be automatically reverted
  }
});
```

#### 3. Declarative Loader (@cordis/loader)

Used for **declaratively loading and configuring components**:

- Declarative Dependencies: Describe what a component needs rather than manual injection
- Configuration Coordination: Managing component configuration and initialization order
- Lifecycle Management: Handling component creation, updates, and destruction

#### 4. Hot Module Replacement (HMR) Capability

The Cordis framework particularly emphasizes **hot module replacement** capability, which is a practical application of dynamic composition:

- **Incremental Updates**: Only update changed components, leaving others unaffected
- **State Preservation**: Maintaining necessary state during updates
- **Automatic Cleanup**: Removing old component effects, applying new component effects

---

## Calculus of Dynamic Composition

### Calculus of Dynamic Composition (CDC)

The paper proposes the **Calculus of Dynamic Composition (CDC)**, which is a **meta-theory** description of dynamic composition theory, providing a formal mathematical foundation.

### Core Elements of the Calculus

#### 1. Components

Components are the fundamental units of dynamic composition, each containing:
- **Interface**: Describes services provided and dependencies required by the component
- **Implementation**: The specific logic of the component
- **Effect Traces**: Records effects during component execution

#### 2. Compositors

Compositors define how components compose:
- **Sequential Composition**: One component's output becomes another's input
- **Parallel Composition**: Multiple components run independently, sharing state
- **Override Composition**: New component replaces old component

#### 3. Reversion Semantics

Defines what happens when a component is removed:
- Which effects need to be reverted
- What order the reversion follows
- How to handle partial reversion failures

### Formal Guarantees

The Calculus of Dynamic Composition provides the following formal guarantees:

1. **Composability Theorem**: Composed components still maintain temporal/spatial composability
2. **Reversion Completeness**: When removing a component, all effects are completely reverted
3. **Dependency Transitivity**: Dependency changes correctly propagate to all dependents

---

## Key Insights, Summary, and Conclusion

### Core Contributions

1. **Identified Two Orthogonal Dimensions**: Temporal and spatial composability jointly form the foundation of dynamic composition

2. **Elevated Effect and Coeffect Concepts**:
   - Revertible Effects elevates effect from "tracking" to "revertible tracking"
   - Reactive Coeffects elevates coeffect from "static declaration" to "dynamic response"

3. **Unified Formal Framework**: Context Types unifies effect and coeffect contexts

4. **Practical Framework Implementation**: Cordis demonstrates the practical feasibility of the theory

### Important Perspective

> "Dynamic composition is not about how to write components, but about how components interact, depend on each other, and revert at runtime."

### Limitations

The paper honestly acknowledges its limitations:

- Currently only a **proof of concept**, performance overhead not yet optimized
- **Formal proofs** are still being refined
- Scalability for **large-scale systems** needs verification
- **Practical application cases** are not yet abundant

---

## Application Scenarios and Practical Significance

### Applicable Scenarios

1. **Frontend Frameworks**
   - Hot Module Replacement (HMR)
   - Reactive state management (e.g., Redux time-travel debugging)
   - Plugin systems

2. **Backend Services**
   - Dynamic service orchestration in microservice architectures
   - Nested database transaction management
   - Precise tracking of resource acquisition and cleanup

3. **Embedded Systems**
   - Deterministic component loading and unloading
   - Precise resource management in resource-constrained environments

4. **IDE and Development Tools**
   - Live programming environments
   - Incremental compilation and updates

### Practical Significance

Practical value for software developers:

| Aspect | Current State | With Dynamic Composition |
|--------|--------------|-------------------------|
| Component Unloading | Manual resource cleanup | Automatic complete reversion |
| Dependency Changes | Manual update checks | Automatic reactive notification |
| Hot Updates | Limited support | Natively supported |
| State Rollback | Manual implementation | Framework-level support |

### Future Outlook

The dynamic composition paradigm provides a theoretical foundation for:

- Safer, more reasoning-friendly runtime composition systems
   - Programming languages and frameworks with native hot-update support
   - Automated resource management and cleanup
   - Formally verified runtime systems

---

## References

- Paper Repository: [cordiverse/paper](https://github.com/cordiverse/paper)
- Cordis Framework: [cordiverse/cordis](https://github.com/cordiverse/cordis)

---

*This document was written based on the paper draft dated August 13, 2026. Content may change as the paper is updated.*
