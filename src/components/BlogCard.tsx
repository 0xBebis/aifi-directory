import Link from 'next/link';
import { BlogPost, BLOG_CATEGORY_LABELS, BLOG_CATEGORY_COLORS } from '@/types';
import { getAuthor, formatPostDate, calculateReadingTime } from '@/lib/data';
import { Clock, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const author = getAuthor(post.author_slug);
  const categoryLabel = BLOG_CATEGORY_LABELS[post.category];
  const categoryColor = BLOG_CATEGORY_COLORS[post.category];
  const readingTime = post.reading_time || calculateReadingTime(post.body);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-soft transition-all duration-200 animate-fade-in-up-slow animate-fill-both"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {post.cover_image && (
        <div className="aspect-[2/1] bg-surface-2 overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-5">
        {/* Category badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
            style={{
              backgroundColor: `${categoryColor}15`,
              color: categoryColor,
              border: `1px solid ${categoryColor}30`,
            }}
          >
            {categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-faint">
            <Clock className="w-3 h-3" />
            {readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-text-muted leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        {/* Footer: Author + Date */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-text-faint">
            {author && (
              <>
                <span className="text-text-muted">{author.name}</span>
                <span className="text-border">&middot;</span>
              </>
            )}
            <time dateTime={post.published_date}>
              {formatPostDate(post.published_date)}
            </time>
          </div>
          <ArrowRight size={14} className="text-text-faint group-hover:text-accent transition-colors" />
        </div>
      </div>
    </Link>
  );
}
