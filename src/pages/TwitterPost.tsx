import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { getTwitterAnalysisBySlug } from "@/config/site";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, UserIcon, ArrowLeftIcon, ExternalLinkIcon, HeartIcon, RepeatIcon, MessageCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarkdownContent from "@/components/MarkdownContent";

const TwitterPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const analysis = slug ? getTwitterAnalysisBySlug(slug) : undefined;

  useEffect(() => {
    if (!slug || !analysis) {
      setLoading(false);
      return;
    }
    const loadMarkdownContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/content/twitter/${slug}.md`);
        if (response.ok) {
          const content = await response.text();
          setMarkdownContent(content);
        } else {
          console.error(`Failed to load markdown content for ${slug}`);
        }
      } catch (error) {
        console.error(`Error loading markdown content:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdownContent();
  }, [slug, analysis]);

  if (!slug || !analysis) {
    return <NotFound />;
  }

  const currentLocale = i18n.language as keyof typeof analysis['title'];

  return (
    <>
      <SEO 
        title={analysis.title[currentLocale]}
        description={analysis.description[currentLocale]}
        type="article"
        path={`/twitter/${analysis.slug}`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/twitter">
              <Button variant="ghost" className="mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                返回 Twitter 分析
              </Button>
            </Link>
          </div>

          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-sm">
                Twitter 深度分析
              </Badge>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formatDate(analysis.date)}
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {analysis.author}
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              {analysis.title[currentLocale]}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {analysis.description[currentLocale]}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {analysis.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  分析账号概览
                </div>
                <a 
                  href={analysis.twitterAccount.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{analysis.twitterAccount.name}</h3>
                  <p className="text-muted-foreground">{analysis.twitterAccount.handle}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {analysis.analysisData.engagementRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">平均互动率</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-semibold">{analysis.analysisData.totalTweets}</div>
                  <div className="text-sm text-muted-foreground">分析推文数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{analysis.analysisData.avgLikes}</div>
                  <div className="text-sm text-muted-foreground">平均点赞数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{analysis.analysisData.avgRetweets}</div>
                  <div className="text-sm text-muted-foreground">平均转发数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis.analysisData.topTweets.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>🔥 热门推文分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.analysisData.topTweets.slice(0, 5).map((tweet, index) => (
                    <div key={tweet.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            #{index + 1}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(tweet.date)}
                          </span>
                        </div>
                        <a 
                          href={tweet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                      </div>
                      
                      <p className="mb-3 leading-relaxed">{tweet.content}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <HeartIcon className="h-4 w-4 mr-1" />
                          {tweet.likes.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <RepeatIcon className="h-4 w-4 mr-1" />
                          {tweet.retweets.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <MessageCircleIcon className="h-4 w-4 mr-1" />
                          {tweet.comments.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-lg text-muted-foreground">正在加载分析报告...</div>
            </div>
          ) : markdownContent ? (
            <MarkdownContent 
              content={markdownContent} 
              className="prose-headings:scroll-mt-8 prose-pre:overflow-x-auto" 
            />
          ) : (
            <div className="text-center py-16">
              <div className="text-lg text-muted-foreground">无法加载分析报告内容</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TwitterPost;