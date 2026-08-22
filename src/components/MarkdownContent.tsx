import { useState, useEffect } from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/** Post-process HTML: add alt="" to <img> tags missing one (accessibility + SEO) */
function ensureImgAlt(html: string): string {
  return html.replace(/<img(?![^>]*\balt=)([^>]*?)>/gi, '<img alt=""$1>');
}

const MarkdownContent = ({ content, className = '' }: MarkdownContentProps) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [Loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      import('marked'),
      import('dompurify'),
    ]).then(([{ marked }, { default: DOMPurify }]) => {
      if (cancelled) return;
      marked.setOptions({ breaks: true, gfm: true });
      const raw = marked.parse(content);
      const sanitized = DOMPurify.sanitize(raw ?? '', { USE_PROFILES: { html: true } });
      setHtmlContent(ensureImgAlt(sanitized));
      setLoading(false);
    }).catch(console.error);

    return () => { cancelled = true; };
  }, [content]);

  if (Loading) {
    return <div className={`prose prose-slate max-w-none dark:prose-invert ${className}`} />;
  }

  return (
    <div
      className={`prose prose-slate max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownContent;
