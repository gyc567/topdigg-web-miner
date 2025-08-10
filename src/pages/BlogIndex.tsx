import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";

const BlogIndex = () => {
  const posts = siteConfig.blog.posts;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.siteName} 博客`,
    url: `${siteConfig.baseUrl}/blog`,
  };

  return (
    <>
      <SEO
        title="博客文章"
        description="TopDigg 博客：SEO、增长、内容策略与流量变现的实战分享。"
        path="/blog"
        jsonLd={jsonLd}
      />
      <header className="mb-8">
        <h1 className="text-3xl font-bold">博客</h1>
        <p className="text-muted-foreground mt-2">持续更新高质量内容，助力你从流量走向收益。</p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-xl font-semibold">
              <Link to={`/blog/${post.slug}`} className="hover:text-brand transition-colors">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground mt-2">{post.description}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> · {post.author} · {post.tags.join(" / ")}
            </div>
          </article>
        ))}
      </section>
    </>
  );
};

export default BlogIndex;
