import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const html = marked.parse(content, { async: false }) as string;

  return (
    <div
      className={`prose-blog ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
