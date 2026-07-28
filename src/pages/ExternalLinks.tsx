import { useTranslation } from "react-i18next";
import { localizeText, normalizeLang } from "@/lib/locale";
import { SEO } from "@/components/SEO";
import { ExternalLink, Globe } from "lucide-react";

// 外链导航数据 - 从Google Sheets获取的AI工具目录
const externalLinksData = [
  {
    category: {
      "zh-Hans": "免费AI工具目录",
      "zh-Hant": "免費AI工具目錄",
      "en": "Free AI Tool Directories",
      "ja": "無料AIツールディレクトリ"
    },
    links: [
      {
        name: "AI Listing",
        url: "https://www.ailisting.ai/",
        description: {
          "zh-Hans": "AI工具提交和发现平台",
          "zh-Hant": "AI工具提交和發現平台",
          "en": "AI tools submission and discovery platform",
          "ja": "AIツール提出・発見プラットフォーム"
        }
      },
      {
        name: "AI Tools Directory",
        url: "https://aitoolsdirectory.com/",
        description: {
          "zh-Hans": "全面的AI工具目录网站",
          "zh-Hant": "全面的AI工具目錄網站",
          "en": "Comprehensive AI tools directory website",
          "ja": "包括的なAIツールディレクトリサイト"
        }
      },
      {
        name: "Toolbox - Talent Genius",
        url: "https://toolbox.talentgenius.io/",
        description: {
          "zh-Hans": "人才和工具管理平台",
          "zh-Hant": "人才和工具管理平台",
          "en": "Talent and tools management platform",
          "ja": "人材・ツール管理プラットフォーム"
        }
      },
      {
        name: "AI Tool Hunt",
        url: "https://www.aitoolhunt.com/",
        description: {
          "zh-Hans": "AI工具搜索和发现",
          "zh-Hant": "AI工具搜索和發現",
          "en": "AI tools search and discovery",
          "ja": "AIツール検索・発見"
        }
      },
      {
        name: "Future Tools",
        url: "https://www.futuretools.io/",
        description: {
          "zh-Hans": "未来AI工具集合",
          "zh-Hant": "未來AI工具集合",
          "en": "Future AI tools collection",
          "ja": "未来のAIツールコレクション"
        }
      },
      {
        name: "AI Valley",
        url: "https://aivalley.ai/",
        description: {
          "zh-Hans": "AI工具和资源中心",
          "zh-Hant": "AI工具和資源中心",
          "en": "AI tools and resources hub",
          "ja": "AIツール・リソースハブ"
        }
      }
    ]
  },
  {
    category: {
      "zh-Hans": "付费AI工具目录",
      "zh-Hant": "付費AI工具目錄",
      "en": "Premium AI Tool Directories",
      "ja": "プレミアムAIツールディレクトリ"
    },
    links: [
      {
        name: "Pitchwall",
        url: "https://pitchwall.co/",
        description: {
          "zh-Hans": "产品展示和推广平台",
          "zh-Hant": "產品展示和推廣平台",
          "en": "Product showcase and promotion platform",
          "ja": "製品ショーケース・プロモーションプラットフォーム"
        }
      },
      {
        name: "Made with Laravel",
        url: "https://madewithlaravel.com/",
        description: {
          "zh-Hans": "Laravel项目展示平台",
          "zh-Hant": "Laravel項目展示平台",
          "en": "Laravel project showcase platform",
          "ja": "Laravelプロジェクトショーケースプラットフォーム"
        }
      },
      {
        name: "Affordhunt",
        url: "https://www.affordhunt.com/",
        description: {
          "zh-Hans": "经济实惠的工具和服务发现",
          "zh-Hant": "經濟實惠的工具和服務發現",
          "en": "Affordable tools and services discovery",
          "ja": "手頃なツール・サービス発見"
        }
      },
      {
        name: "Website Hunt",
        url: "https://websitehunt.co/",
        description: {
          "zh-Hans": "网站和工具发现平台",
          "zh-Hant": "網站和工具發現平台",
          "en": "Website and tools discovery platform",
          "ja": "ウェブサイト・ツール発見プラットフォーム"
        }
      },
      {
        name: "Top AI Web",
        url: "https://topaiweb.net/",
        description: {
          "zh-Hans": "顶级AI网站和工具",
          "zh-Hant": "頂級AI網站和工具",
          "en": "Top AI websites and tools",
          "ja": "トップAIウェブサイト・ツール"
        }
      },
      {
        name: "Startup Buffer",
        url: "https://startupbuffer.com/",
        description: {
          "zh-Hans": "创业公司工具和资源",
          "zh-Hant": "創業公司工具和資源",
          "en": "Startup tools and resources",
          "ja": "スタートアップツール・リソース"
        }
      }
    ]
  },
  {
    category: {
      "zh-Hans": "推荐AI工具",
      "zh-Hant": "推薦AI工具",
      "en": "Recommended AI Tools",
      "ja": "推奨AIツール"
    },
    links: [
      {
        name: "ChatGPT",
        url: "https://chat.openai.com/",
        description: {
          "zh-Hans": "OpenAI开发的强大AI聊天机器人",
          "zh-Hant": "OpenAI開發的強大AI聊天機器人",
          "en": "Powerful AI chatbot developed by OpenAI",
          "ja": "OpenAIが開発した強力なAIチャットボット"
        }
      },
      {
        name: "Claude",
        url: "https://claude.ai/",
        description: {
          "zh-Hans": "Anthropic的AI助手",
          "zh-Hant": "Anthropic的AI助手",
          "en": "AI assistant by Anthropic",
          "ja": "AnthropicのAIアシスタント"
        }
      },
      {
        name: "Midjourney",
        url: "https://midjourney.com/",
        description: {
          "zh-Hans": "AI图像生成工具",
          "zh-Hant": "AI圖像生成工具",
          "en": "AI image generation tool",
          "ja": "AI画像生成ツール"
        }
      },
      {
        name: "Notion AI",
        url: "https://www.notion.so/product/ai",
        description: {
          "zh-Hans": "智能笔记和知识管理",
          "zh-Hant": "智能筆記和知識管理",
          "en": "Intelligent notes and knowledge management",
          "ja": "インテリジェントノート・ナレッジマネジメント"
        }
      }
    ]
  }
];

const ExternalLinks = () => {
  const { i18n } = useTranslation();
  const currentLocale = normalizeLang(i18n.language);

  return (
    <>
      <SEO
        title={localizeText({
          "zh-Hans": "外链导航 - TopDigg",
          "zh-Hant": "外鏈導航 - TopDigg", 
          "en": "External Links - TopDigg",
          "ja": "外部リンク - TopDigg"
        }, currentLocale)}
        description={localizeText({
          "zh-Hans": "精选外链资源导航，涵盖AI工具、开发工具、设计资源等各个领域。",
          "zh-Hant": "精選外鏈資源導航，涵蓋AI工具、開發工具、設計資源等各個領域。",
          "en": "Curated external link navigation covering AI tools, development tools, design resources and more.",
          "ja": "AIツール、開発ツール、デザインリソースなど、厳選された外部リンクナビゲーション。"
        }, currentLocale)}
      />
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {localizeText({
                "zh-Hans": "外链导航",
                "zh-Hant": "外鏈導航",
                "en": "External Links",
                "ja": "外部リンク"
              }, currentLocale)}
            </h1>
          </div>
          
          <p className="text-muted-foreground mb-8 text-lg">
            {localizeText({
              "zh-Hans": "精选优质外链资源，助力你的工作和学习。",
              "zh-Hant": "精選優質外鏈資源，助力你的工作和學習。",
              "en": "Curated quality external resources to boost your work and learning.",
              "ja": "厳選された高品質な外部リソースで、あなたの仕事と学習をサポートします。"
            }, currentLocale)}
          </p>

          <div className="space-y-8">
            {externalLinksData.map((category, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary rounded-full"></span>
                  {localizeText(category.category, currentLocale)}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200"
                    >
                      <ExternalLink className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {link.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {localizeText(link.description, currentLocale)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          {link.url}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExternalLinks;