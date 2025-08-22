# Technology Stack & Architecture

## Core Technologies
- **Framework**: React 18 + TypeScript + Vite (SWC compilation)
- **Build Tool**: Vite with SWC for fast development and optimized production builds
- **Language**: TypeScript 5.8+ with strict type checking
- **Package Manager**: npm (Node.js ecosystem)

## UI/UX Stack
- **Component Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React for consistent iconography
- **Animations**: Tailwind CSS animations + CSS transitions
- **Responsive**: Mobile-first responsive design

## State Management & Data
- **Server State**: React Query (TanStack Query) for caching and synchronization
- **Local State**: React hooks (useState, useReducer, useContext)
- **Language State**: i18next with browser detection and localStorage
- **Content**: Static markdown files processed at build time

## Internationalization
- **Library**: i18next + react-i18next
- **Detection**: Browser language + query parameter (?lang=) + localStorage
- **Languages**: zh-Hans, zh-Hant, en, ja
- **Fallback**: zh-Hans as primary fallback
- **Content**: JSON translation files in `/src/locales/[locale]/`

## SEO & Performance
- **Meta Tags**: React Helmet Async for dynamic SEO
- **Structured Data**: JSON-LD for rich snippets
- **Sitemap**: Auto-generated via build process
- **Performance**: 
  - Code splitting via React Router
  - Image optimization via CDN
  - Lazy loading for images and components

## Content Management
- **Source**: Static markdown files with frontmatter
- **Processing**: Custom Node.js build scripts (`scripts/build-blog.js`)
- **Structure**: Organized by language and content type
- **Assets**: Images processed and optimized at build time

## Development Tools
- **Linting**: ESLint with TypeScript and React rules
- **Type Checking**: TypeScript compiler with strict mode
- **Development**: Vite dev server with hot module replacement
- **Preview**: Vite preview server for production testing

## Build & Deployment
- **Build Process**: 
  1. Process markdown content via Node.js scripts
  2. Vite build for production optimization
  3. Static site generation (SSG)
- **Output**: Static HTML/CSS/JS files
- **Deployment**: Lovable.dev platform with auto-deployment
- **CDN**: Automatic CDN distribution

## Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Performance Budget
- **Bundle Size**: 
  - Initial load: < 100KB gzipped
  - Total: < 500KB gzipped
- **Core Web Vitals**:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1
- **Time to Interactive**: < 3.5s on 3G

## Security Considerations
- **Content Security Policy**: Strict CSP for XSS protection
- **Sanitization**: DomPurify for user-generated content
- **HTTPS**: Enforced via meta tags and build configuration
- **No Sensitive Data**: All content is public and static

## Monitoring & Analytics
- **Performance**: Core Web Vitals monitoring
- **Analytics**: To be implemented (Google Analytics 4 recommended)
- **Error Tracking**: Console error monitoring
- **Uptime**: Lovable.dev platform monitoring

## Third-party Services
- **Hosting**: Lovable.dev platform
- **CDN**: Automatic via Lovable.dev
- **Analytics**: (Pending implementation)
- **Domain**: Custom domain support via Lovable.dev