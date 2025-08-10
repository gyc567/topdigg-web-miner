import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { siteConfig } from "@/config/site";

const Index = () => {
  const latest = siteConfig.blog.posts.slice(0, 3);

  return (
    <>
      <SEO
        title="挖掘Web流量与商业机会的内容站"
        description="TopDigg 专注SEO与增长，提供优质博客内容与Reddit/YouTube/Twitter等专栏的Top5账号推荐。"
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.siteName,
          url: siteConfig.baseUrl,
        }}
      />
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-accent to-background p-10 md:p-16 shadow-sm">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          用内容与数据，系统性挖掘 Web 流量的商业机会
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          聚焦SEO、渠道增长与产品验证，配套三大专栏：Reddit、YouTube、Twitter，持续追踪优质创作者与趋势。
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/blog" className="inline-flex items-center rounded-md px-5 py-2.5 bg-brand text-brand-foreground shadow hover:opacity-90 transition-colors">
            阅读博客
          </Link>
          <Link to="/columns/reddit" className="inline-flex items-center rounded-md px-5 py-2.5 border hover:bg-accent transition-colors">
            进入专栏
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          siteConfig.columns.reddit,
          siteConfig.columns.youtube,
          siteConfig.columns.twitter,
        ].map((col) => (
          <article key={col.id} className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-xl font-bold mb-2">{col.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{col.description}</p>
            <ul className="space-y-2 text-sm">
              {col.topAccounts.slice(0, 5).map((acc) => (
                <li key={acc.url}>
                  <a href={acc.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-brand transition-colors">
                    {acc.name} {acc.handle ? `(${acc.handle})` : ""}
                  </a>
                </li>
              ))}
            </ul>
            <Link to={`/columns/${col.id}`} className="mt-4 inline-flex text-sm text-brand hover:underline">
              查看全部 →
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">最新博客</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {latest.map((post) => (
            <article key={post.slug} className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
              <h3 className="text-lg font-semibold">
                <Link to={`/blog/${post.slug}`} className="hover:text-brand transition-colors">
                  {post.title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{post.description}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> · {post.author}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

export default Index;
