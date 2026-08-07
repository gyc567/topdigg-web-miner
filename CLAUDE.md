# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based content website built with Vite, TypeScript, and shadcn/ui components. The site focuses on SEO and growth topics, featuring a multi-language blog system and curated columns for Reddit, YouTube, and Twitter content. The project uses Tailwind CSS for styling and includes internationalization support.

## Commands

### Development
- `npm run dev` - Start development server on port 8080
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Package Management
- `npm i` - Install dependencies (uses npm, not yarn or pnpm)

## Architecture

### Core Structure
- **Vite + React + TypeScript**: Modern build setup with SWC for fast compilation
- **shadcn/ui**: UI component library based on Radix UI primitives
- **React Router**: Client-side routing with routes defined in `src/App.tsx:28-34`
- **Internationalization**: i18next with 5 supported locales (zh-Hans, zh-Hant, en, ja, vi)
- **SEO**: Structured data and meta tags via react-helmet-async

### Key Directories
- `src/components/ui/`: shadcn/ui components - auto-generated, avoid manual edits
- `src/components/layout/`: Site layout components (Header, Footer, Layout)
- `src/pages/`: Page components for routing
- `src/config/site.ts`: Central configuration for site content, navigation, and columns
- `src/locales/`: Translation files for supported languages
- `src/lib/`: Utilities including locale handling and common functions

### Data Flow
- **Site Configuration**: All content (blog posts, column data, navigation) is centralized in `src/config/site.ts`
- **Internationalization**: Uses react-i18next with browser language detection and localStorage caching
- **Routing**: Simple React Router setup with Layout wrapper for all pages
- **SEO Component**: Reusable SEO component for structured data and meta tags

### Development Patterns
- **Component Structure**: Uses standard React functional components with TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Query for server state, React hooks for local state
- **Path Aliases**: `@/` maps to `src/` directory (configured in vite.config.ts:20)

### Internationalization System
- **Language Detection**: Automatic detection via browser settings, query params (?lang=), or localStorage
- **Supported Locales**: zh-Hans, zh-Hant, en, ja, vi with fallback to first supported locale
- **Translation Keys**: Structured JSON files in `src/locales/[locale]/translation.json`
- **Locale Utilities**: `src/lib/locale.ts` provides helper functions for locale handling

### Content Management
- **Blog System**: Static content defined in `siteConfig.blog.posts` with routing via slug
- **Column System**: Three main columns (Reddit, YouTube, Twitter) with top account recommendations
- **SEO Optimization**: Each page includes structured data, meta descriptions, and OpenGraph tags

## Important Notes
- This is a Lovable.dev project - changes made via Lovable are auto-committed
- Server runs on port 8080 (configured in vite.config.ts:10)
- ESLint is configured with TypeScript and React rules, unused vars warning disabled
- Uses Lovable component tagger in development mode for enhanced development experience
Code Architecture Guidelines

────────────────────────────────────────
📏 Hard Requirements (MUST-FOLLOW)
────────────────────────────────────────
✅ Source-File Length Limits
• Dynamic languages (Python, JavaScript, TypeScript, etc.):  
  – **≤ 200 physical lines per file**  
• Static languages (Java, Go, Rust, etc.):  
  – **≤ 250 physical lines per file**  
> Purpose: improve readability, maintainability and reduce cognitive load.

✅ Directory Structure Limits
• **≤ 8 files per directory**  
• If exceeded, refactor into nested sub-directories.  
> Purpose: enhance structural clarity and enable rapid navigation and extension.

────────────────────────────────────────
🧠 Architectural Design Watch-List
────────────────────────────────────────
The following “smells” erode code quality and **must be vigilantly prevented**:

❌ 1. Rigidity  
> System becomes resistant to change; minor edits trigger cascading effects.  
Problem: high change-cost → low productivity.  
Mitigation: introduce interface abstraction, Strategy pattern, Dependency Inversion Principle.

❌ 2. Redundancy  
> Identical logic repeated in multiple places.  
Problem: code bloat & inconsistency.  
Mitigation: extract common functions/classes; favor composition over inheritance.

❌ 3. Circular Dependency  
> Modules mutually depend on each other, forming a deadlock.  
Problem: hinders testing, reuse and maintenance.  
Mitigation: decouple via interfaces, event mechanism, or dependency injection.

❌ 4. Fragility  
> Altering one area breaks seemingly unrelated parts.  
Problem: instability & frequent regressions.  
Mitigation: apply Single-Responsibility Principle and increase module cohesion.

❌ 5. Obscurity  
> Code structure is chaotic and intent is unclear.  
Problem: steep onboarding curve & collaboration friction.  
Mitigation: clear naming, concise comments, simple structure, up-to-date docs.

❌ 6. Data Clump  
> Several parameters always travel together, signaling a missing abstraction.  
Problem: bloated parameter lists & weak semantics.  
Mitigation: encapsulate into a data structure or value object.

❌ 7. Needless Complexity  
> Over-engineering—applying a heavyweight solution to a trivial problem.  
Problem: high comprehension & maintenance overhead.  
Mitigation: follow YAGNI and KISS; design only for proven needs.

────────────────────────────────────────
🚨 Critical Reminder
────────────────────────────────────────
> **CRITICAL:** When writing, reading or reviewing code, you **must** strictly adhere to the above hard limits and continuously evaluate architectural quality.

> **CRITICAL:** Upon detecting any smell, immediately prompt the user to consider refactoring and supply concrete optimization recommendations.

