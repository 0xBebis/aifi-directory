import { BlogPost } from '@/types';
import BlogCard from './BlogCard';

interface RelatedPostsProps {
  posts: BlogPost[];
  title?: string;
  subtitle?: string;
}

export default function RelatedPosts({ posts, title = 'Related Articles', subtitle }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {subtitle && (
          <p className="text-sm text-text-muted mt-1">{subtitle}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <BlogCard key={post.slug} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}
