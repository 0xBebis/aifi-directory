import Link from 'next/link';
import { BlogAuthor } from '@/types';
import { Clock } from 'lucide-react';

interface AuthorBylineProps {
  author: BlogAuthor;
  date: string;
  formattedDate: string;
  readingTime: number;
  updatedDate?: string;
  formattedUpdatedDate?: string;
}

export default function AuthorByline({
  author,
  date,
  formattedDate,
  readingTime,
  updatedDate,
  formattedUpdatedDate,
}: AuthorBylineProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Author avatar or initial */}
      <Link
        href={`/blog/author/${author.slug}`}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-muted font-semibold text-sm hover:border-accent/30 transition-colors"
      >
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          author.name.charAt(0).toUpperCase()
        )}
      </Link>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Link
            href={`/blog/author/${author.slug}`}
            className="text-text-primary font-medium hover:text-accent transition-colors"
          >
            {author.name}
          </Link>
          {author.title && (
            <>
              <span className="text-border">&middot;</span>
              <span className="text-text-faint">{author.title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-text-faint text-xs">
          <time dateTime={date}>{formattedDate}</time>
          {updatedDate && formattedUpdatedDate && (
            <>
              <span className="text-border">&middot;</span>
              <span>Updated <time dateTime={updatedDate}>{formattedUpdatedDate}</time></span>
            </>
          )}
          <span className="text-border">&middot;</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime} min read
          </span>
        </div>
      </div>
    </div>
  );
}
