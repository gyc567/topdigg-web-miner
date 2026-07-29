import { useMemo, useState, useEffect } from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
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
      setHtmlContent(DOMPurify.sanitize(raw ?? ''));
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
