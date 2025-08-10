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
    [key: string]: any
  }
}
