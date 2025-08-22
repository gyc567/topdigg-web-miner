# Project Structure & Code Organization

## Directory Structure
```
src/
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui auto-generated components (DO NOT EDIT)
│   ├── layout/          # Layout components (Header, Footer, Layout)
│   └── website-analysis/# Website analysis components
├── pages/               # Route-based page components
│   ├── Index.tsx        # Homepage
│   ├── BlogIndex.tsx    # Blog listing
│   ├── BlogPost.tsx     # Individual blog post
│   ├── ColumnPage.tsx   # Content column pages
│   ├── TwitterIndex.tsx # Twitter analytics listing
│   └── TwitterPost.tsx  # Twitter analysis detail
├── config/              # Centralized configuration
│   └── site.ts          # Site config, navigation, content definitions
├── lib/                 # Utility functions and helpers
│   ├── utils.ts         # General utilities (cn, formatting)
│   ├── locale.ts        # Language/locale utilities
│   └── blog-*.ts        # Blog content loading utilities
├── locales/             # Internationalization files
│   ├── zh-Hans/         # Simplified Chinese
│   ├── zh-Hant/         # Traditional Chinese
│   ├── en/              # English
│   └── ja/              # Japanese
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx   # Mobile detection
│   ├── use-toast.ts     # Toast notifications
│   └── useGeoLanguage.ts # Geographic language detection
└── styles/              # Global styles (via Tailwind CSS)
```

## File Naming Conventions
- **Components**: PascalCase (e.g., `BlogPost.tsx`, `SiteHeader.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`, `locale.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useMobile.tsx`)
- **Pages**: PascalCase matching route (e.g., `BlogIndex.tsx`)
- **Config**: camelCase (e.g., `site.ts`, `i18n.ts`)

## Component Architecture
- **Functional Components**: All components use React functional components with TypeScript
- **Props Interface**: Each component has clearly defined TypeScript interfaces
- **Composition**: Prefer composition over inheritance
- **Single Responsibility**: Each component has one clear purpose

## Content Organization
```
content/
├── blog/                # Blog posts by language
│   ├── zh-Hans/
│   ├── zh-Hant/
│   ├── en/
│   └── ja/
└── twitter/             # Twitter analysis content

public/                  # Static assets
├── favicon.ico
├── robots.txt
├── *.html               # Knowledge card pages
└── *.svg                # Generated knowledge cards
```

## Configuration Structure
- **Centralized**: All site configuration in `src/config/site.ts`
- **Type Safe**: Full TypeScript interfaces for all config objects
- **Localized**: All user-facing text supports multiple languages
- **Extensible**: Easy to add new content types and languages

## Code Style Guidelines

### TypeScript
- **Strict Mode**: Enabled with full type safety
- **Interfaces**: Prefer interfaces over type aliases for object shapes
- **Generics**: Use generics for reusable components and utilities
- **No Any**: Avoid `any` type, use `unknown` when necessary

### React Patterns
- **Hooks**: Use custom hooks for reusable logic
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Error Boundaries**: Implement error boundaries for graceful degradation
- **Suspense**: Use React.lazy for code splitting

### Styling
- **Tailwind CSS**: Utility-first approach with custom design tokens
- **CSS Variables**: Use CSS custom properties for theming
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Support for system preference and manual toggle

### Testing Strategy
- **Unit Tests**: Component and utility testing (to be implemented)
- **Integration Tests**: Page-level testing (to be implemented)
- **E2E Tests**: Critical user flows testing (to be implemented)
- **Visual Regression**: Snapshot testing for UI consistency

## Build Process
1. **Content Processing**: Node.js scripts process markdown files
2. **Type Checking**: TypeScript compiler validates types
3. **Linting**: ESLint enforces code style
4. **Optimization**: Vite optimizes and bundles assets
5. **Static Generation**: Static HTML/CSS/JS output

## Development Workflow
1. **Local Development**: `npm run dev` (port 8080)
2. **Content Creation**: Add markdown files in appropriate directories
3. **Component Development**: Create/modify components in src/
4. **Testing**: Manual testing + linting (`npm run lint`)
5. **Build**: `npm run build` for production
6. **Preview**: `npm run preview` for production testing

## New Feature Guidelines
- **Location**: Place in appropriate directory based on purpose
- **Naming**: Follow existing conventions
- **Types**: Add TypeScript interfaces to site.ts or appropriate files
- **Content**: Update siteConfig for new content types
- **Internationalization**: Add translations for all 4 languages
- **SEO**: Update meta tags and structured data

## Maintenance Patterns
- **Dependencies**: Regular updates via npm audit
- **Performance**: Monitor bundle size and Core Web Vitals
- **Content**: Regular content updates and SEO optimization
- **Accessibility**: WCAG 2.1 compliance testing
- **Security**: Regular security audits and CSP updates

## Extension Points
- **New Content Types**: Add to siteConfig and create corresponding pages
- **New Languages**: Add locale directory and update i18n configuration
- **New Integrations**: Add to appropriate lib/ utilities
- **New Features**: Follow existing patterns and add to siteConfig
- **New Analytics**: Implement via hooks or utilities