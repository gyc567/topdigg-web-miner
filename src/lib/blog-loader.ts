import { BlogPost } from '@/config/site';

export interface BlogFile {
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  date: string;
  author: string;
  tags: string[];
  content: Record<string, string>;
}

export class BlogLoader {
  private static instance: BlogLoader;
  private cache: Map<string, BlogPost[]> = new Map();

  public static getInstance(): BlogLoader {
    if (!BlogLoader.instance) {
      BlogLoader.instance = new BlogLoader();
    }
    return BlogLoader.instance;
  }

  async loadBlogPosts(): Promise<BlogPost[]> {
    if (this.cache.has('posts')) {
      return this.cache.get('posts')!;
    }

    try {
      const posts = await this.loadFromFiles();
      this.cache.set('posts', posts);
      return posts;
    } catch (error) {
      console.warn('Failed to load blog posts from files, falling back to config:', error);
      return [];
    }
  }

  private async loadFromFiles(): Promise<BlogPost[]> {
    const files = import.meta.glob('/content/blog/**/*.md', { eager: true });
    const posts: BlogPost[] = [];

    for (const [path, module] of Object.entries(files)) {
      const content = (module as any).default || '';
      const metadata = (module as any).metadata || {};
      
      const slug = this.extractSlugFromPath(path);
      const locale = this.extractLocaleFromPath(path);

      if (!posts.find(p => p.slug === slug)) {
        posts.push({
          slug,
          title: {},
          description: {},
          content: {},
          date: metadata.date || new Date().toISOString(),
          author: metadata.author || 'TopDigg',
          tags: metadata.tags || [],
          ...this.initializeMultilingualFields(slug, metadata, content)
        });
      }

      const post = posts.find(p => p.slug === slug)!;
      post.title[locale] = metadata.title || '';
      post.description[locale] = metadata.description || '';
      post.content[locale] = content;
    }

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private extractSlugFromPath(path: string): string {
    const match = path.match(/\/content\/blog\/(?:[^/]+\/)?([^/]+)\.md$/);
    return match ? match[1] : '';
  }

  private extractLocaleFromPath(path: string): string {
    const match = path.match(/\/content\/blog\/([^/]+)\//);
    return match ? match[1] : 'zh-Hans';
  }

  private initializeMultilingualFields(slug: string, metadata: any, content: string): Partial<BlogPost> {
    return {
      title: {
        'zh-Hans': metadata.title || '',
        'zh-Hant': metadata.title || '',
        'en': metadata.title || '',
        'ja': metadata.title || ''
      },
      description: {
        'zh-Hans': metadata.description || '',
        'zh-Hant': metadata.description || '',
        'en': metadata.description || '',
        'ja': metadata.description || ''
      },
      content: {
        'zh-Hans': content,
        'zh-Hant': content,
        'en': content,
        'ja': content
      }
    };
  }
}

export const blogLoader = BlogLoader.getInstance();