import { siteConfig, BlogPost } from '@/config/site';
import { blogFileSystem } from './blog-fs';

export interface BlogDataSource {
  getPosts(): Promise<BlogPost[]>;
  getPostBySlug(slug: string): Promise<BlogPost | undefined>;
}

class ConfigBlogDataSource implements BlogDataSource {
  async getPosts(): Promise<BlogPost[]> {
    return siteConfig.blog.posts;
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return siteConfig.blog.posts.find(post => post.slug === slug);
  }
}

class FileBlogDataSource implements BlogDataSource {
  async getPosts(): Promise<BlogPost[]> {
    return await blogFileSystem.getPosts();
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return await blogFileSystem.getPostBySlug(slug);
  }
}

export class BlogAdapter {
  private static instance: BlogAdapter;
  private primarySource: BlogDataSource;
  private fallbackSource: BlogDataSource;

  private constructor() {
    // 目前使用配置作为数据源
    // 未来可以通过构建脚本从content/blog目录生成静态内容
    this.primarySource = new ConfigBlogDataSource();
    this.fallbackSource = new ConfigBlogDataSource();
  }

  public static getInstance(): BlogAdapter {
    if (!BlogAdapter.instance) {
      BlogAdapter.instance = new BlogAdapter();
    }
    return BlogAdapter.instance;
  }

  async getPosts(): Promise<BlogPost[]> {
    try {
      const filePosts = await this.primarySource.getPosts();
      return filePosts;
    } catch (error) {
      console.warn('Error loading blog posts:', error);
      return await this.fallbackSource.getPosts();
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const filePost = await this.primarySource.getPostBySlug(slug);
      return filePost;
    } catch (error) {
      console.warn(`Error loading blog post "${slug}":`, error);
      return await this.fallbackSource.getPostBySlug(slug);
    }
  }
}

export const blogAdapter = BlogAdapter.getInstance();