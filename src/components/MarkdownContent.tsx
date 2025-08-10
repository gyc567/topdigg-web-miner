import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent = ({ content, className = '' }: MarkdownContentProps) => {
  const htmlContent = useMemo(() => {
    if (!content) return '';
    
    // 配置marked选项
    marked.setOptions({
      breaks: true, // 支持换行
      gfm: true,    // GitHub Flavored Markdown
    });
    
    // 将Markdown转换为HTML
    const rawHtml = marked.parse(content);
    
    // 净化HTML以防止XSS攻击
    return DOMPurify.sanitize(rawHtml);
  }, [content]);

  return (
    <div 
      className={`prose prose-slate max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownContent;