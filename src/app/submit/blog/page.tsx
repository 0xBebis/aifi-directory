'use client';

import { useState } from 'react';
import { BLOG_CATEGORY_LABELS, BlogCategory, AI_TYPE_LABELS, AIType } from '@/types';
import { segments } from '@/lib/data';

const GITHUB_REPO = '0xBebis/aifi-directory';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function SubmitBlogPage() {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '' as BlogCategory | '',
    body: '',
    author_name: '',
    author_title: '',
    author_bio: '',
    author_expertise: '',
    author_twitter: '',
    author_linkedin: '',
    related_companies: '',
    related_segments: [] as string[],
    related_ai_types: [] as AIType[],
    email: '',
  });

  const inputStyles = "form-input";
  const selectStyles = "form-select select-glass";
  const labelStyles = "form-label";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSegment = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      related_segments: prev.related_segments.includes(slug)
        ? prev.related_segments.filter(s => s !== slug)
        : [...prev.related_segments, slug],
    }));
  };

  const toggleAiType = (type: AIType) => {
    setFormData(prev => ({
      ...prev,
      related_ai_types: prev.related_ai_types.includes(type)
        ? prev.related_ai_types.filter(t => t !== type)
        : [...prev.related_ai_types, type],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const postSlug = slugify(formData.title);
    const authorSlug = slugify(formData.author_name);
    const expertise = formData.author_expertise
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const postJson: Record<string, unknown> = {
      slug: postSlug,
      title: formData.title,
      excerpt: formData.excerpt,
      body: '(see markdown below)',
      category: formData.category,
      author_slug: authorSlug,
      published_date: new Date().toISOString().split('T')[0],
    };

    if (formData.related_companies) {
      postJson.related_companies = formData.related_companies.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (formData.related_segments.length > 0) postJson.related_segments = formData.related_segments;
    if (formData.related_ai_types.length > 0) postJson.related_ai_types = formData.related_ai_types;

    const authorJson: Record<string, unknown> = {
      slug: authorSlug,
      name: formData.author_name,
      title: formData.author_title,
      bio: formData.author_bio,
      expertise,
    };
    if (formData.author_twitter) authorJson.twitter = formData.author_twitter.replace(/^@/, '');
    if (formData.author_linkedin) authorJson.linkedin = formData.author_linkedin;

    const categoryLabel = formData.category ? BLOG_CATEGORY_LABELS[formData.category] : 'Uncategorized';

    const issueBody = `## Blog Post Submission

**Title:** ${formData.title}
**Category:** ${categoryLabel}
**Author:** ${formData.author_name} (${formData.author_title})
${formData.related_companies ? `**Related Companies:** ${formData.related_companies}\n` : ''}${formData.related_segments.length > 0 ? `**Related Segments:** ${formData.related_segments.join(', ')}\n` : ''}${formData.related_ai_types.length > 0 ? `**Related AI Types:** ${formData.related_ai_types.map(t => AI_TYPE_LABELS[t]).join(', ')}\n` : ''}

### Excerpt
${formData.excerpt}

### Article Body (Markdown)

${formData.body}

---

### Post JSON

\`\`\`json
${JSON.stringify(postJson, null, 2)}
\`\`\`

### Author JSON

\`\`\`json
${JSON.stringify(authorJson, null, 2)}
\`\`\`

---
${formData.email ? `\n**Contact:** ${formData.email}` : ''}
*Submitted via AIFI Map blog submission form*`;

    const issueTitle = encodeURIComponent(`[Blog] ${formData.title}`);
    const issueBodyEncoded = encodeURIComponent(issueBody);
    const labels = encodeURIComponent('blog-submission');

    const githubUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${issueTitle}&body=${issueBodyEncoded}&labels=${labels}`;
    window.open(githubUrl, '_blank');
  };

  const isFormValid = formData.title && formData.excerpt && formData.category && formData.body && formData.author_name && formData.author_title && formData.author_bio;

  return (
    <div className="max-w-2xl mx-auto px-8 py-14">
      <p className="label-refined mb-4 text-accent">Contribute</p>

      <h1 className="headline-display mb-4">Submit a Blog Post</h1>
      <p className="text-lg text-text-muted mb-6 leading-relaxed">
        Share your analysis, insights, or research on AI + Finance. Articles are reviewed and published by the AIFI team.
      </p>

      <div className="mb-10 p-4 rounded-lg border border-accent/20 bg-accent/5">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-accent">How it works:</span> Fill out this form and submit via GitHub Issues.
          The editorial team will review your submission and, if approved, add it to the blog.
          You&apos;ll need a{' '}
          <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            GitHub account
          </a>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Article Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Article
          </h2>

          <div>
            <label htmlFor="title" className={labelStyles}>
              Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className={inputStyles}
              placeholder="The Rise of Agentic AI in Financial Services"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className={labelStyles}>
              Excerpt <span className="text-accent">*</span>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={2}
              value={formData.excerpt}
              onChange={handleChange}
              className={inputStyles}
              placeholder="A brief summary of the article (1-2 sentences)"
            />
          </div>

          <div>
            <label htmlFor="category" className={labelStyles}>
              Category <span className="text-accent">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className={selectStyles}
            >
              <option value="">Select...</option>
              {(Object.entries(BLOG_CATEGORY_LABELS) as [BlogCategory, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="body" className={labelStyles}>
              Article Body (Markdown) <span className="text-accent">*</span>
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={12}
              value={formData.body}
              onChange={handleChange}
              className={`${inputStyles} font-mono text-sm`}
              placeholder="Write your article in Markdown format..."
            />
            <p className="text-xs text-text-faint mt-1">
              Supports full Markdown: headings, bold, links, code blocks, lists, etc.
            </p>
          </div>
        </div>

        {/* Author Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Author
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="author_name" className={labelStyles}>
                Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="author_name"
                name="author_name"
                required
                value={formData.author_name}
                onChange={handleChange}
                className={inputStyles}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label htmlFor="author_title" className={labelStyles}>
                Title / Role <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="author_title"
                name="author_title"
                required
                value={formData.author_title}
                onChange={handleChange}
                className={inputStyles}
                placeholder="Financial AI Researcher"
              />
            </div>
          </div>

          <div>
            <label htmlFor="author_bio" className={labelStyles}>
              Bio <span className="text-accent">*</span>
            </label>
            <textarea
              id="author_bio"
              name="author_bio"
              required
              rows={3}
              value={formData.author_bio}
              onChange={handleChange}
              className={inputStyles}
              placeholder="A brief bio highlighting your expertise..."
            />
          </div>

          <div>
            <label htmlFor="author_expertise" className={labelStyles}>
              Areas of Expertise
            </label>
            <input
              type="text"
              id="author_expertise"
              name="author_expertise"
              value={formData.author_expertise}
              onChange={handleChange}
              className={inputStyles}
              placeholder="Machine Learning, Risk Management, Trading Systems"
            />
            <p className="text-xs text-text-faint mt-1">Comma-separated topics</p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="author_twitter" className={labelStyles}>
                Twitter Handle
              </label>
              <input
                type="text"
                id="author_twitter"
                name="author_twitter"
                value={formData.author_twitter}
                onChange={handleChange}
                className={inputStyles}
                placeholder="@handle"
              />
            </div>
            <div>
              <label htmlFor="author_linkedin" className={labelStyles}>
                LinkedIn URL
              </label>
              <input
                type="url"
                id="author_linkedin"
                name="author_linkedin"
                value={formData.author_linkedin}
                onChange={handleChange}
                className={inputStyles}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </div>

        {/* Cross-linking */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Cross-References
          </h2>

          <div>
            <label htmlFor="related_companies" className={labelStyles}>
              Related Companies
            </label>
            <input
              type="text"
              id="related_companies"
              name="related_companies"
              value={formData.related_companies}
              onChange={handleChange}
              className={inputStyles}
              placeholder="stripe, plaid, brex"
            />
            <p className="text-xs text-text-faint mt-1">Comma-separated slugs from the directory</p>
          </div>

          <div>
            <label className={labelStyles}>Related Segments</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {segments.map(s => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => toggleSegment(s.slug)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    formData.related_segments.includes(s.slug)
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'bg-surface-2 border-border text-text-muted hover:border-border-muted'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelStyles}>Related AI Technologies</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {(Object.entries(AI_TYPE_LABELS) as [AIType, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleAiType(value)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    formData.related_ai_types.includes(value)
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'bg-surface-2 border-border text-text-muted hover:border-border-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Your Contact
          </h2>
          <div>
            <label htmlFor="email" className={labelStyles}>
              Email <span className="text-text-faint">(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyles}
              placeholder="you@example.com"
            />
            <p className="text-sm text-text-faint mt-2">
              For follow-up questions about your submission
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full px-5 py-4 bg-accent text-white text-base font-semibold rounded-lg hover:bg-accent-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit via GitHub
          </button>
          <p className="text-sm text-text-faint text-center">
            This will open GitHub to create an issue. The editorial team will review and publish approved posts.
          </p>
        </div>
      </form>
    </div>
  );
}
