import { BlogPost } from '@/config/site';
import blogData from './blog-data.json';

export class BlogDataSource {
  private static instance: BlogDataSource;
  private posts: BlogPost[];

  private constructor() {
    this.posts = blogData.posts;
  }

  public static getInstance(): BlogDataSource {
    if (!BlogDataSource.instance) {
      BlogDataSource.instance = new BlogDataSource();
    }
    return BlogDataSource.instance;
  }

  getPosts(): BlogPost[] {
    return this.posts;
  }

  getPostBySlug(slug: string): BlogPost | undefined {
    return this.posts.find(post => post.slug === slug);
  }
}

export const blogDataSource = BlogDataSource.getInstance();