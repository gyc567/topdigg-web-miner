import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";
import { normalizeLang } from "@/lib/locale";

const Privacy = () => {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  return (
    <>
      <SEO
        title={lang === "zh-Hans" ? "隐私政策" : lang === "zh-Hant" ? "隱私政策" : lang === "ja" ? "プライバシーポリシー" : "Privacy Policy"}
        description={lang === "zh-Hans"
          ? "TopDigg 隐私政策说明：我们如何收集、使用和保护您的信息。"
          : lang === "zh-Hant"
          ? "TopDigg 隱私政策說明：我們如何收集、使用和保護您的資訊。"
          : lang === "ja"
          ? "TopDiggのプライバシーポリシー。"
          : "TopDigg Privacy Policy — how we collect, use, and protect your information."}
        path="/privacy"
      />

      <article className="max-w-3xl mx-auto py-12 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-2">
            {lang === "zh-Hans" ? "隐私政策" : lang === "zh-Hant" ? "隱私政策" : lang === "ja" ? "プライバシーポリシー" : "Privacy Policy"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "zh-Hans"
              ? "最后更新：2026年7月"
              : lang === "zh-Hant"
              ? "最後更新：2026年7月"
              : lang === "ja"
              ? "最終更新：2026年7月"
              : "Last updated: July 2026"}
          </p>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {lang === "zh-Hans" ? "我们收集什么信息"
              : lang === "zh-Hant" ? "我們收集什麼資訊"
              : lang === "ja" ? "収集する情報"
              : "What Information We Collect"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {lang === "zh-Hans"
              ? "TopDigg 是一个内容聚合平台，主要展示公开可获取的信息。我们不要求用户注册账号，也不主动收集个人信息。当您访问我们的网站时，我们可能会收集基本的浏览信息，如 IP 地址、浏览器类型和访问页面，这些信息仅用于网站分析和改进。"
              : lang === "zh-Hant"
              ? "TopDigg 是一個內容聚合平台，主要展示公開可獲取的資訊。我們不要求用戶註冊帳號，也不主動收集個人資訊。當您存取我們的網站時，我們可能會收集基本的瀏覽資訊，如 IP 位址、瀏覽器類型和存取頁面，這些資訊僅用於網站分析和改進。"
              : lang === "ja"
              ? "TopDiggはコンテンツプラットフォームであり、主に公開情報を 表示します。ユーザーの登録を必要とせず、個人情報を能動的に収集することもありません。"
              : "TopDigg is a content aggregation platform that surfaces publicly available information. We do not require user registration or actively collect personal information. When you visit our site, we may collect basic browsing information such as IP address, browser type, and pages visited, used solely for site analytics and improvement."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {lang === "zh-Hans" ? "Cookie 使用"
              : lang === "zh-Hant" ? "Cookie 使用"
              : lang === "ja" ? "Cookieの使用"
              : "Cookie Usage"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {lang === "zh-Hans"
              ? "我们使用 Cookie 来记住您的语言偏好设置（如您选择的站点语言）。我们不使用跟踪性 Cookie 进行广告定位或跨网站追踪。"
              : lang === "zh-Hant"
              ? "我們使用 Cookie 來記住您的語言偏好設定（如您選擇的站點語言）。我們不使用追蹤性 Cookie 進行廣告定位或跨網站追蹤。"
              : lang === "ja"
              ? "Cookieを使用して言語設定を記憶します。トラッキングCookieは使用しません。"
              : "We use cookies to remember your language preference setting. We do not use tracking cookies for ad targeting or cross-site tracking."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {lang === "zh-Hans" ? "第三方链接"
              : lang === "zh-Hant" ? "第三方連結"
              : lang === "ja" ? "第三方リンク"
              : "Third-Party Links"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {lang === "zh-Hans"
              ? "我们的网站包含指向上第三方网站（如 Twitter、YouTube、Reddit）的链接。我们对这些第三方网站的隐私行为不承担责任。"
              : lang === "zh-Hant"
              ? "我們的網站包含指向第三方網站（如 Twitter、YouTube、Reddit）的連結。我們對這些第三方網站的隱私行為不承擔責任。"
              : lang === "ja"
              ? "サイトにはTwitter、YouTube、Redditなどの第三方サイトへのリンクが含まれています。"
              : "Our site contains links to third-party websites such as Twitter, YouTube, and Reddit. We are not responsible for the privacy practices of these third-party sites."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {lang === "zh-Hans" ? "联系我们"
              : lang === "zh-Hant" ? "聯繫我們"
              : lang === "ja" ? "お問い合わせ"
              : "Contact Us"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {lang === "zh-Hans"
              ? "如果您对我们的隐私政策有任何疑问，请通过 Twitter @topdigg 或 Reddit r/topdigg 与我们联系。"
              : lang === "zh-Hant"
              ? "如果您對我們的隱私政策有任何疑問，請透過 Twitter @topdigg 或 Reddit r/topdigg 與我們聯繫。"
              : lang === "ja"
              ? "プライバシーポリシーに関するご質問は、Twitter @topdigg または Reddit r/topdigg でお問い合わせください。"
              : "If you have any questions about this Privacy Policy, please reach out via Twitter @topdigg or Reddit r/topdigg."}
          </p>
        </section>
      </article>
    </>
  );
};

export default Privacy;
