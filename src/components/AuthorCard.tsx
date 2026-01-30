import Link from 'next/link';
import { BlogAuthor } from '@/types';
import { getPostsByAuthor } from '@/lib/data';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface AuthorCardProps {
  author: BlogAuthor;
  index?: number;
}

export default function AuthorCard({ author, index = 0 }: AuthorCardProps) {
  const postCount = getPostsByAuthor(author.slug).length;

  return (
    <Link
      href={`/blog/author/${author.slug}`}
      className="group block bg-surface border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-soft transition-all duration-200 animate-fade-in-up-slow animate-fill-both"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header: Avatar + Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-muted font-semibold text-lg">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            author.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
            {author.name}
          </h3>
          <p className="text-xs text-text-faint truncate">{author.title}</p>
          {author.company && (
            <p className="text-xs text-text-faint truncate">
              {author.company_role ? `${author.company_role}, ` : ''}{author.company}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-3">
        {author.bio}
      </p>

      {/* Expertise tags */}
      {author.expertise && author.expertise.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {author.expertise.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-text-faint font-medium"
            >
              {topic}
            </span>
          ))}
          {author.expertise.length > 3 && (
            <span className="text-[10px] text-text-faint">+{author.expertise.length - 3} more</span>
          )}
        </div>
      )}

      {/* Footer: Post count + social */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-xs text-text-faint">
          {postCount} {postCount === 1 ? 'article' : 'articles'}
        </span>
        <div className="flex items-center gap-2">
          {author.twitter && (
            <span className="text-text-faint text-xs">@{author.twitter.replace(/^@/, '')}</span>
          )}
          <ArrowRight size={14} className="text-text-faint group-hover:text-accent transition-colors" />
        </div>
      </div>
    </Link>
  );
}
