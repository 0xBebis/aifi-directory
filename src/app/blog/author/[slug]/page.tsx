import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Twitter, Linkedin, Globe, ExternalLink } from 'lucide-react';
import {
  authors,
  getAuthor,
  getPostsByAuthor,
} from '@/lib/data';
import { BlogAuthor } from '@/types';
import BlogCard from '@/components/BlogCard';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

export function generateStaticParams() {
  return authors.map((author) => ({
    slug: author.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const author = getAuthor(params.slug);
  if (!author) return { title: 'Author Not Found | AIFI Map' };

  const description = `${author.bio.slice(0, 155)}${author.bio.length > 155 ? '...' : ''}`;

  return {
    title: `${author.name} — ${author.title} | AIFI Map Blog`,
    description,
    openGraph: {
      title: `${author.name} — ${author.title}`,
      description,
      type: 'profile',
      siteName: 'AIFI Map',
      images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary',
      title: `${author.name} — ${author.title}`,
      description,
    },
  };
}

export default function AuthorPage({ params }: { params: { slug: string } }) {
  const author = getAuthor(params.slug);
  if (!author) notFound();

  const authorPosts = getPostsByAuthor(author.slug);

  const sameAs: string[] = [];
  if (author.twitter) sameAs.push(`https://twitter.com/${author.twitter.replace(/^@/, '')}`);
  if (author.linkedin) sameAs.push(author.linkedin);
  if (author.website) sameAs.push(author.website);

  const personJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: author.name,
      jobTitle: author.title,
      description: author.bio,
      ...(author.expertise && author.expertise.length > 0 && { knowsAbout: author.expertise }),
      url: `https://aifimap.com/blog/author/${author.slug}`,
      ...(sameAs.length > 0 && { sameAs }),
      ...(author.company && {
        worksFor: {
          '@type': 'Organization',
          name: author.company,
        },
      }),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aifimap.com/blog' },
      { '@type': 'ListItem', position: 3, name: author.name, item: `https://aifimap.com/blog/author/${author.slug}` },
    ],
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={personJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Blog', href: '/blog' },
          { label: author.name },
        ]} />

        {/* Author profile header */}
        <div className="flex items-start gap-5 mb-10">
          <div className="flex-shrink-0 w-20 h-20 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-muted font-bold text-2xl">
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

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              {author.name}
            </h1>
            <p className="text-text-muted mt-1">
              {author.title}
              {author.company && (
                <span className="text-text-faint">
                  {' '}at {author.company}
                </span>
              )}
            </p>

            {/* Bio */}
            <p className="text-sm text-text-secondary leading-relaxed mt-3 max-w-2xl">
              {author.bio}
            </p>

            {/* Expertise */}
            {author.expertise && author.expertise.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {author.expertise.map(topic => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 rounded bg-surface-2 text-xs text-text-muted font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Social links */}
            <div className="flex items-center gap-3 mt-4">
              {author.twitter && (
                <a
                  href={`https://twitter.com/${author.twitter.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-faint hover:text-accent transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-faint hover:text-accent transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-faint hover:text-accent transition-colors"
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Author's posts */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Articles by {author.name}
            <span className="ml-2 text-sm font-normal text-text-faint">({authorPosts.length})</span>
          </h2>

          {authorPosts.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">
              No published articles yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authorPosts.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
