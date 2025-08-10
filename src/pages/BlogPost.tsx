import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";

const BlogPost = () => {
  const { slug } = useParams();
  const post = siteConfig.blog.posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <>
        <SEO title="未找到" description="未找到该文章" path={`/blog/${slug}`} noIndex />
        <div className="py-20 text-center text-muted-foreground">文章不存在。</div>
      </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    mainEntityOfPage: `${siteConfig.baseUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        type="article"
        jsonLd={jsonLd}
      />
      <article className="max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="text-sm text-muted-foreground">
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> · {post.author} · {post.tags.join(" / ")}
          </div>
        </header>
        <section className="space-y-4 leading-7">
          <p>{post.content}</p>
        </section>
      </article>
    </>
  );
};

export default BlogPost;
