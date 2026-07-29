import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";
import { normalizeLang } from "@/lib/locale";

const About = () => {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  return (
    <>
      <SEO
        title={lang === "zh-Hans" ? "关于我们" : lang === "zh-Hant" ? "關於我們" : lang === "ja" ? "私たちについて" : "About Us"}
        description={lang === "zh-Hans"
          ? "TopDigg 是一个内容聚合平台，追踪 Reddit、YouTube、Twitter 的热门趋势与商业机会。"
          : lang === "zh-Hant"
          ? "TopDigg 是一個內容聚合平台，追蹤 Reddit、YouTube、Twitter 的熱門趨勢與商業機會。"
          : lang === "ja"
          ? "TopDiggはReddit、YouTube、Twitterのトレンドとビジネスチャンスを発掘するコンテンツプラットフォームです。"
          : "TopDigg surfaces trending topics and business opportunities across Reddit, YouTube, and Twitter."}
        path="/about"
      />

      <article className="max-w-3xl mx-auto py-12 space-y-10">
        <header>
          <h1 className="text-4xl font-bold mb-4">
            {lang === "zh-Hans" ? "关于我们" : lang === "zh-Hant" ? "關於我們" : lang === "ja" ? "私たちについて" : "About TopDigg"}
          </h1>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            {lang === "zh-Hans" ? "我们的使命" : lang === "zh-Hant" ? "我們的使命" : lang === "ja" ? "私たちの使命" : "Our Mission"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {lang === "zh-Hans"
              ? "TopDigg 致力于帮助内容创作者、创业者和营销人员发现 Reddit、YouTube 和 Twitter 上的热门趋势与商业机会。我们通过数据驱动的方法，分析头部账号的内容策略，为用户提供可操作的洞察。"
              : lang === "zh-Hant"
              ? "TopDigg 致力於幫助內容創作者、創業者和行銷人員發現 Reddit、YouTube 和 Twitter 上的熱門趨勢與商業機會。我們通過數據驅動的方法，分析頭部帳號的內容策略，為用戶提供可行動的洞察。"
              : lang === "ja"
              ? "TopDiggは、コンテンツクリエイター、起業家、マーケティング担当者がReddit、YouTube、Twitterでトレンドとビジネスチャンスを発見するのを支援します。"
              : "TopDigg helps content creators, entrepreneurs, and marketers discover trending topics and business opportunities across Reddit, YouTube, and Twitter. We analyze top accounts' content strategies using data-driven methods to deliver actionable insights."}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            {lang === "zh-Hans" ? "我们做什么" : lang === "zh-Hant" ? "我們做什麼" : lang === "ja" ? "何をしているか" : "What We Do"}
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-bold text-brand">01.</span>
              <span>
                <strong className="text-foreground">Twitter 深度分析：</strong>
                {lang === "zh-Hans" ? "解析头部账号的推文策略、爆款内容和增长模式。" : lang === "zh-Hant" ? "解析頭部帳號的推文策略、爆款內容和增長模式。" : lang === "ja" ? "人気アカウントのTweet戦略と成長パターンを分析。" : "Analyze tweet strategies, viral content, and growth patterns of top accounts."}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-brand">02.</span>
              <span>
                <strong className="text-foreground">Reddit 专栏：</strong>
                {lang === "zh-Hans" ? "追踪 Reddit 社区的热门话题，发现新兴社区和商业机会。" : lang === "zh-Hant" ? "追蹤 Reddit 社群的熱門話題，發現新興社群和商業機會。" : lang === "ja" ? "Redditコミュニティのトレンドを追跡し、新しいコミュニティとビジネスチャンスを発見。" : "Track trending topics in Reddit communities and spot emerging niches."}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-brand">03.</span>
              <span>
                <strong className="text-foreground">YouTube 专栏：</strong>
                {lang === "zh-Hans" ? "追踪 YouTube 头部频道的内容增长策略和视频营销打法。" : lang === "zh-Hant" ? "追蹤 YouTube 頭部頻道的內容增長策略和影片行銷打法。" : lang === "ja" ? "YouTube人気チャンネルのコンテンツ成長戦略を追跡。" : "Follow content growth strategies of top YouTube channels."}
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            {lang === "zh-Hans" ? "关注我们" : lang === "zh-Hant" ? "關注我們" : lang === "ja" ? "フォローする" : "Connect With Us"}
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://twitter.com/topdigg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-accent transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @topdigg
            </a>
            <a
              href="https://www.reddit.com/r/topdigg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-accent transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              r/topdigg
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            {lang === "zh-Hans" ? "联系或投稿" : lang === "zh-Hant" ? "聯繫或投稿" : lang === "ja" ? "連絡先・寄稿" : "Contact & Submissions"}
          </h2>
          <p className="text-muted-foreground">
            {lang === "zh-Hans"
              ? "如果你有想让我们分析的 Twitter 账号、Reddit 社区，或想投稿，欢迎通过社交媒体联系我们。"
              : lang === "zh-Hant"
              ? "如果你有想讓我們分析的 Twitter 帳號、Reddit 社群，或想投稿，歡迎透過社交媒體聯繫我們。"
              : lang === "ja"
              ? "分析してほしいTwitterアカウントやRedditコミュニティ、または寄稿したい場合は、お問い合わせください。"
              : "If you have a Twitter account or Reddit community you'd like us to analyze, or want to contribute, reach out via social media."}
          </p>
        </section>
      </article>
    </>
  );
};

export default About;
