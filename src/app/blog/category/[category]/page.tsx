import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getPostsByCategory,
  getBlogCategoryStats,
  posts,
} from '@/lib/data';
import {
  BlogCategory,
  BLOG_CATEGORY_LABELS,
  BLOG_CATEGORY_COLORS,
  BLOG_CATEGORY_DESCRIPTIONS,
} from '@/types';
import BlogCard from '@/components/BlogCard';
import BlogCategoryTabs from '@/components/BlogCategoryTabs';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

const validCategories = Object.keys(BLOG_CATEGORY_LABELS) as BlogCategory[];

export function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = params.category as BlogCategory;
  if (!validCategories.includes(category)) {
    return { title: 'Category Not Found | AIFI Map' };
  }

  const label = BLOG_CATEGORY_LABELS[category];
  const description = BLOG_CATEGORY_DESCRIPTIONS[category];

  return {
    title: `${label} — Blog | AIFI Map`,
    description,
    openGraph: {
      title: `${label} — AIFI Map Blog`,
      description,
      type: 'website',
      siteName: 'AIFI Map',
      images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} — AIFI Map Blog`,
      description,
      images: ['/og/default.png'],
    },
  };
}

export default function BlogCategoryPage({ params }: { params: { category: string } }) {
  const category = params.category as BlogCategory;
  if (!validCategories.includes(category)) notFound();

  const label = BLOG_CATEGORY_LABELS[category];
  const color = BLOG_CATEGORY_COLORS[category];
  const description = BLOG_CATEGORY_DESCRIPTIONS[category];
  const categoryPosts = getPostsByCategory(category);
  const categoryStats = getBlogCategoryStats();

  const counts: Record<string, number> = {};
  for (const stat of categoryStats) {
    counts[stat.category] = stat.count;
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} — AIFI Map Blog`,
    description,
    url: `https://aifimap.com/blog/category/${category}`,
    isPartOf: {
      '@type': 'Blog',
      name: 'AIFI Map Blog',
      url: 'https://aifimap.com/blog',
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categoryPosts.length,
      itemListElement: categoryPosts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://aifimap.com/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aifimap.com/blog' },
      { '@type': 'ListItem', position: 3, name: label, item: `https://aifimap.com/blog/category/${category}` },
    ],
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-background to-background" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-8">
          <Breadcrumbs items={[
            { label: 'Blog', href: '/blog' },
            { label: label },
          ]} />

          <div className="flex items-center gap-3 mb-2">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: `${color}15`,
                color: color,
                border: `1px solid ${color}30`,
              }}
            >
              {label}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            {label}
          </h1>
          <p className="text-text-muted text-[0.9375rem] leading-relaxed mt-2 max-w-xl">
            {description}
          </p>

          <div className="flex items-center gap-6 mt-4 text-sm text-text-faint">
            <span><span className="text-text-primary font-semibold">{categoryPosts.length}</span> {categoryPosts.length === 1 ? 'article' : 'articles'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {/* Category tabs */}
        <div className="mb-8">
          <BlogCategoryTabs activeCategory={category} counts={counts} />
        </div>

        {categoryPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg mb-2">No articles in this category yet</p>
            <p className="text-text-faint text-sm">Check back soon or browse other categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryPosts.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
