import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, UserIcon, TrendingUpIcon } from "lucide-react";
import { useSupportedLocale } from "@/hooks/useSupportedLocale";

const TwitterIndex = () => {
  const { t } = useTranslation();
  const currentLocale = useSupportedLocale();
  
  return (
    <>
      <SEO 
        title={t("pages.twitter.title", "Twitter分析")}
        description={t("pages.twitter.description", "深度分析 Twitter 账号，解析爆款推文成功要素，提供增长策略建议")}
        type="website"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {t("pages.twitter.title", "Twitter 深度分析")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("pages.twitter.subtitle", "通过数据驱动的方法，深度分析Twitter账号的内容策略，识别爆款推文的成功因素，为您的社交媒体增长提供科学指导")}
            </p>
          </div>

          {siteConfig.twitter.analyses.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUpIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("pages.twitter.noAnalyses", "暂无分析报告")}
              </h3>
              <p className="text-muted-foreground">
                {t("pages.twitter.noAnalysesDesc", "我们正在准备精彩的 Twitter 分析内容，敬请期待！")}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {siteConfig.twitter.analyses.map((analysis) => (
                <Card key={analysis.slug} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          <Link 
                            to={`/twitter/${analysis.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {analysis.title[currentLocale]}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-base">
                          {analysis.description[currentLocale]}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {analysis.twitterAccount.handle}
                        </Badge>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <TrendingUpIcon className="h-4 w-4 mr-1" />
                          {analysis.analysisData.engagementRate.toFixed(1)}% {t("pages.twitter.engagementRate")}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(analysis.date)}
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {analysis.author}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {analysis.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {analysis.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{analysis.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {analysis.analysisData.totalTweets}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("pages.twitter.totalTweets")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {analysis.analysisData.avgLikes}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("pages.twitter.avgLikes")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {analysis.analysisData.avgRetweets}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("pages.twitter.avgRetweets")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TwitterIndex;