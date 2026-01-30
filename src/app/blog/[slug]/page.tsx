import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  posts,
  getPost,
  getAuthor,
  getProject,
  getSegment,
  getRelatedPosts,
  formatPostDate,
  calculateReadingTime,
  generatePostFAQs,
  BUILD_DATE_ISO,
} from '@/lib/data';
import {
  BlogCategory,
  BLOG_CATEGORY_LABELS,
  BLOG_CATEGORY_COLORS,
  AI_TYPE_LABELS,
} from '@/types';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AuthorByline from '@/components/AuthorByline';
import RelatedPosts from '@/components/RelatedPosts';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: 'Article Not Found | AIFI Map' };

  const author = getAuthor(post.author_slug);
  const title = post.seo_title || `${post.title} | AIFI Map Blog`;
  const description = post.seo_description || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      siteName: 'AIFI Map',
      publishedTime: post.published_date,
      ...(post.updated_date && { modifiedTime: post.updated_date }),
      ...(author && { authors: [author.name] }),
      ...(post.tags && { tags: post.tags }),
      images: [{ url: post.cover_image || '/og/default.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [post.cover_image || '/og/default.png'],
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const author = getAuthor(post.author_slug);
  const readingTime = post.reading_time || calculateReadingTime(post.body);
  const formattedDate = formatPostDate(post.published_date);
  const formattedUpdatedDate = post.updated_date ? formatPostDate(post.updated_date) : undefined;
  const categoryLabel = BLOG_CATEGORY_LABELS[post.category];
  const categoryColor = BLOG_CATEGORY_COLORS[post.category];
  const relatedPosts = getRelatedPosts(post, 3);
  const faqs = generatePostFAQs(post);

  // Cross-linked entities
  const relatedCompanies = (post.related_companies || []).map(slug => getProject(slug)).filter(Boolean);
  const relatedSegments = (post.related_segments || []).map(slug => getSegment(slug)).filter(Boolean);
  const hasSidebar = relatedCompanies.length > 0 || relatedSegments.length > 0 || (post.related_ai_types && post.related_ai_types.length > 0);

  const wordCount = post.body.trim().split(/\s+/).length;

  // JSON-LD: BlogPosting
  const blogPostingJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `https://aifimap.com/blog/${post.slug}`,
    datePublished: post.published_date,
    dateModified: post.updated_date || post.published_date,
    wordCount,
    articleSection: categoryLabel,
    ...(post.tags && { keywords: post.tags.join(', ') }),
    ...(post.cover_image && { image: `https://aifimap.com${post.cover_image}` }),
    publisher: {
      '@type': 'Organization',
      name: 'AIFI Map',
      url: 'https://aifimap.com',
    },
  };

  if (author) {
    blogPostingJsonLd.author = {
      '@type': 'Person',
      name: author.name,
      jobTitle: author.title,
      description: author.bio,
      ...(author.expertise && author.expertise.length > 0 && { knowsAbout: author.expertise }),
      url: `https://aifimap.com/blog/author/${author.slug}`,
      ...(author.twitter && { sameAs: [`https://twitter.com/${author.twitter.replace(/^@/, '')}`] }),
    };
  }

  if (relatedCompanies.length > 0) {
    blogPostingJsonLd.mentions = relatedCompanies.map(c => ({
      '@type': 'Organization',
      name: c!.name,
      url: `https://aifimap.com/p/${c!.slug}`,
    }));
  }

  // JSON-LD: FAQPage
  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  } : null;

  // JSON-LD: Breadcrumbs
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aifimap.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://aifimap.com/blog/${post.slug}` },
    ],
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={blogPostingJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <JsonLd data={breadcrumbJsonLd} />

      {/* ── Article Header ── */}
      <div className="border-b border-border/50">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-6 pb-10">
          <Breadcrumbs items={[
            { label: 'Blog', href: '/blog' },
            { label: categoryLabel, href: `/blog/category/${post.category}` },
            { label: post.title },
          ]} />

          <header className="max-w-3xl">
            {/* Category badge */}
            <div className="mb-5">
              <Link
                href={`/blog/category/${post.category}`}
                className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}30`,
                }}
              >
                {categoryLabel}
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-extrabold tracking-tight text-text-primary mb-5 leading-[1.15]" style={{ textWrap: 'balance' } as React.CSSProperties}>
              {post.title}
            </h1>

            <p className="text-lg text-text-muted leading-relaxed mb-8 max-w-2xl">
              {post.excerpt}
            </p>

            {/* Author byline */}
            {author && (
              <AuthorByline
                author={author}
                date={post.published_date}
                formattedDate={formattedDate}
                readingTime={readingTime}
                updatedDate={post.updated_date}
                formattedUpdatedDate={formattedUpdatedDate}
              />
            )}
          </header>
        </div>
      </div>

      {/* ── Cover Image ── */}
      {post.cover_image && (
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 -mt-1 pt-8">
          <div className="rounded-xl overflow-hidden border border-border">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* ── Article Body + Sidebar ── */}
      <article className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-10 pb-6">
        <div className="flex gap-12">
          {/* Article body */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <MarkdownRenderer content={post.body} />
          </div>

          {/* Sidebar */}
          {hasSidebar && (
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                {relatedCompanies.length > 0 && (
                  <div className="rounded-lg border border-border/60 bg-surface/50 p-5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text-faint mb-3.5">
                      Companies Mentioned
                    </h3>
                    <div className="space-y-2.5">
                      {relatedCompanies.map(c => (
                        <Link
                          key={c!.slug}
                          href={`/p/${c!.slug}`}
                          className="flex items-center gap-2.5 text-[13px] text-text-muted hover:text-accent transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 text-text-faint flex-shrink-0" />
                          {c!.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {relatedSegments.length > 0 && (
                  <div className="rounded-lg border border-border/60 bg-surface/50 p-5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text-faint mb-3.5">
                      Segments
                    </h3>
                    <div className="space-y-2.5">
                      {relatedSegments.map(s => (
                        <Link
                          key={s!.slug}
                          href={`/segments/${s!.slug}`}
                          className="flex items-center gap-2.5 text-[13px] text-text-muted hover:text-accent transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 text-text-faint flex-shrink-0" />
                          {s!.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {post.related_ai_types && post.related_ai_types.length > 0 && (
                  <div className="rounded-lg border border-border/60 bg-surface/50 p-5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text-faint mb-3.5">
                      AI Technologies
                    </h3>
                    <div className="space-y-2.5">
                      {post.related_ai_types.map(t => (
                        <Link
                          key={t}
                          href={`/ai-types/${t}`}
                          className="flex items-center gap-2.5 text-[13px] text-text-muted hover:text-accent transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 text-text-faint flex-shrink-0" />
                          {AI_TYPE_LABELS[t]}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </article>

      {/* ── Post Footer: Author Card, Tags, FAQs, Related ── */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-16">
        {/* End-of-article marker */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-text-faint" />
            <span className="w-1 h-1 rounded-full bg-text-faint" />
            <span className="w-1 h-1 rounded-full bg-text-faint" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Author bio card */}
        {author && (
          <div className="mb-10 rounded-xl border border-border bg-surface p-6 sm:p-7">
            <div className="flex gap-4 sm:gap-5">
              <Link
                href={`/blog/author/${author.slug}`}
                className="flex-shrink-0 w-14 h-14 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-muted font-semibold text-lg hover:border-accent/30 transition-colors"
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
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <Link
                    href={`/blog/author/${author.slug}`}
                    className="text-base font-semibold text-text-primary hover:text-accent transition-colors"
                  >
                    {author.name}
                  </Link>
                  {author.title && (
                    <span className="text-sm text-text-faint hidden sm:inline">{author.title}</span>
                  )}
                </div>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-3">
                  {author.bio}
                </p>
                {author.expertise && author.expertise.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {author.expertise.slice(0, 4).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-surface-2 text-[11px] text-text-faint font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-md bg-surface-2/80 border border-border/50 text-xs text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="mb-12 pt-8 border-t border-border/50">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-text-faint mb-6">Common questions about the topics covered in this article.</p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group rounded-lg border border-border/60 bg-surface/50 overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors select-none">
                    <span className="pr-4">{faq.question}</span>
                    <ChevronRight className="w-4 h-4 text-text-faint group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed border-t border-border/30 pt-4">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Back to blog */}
        <div className="mb-10 pt-2">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-text-faint hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all articles
          </Link>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-border/50">
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}
      </div>
    </main>
  );
}
