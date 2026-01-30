import { Metadata } from 'next';
import Link from 'next/link';
import { PenLine } from 'lucide-react';
import {
  getRecentPosts,
  getFeaturedPosts,
  getBlogCategoryStats,
  posts,
} from '@/lib/data';
import { BLOG_CATEGORY_LABELS, BlogCategory } from '@/types';
import BlogCard from '@/components/BlogCard';
import BlogCategoryTabs from '@/components/BlogCategoryTabs';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Blog — Analysis, Reports & Insights | AIFI Map',
  description: 'Expert analysis, company spotlights, market reports, and insights on the convergence of artificial intelligence and financial services.',
  openGraph: {
    title: 'Blog — Analysis, Reports & Insights',
    description: 'Expert analysis, company spotlights, market reports, and insights on AI + Finance.',
    type: 'website',
    siteName: 'AIFI Map',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Analysis, Reports & Insights | AIFI Map',
    description: 'Expert analysis, company spotlights, market reports, and insights on AI + Finance.',
    images: ['/og/default.png'],
  },
};

export default function BlogPage() {
  const recentPosts = getRecentPosts(12);
  const featuredPosts = getFeaturedPosts(3);
  const categoryStats = getBlogCategoryStats();

  const counts: Record<string, number> = {};
  for (const stat of categoryStats) {
    counts[stat.category] = stat.count;
  }

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'AIFI Map Blog',
    description: 'Expert analysis, company spotlights, market reports, and insights on AI + Finance.',
    url: 'https://aifimap.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'AIFI Map',
      url: 'https://aifimap.com',
    },
    blogPost: recentPosts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://aifimap.com/blog/${post.slug}`,
      datePublished: post.published_date,
      ...(post.updated_date && { dateModified: post.updated_date }),
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aifimap.com/blog' },
    ],
  };

  // Posts not in featured, for the main grid
  const featuredSlugs = new Set(featuredPosts.map(p => p.slug));
  const remainingPosts = recentPosts.filter(p => !featuredSlugs.has(p.slug));

  return (
    <main className="min-h-screen">
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-accent/5 to-transparent blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-8">
          <Breadcrumbs items={[{ label: 'Blog' }]} />

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Blog
          </h1>
          <p className="text-text-muted text-[0.9375rem] leading-relaxed mt-2 max-w-xl">
            Analysis, company spotlights, market reports, and expert insights on AI + Finance.
          </p>

          {/* Stats + CTA */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-6 text-sm text-text-faint">
              <span><span className="text-text-primary font-semibold">{posts.length}</span> articles</span>
              <span><span className="text-text-primary font-semibold">{categoryStats.length}</span> categories</span>
            </div>
            <Link
              href="/submit/blog"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              Submit an Article
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {/* Category tabs */}
        <div className="mb-8">
          <BlogCategoryTabs counts={counts} />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg mb-2">No articles yet</p>
            <p className="text-text-faint text-sm mb-6">Be the first to contribute.</p>
            <Link
              href="/submit/blog"
              className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-muted transition-colors"
            >
              Submit an Article
            </Link>
          </div>
        ) : (
          <>
            {/* Featured posts */}
            {featuredPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-lg font-semibold text-text-primary mb-6">Featured</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post, i) => (
                    <BlogCard key={post.slug} post={post} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* All recent posts */}
            <section>
              {featuredPosts.length > 0 && (
                <h2 className="text-lg font-semibold text-text-primary mb-6">Latest</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(featuredPosts.length > 0 ? remainingPosts : recentPosts).map((post, i) => (
                  <BlogCard key={post.slug} post={post} index={i} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
