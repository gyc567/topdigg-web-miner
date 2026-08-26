/// <reference types="vite/client" />

declare module '*.md' {
  const content: string
  export default content
  export const metadata: {
    title?: string
    description?: string
    date?: string
    author?: string
    tags?: string[]
    // Vite returns arbitrary frontmatter fields; using `unknown` forces callers
    // to narrow before reading. Index signature required by the markdown loader.
    [key: string]: unknown
  }
}
