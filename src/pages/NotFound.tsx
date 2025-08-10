import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <SEO title="页面未找到" description="您访问的页面不存在" path={location.pathname} noIndex />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Oops! 页面不存在</p>
          <a href="/" className="text-brand hover:underline">
            返回首页
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
