'use client';

import { useState } from 'react';
import { segments, layers } from '@/lib/data';
import { COMPANY_TYPE_LABELS, FUNDING_STAGE_LABELS, AI_TYPE_LABELS, REGION_LABELS, EMPLOYEE_RANGE_LABELS, CompanyType, FundingStage, AIType, Region, EmployeeRange } from '@/types';

const GITHUB_REPO = '0xBebis/aifi-directory';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    tagline: '',
    description: '',
    summary: '',
    segment: '',
    layer: '',
    ai_types: [] as AIType[],
    company_type: '' as CompanyType | '',
    funding_stage: '' as FundingStage | '',
    region: '' as Region | '',
    employees: '' as EmployeeRange | '',
    founded: '',
    hq_country: '',
    hq_city: '',
    crypto: false,
    twitter: '',
    linkedin: '',
    email: '',
  });

  const inputStyles = "form-input";
  const selectStyles = "form-select select-glass";
  const labelStyles = "form-label";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleAiType = (type: AIType) => {
    setFormData(prev => ({
      ...prev,
      ai_types: prev.ai_types.includes(type)
        ? prev.ai_types.filter(t => t !== type)
        : [...prev.ai_types, type]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const slug = slugify(formData.name);

    // Build the project JSON
    const project: Record<string, unknown> = {
      slug,
      name: formData.name,
      tagline: formData.tagline,
      segment: formData.segment,
      layer: formData.layer,
    };

    // Add optional fields
    if (formData.website) project.website = formData.website;
    if (formData.description) project.description = formData.description;
    if (formData.summary) project.summary = formData.summary;
    if (formData.ai_types.length > 0) project.ai_types = formData.ai_types;
    if (formData.company_type) project.company_type = formData.company_type;
    if (formData.funding_stage) project.funding_stage = formData.funding_stage;
    if (formData.region) project.region = formData.region;
    if (formData.employees) project.employees = formData.employees;
    if (formData.founded) project.founded = parseInt(formData.founded);
    if (formData.hq_country) project.hq_country = formData.hq_country;
    if (formData.hq_city) project.hq_city = formData.hq_city;
    if (formData.crypto) project.crypto = true;
    if (formData.twitter) project.twitter = formData.twitter.replace(/^@/, '');
    if (formData.linkedin) project.linkedin = formData.linkedin;

    // Format JSON nicely
    const jsonStr = JSON.stringify(project, null, 2);

    // Build issue body
    const segmentName = segments.find(s => s.slug === formData.segment)?.name || formData.segment;
    const layerName = layers.find(l => l.slug === formData.layer)?.name || formData.layer;

    const issueBody = `## Company Submission

**Company:** ${formData.name}
**Website:** ${formData.website || 'Not provided'}
**Segment:** ${segmentName}
**Layer:** ${layerName}
${formData.ai_types.length > 0 ? `**AI Types:** ${formData.ai_types.map(t => AI_TYPE_LABELS[t]).join(', ')}\n` : ''}${formData.crypto ? '**Type:** Web3/Crypto\n' : ''}${formData.company_type ? `**Company Type:** ${COMPANY_TYPE_LABELS[formData.company_type]}\n` : ''}${formData.funding_stage ? `**Funding Stage:** ${FUNDING_STAGE_LABELS[formData.funding_stage]}\n` : ''}${formData.region ? `**Region:** ${REGION_LABELS[formData.region]}\n` : ''}${formData.employees ? `**Employees:** ${EMPLOYEE_RANGE_LABELS[formData.employees as EmployeeRange]}\n` : ''}${formData.founded ? `**Founded:** ${formData.founded}\n` : ''}${formData.hq_country ? `**Location:** ${formData.hq_city ? formData.hq_city + ', ' : ''}${formData.hq_country}\n` : ''}
### Description
${formData.tagline}
${formData.description ? `\n${formData.description}` : ''}
${formData.summary ? `\n### Summary\n${formData.summary}` : ''}

### Social Links
${formData.twitter ? `- Twitter: [@${formData.twitter.replace(/^@/, '')}](https://twitter.com/${formData.twitter.replace(/^@/, '')})\n` : ''}${formData.linkedin ? `- LinkedIn: ${formData.linkedin}\n` : ''}${!formData.twitter && !formData.linkedin ? 'None provided\n' : ''}
---

### JSON for \`projects.json\`

\`\`\`json
${jsonStr}
\`\`\`

---
${formData.email ? `\n**Submitter contact:** ${formData.email}` : ''}
*Submitted via AIFI directory form*`;

    // Build GitHub issue URL
    const issueTitle = encodeURIComponent(`[Submission] ${formData.name}`);
    const issueBodyEncoded = encodeURIComponent(issueBody);
    const labels = encodeURIComponent('submission');

    const githubUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${issueTitle}&body=${issueBodyEncoded}&labels=${labels}`;

    // Open in new tab
    window.open(githubUrl, '_blank');
  };

  const isFormValid = formData.name && formData.tagline && formData.segment && formData.layer;

  return (
    <div className="max-w-2xl mx-auto px-8 py-14">
      {/* Eyebrow */}
      <p className="label-refined mb-4 text-accent">
        Contribute
      </p>

      <h1 className="headline-display mb-4">
        Submit a Company
      </h1>
      <p className="text-lg text-text-muted mb-10 leading-relaxed">
        Know a company building AI + Finance products? Help us grow the directory by submitting it here.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Basic Information
          </h2>

          <div>
            <label htmlFor="name" className={labelStyles}>
              Company Name <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={inputStyles}
              placeholder="Acme AI"
            />
          </div>

          <div>
            <label htmlFor="website" className={labelStyles}>
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={inputStyles}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="tagline" className={labelStyles}>
              One-Line Description <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              required
              maxLength={140}
              value={formData.tagline}
              onChange={handleChange}
              className={inputStyles}
              placeholder="AI-powered trading platform for retail investors"
            />
            <p className="text-xs text-text-faint mt-1">{formData.tagline.length}/140 characters</p>
          </div>

          <div>
            <label htmlFor="description" className={labelStyles}>
              Full Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={inputStyles}
              placeholder="A more detailed description of what the company does..."
            />
          </div>

          <div>
            <label htmlFor="summary" className={labelStyles}>
              Editorial Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              value={formData.summary}
              onChange={handleChange}
              className={inputStyles}
              placeholder="A brief editorial summary for the directory listing..."
            />
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Classification
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="segment" className={labelStyles}>
                Primary Segment <span className="text-accent">*</span>
              </label>
              <select
                id="segment"
                name="segment"
                required
                value={formData.segment}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select...</option>
                {segments.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="layer" className={labelStyles}>
                Primary Layer <span className="text-accent">*</span>
              </label>
              <select
                id="layer"
                name="layer"
                required
                value={formData.layer}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select...</option>
                {layers.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelStyles}>
              AI Technologies
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {(Object.entries(AI_TYPE_LABELS) as [AIType, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleAiType(value)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    formData.ai_types.includes(value)
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'bg-surface-2 border-border text-text-muted hover:border-border-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-faint mt-1.5">Select all AI/ML technologies that apply</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="crypto"
              name="crypto"
              checked={formData.crypto}
              onChange={handleChange}
              className="w-5 h-5 rounded border-border bg-surface-2 text-accent focus:ring-accent/30 cursor-pointer"
            />
            <label htmlFor="crypto" className="text-sm text-text-secondary cursor-pointer">
              This is a Web3 / Crypto company
            </label>
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Company Details
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="company_type" className={labelStyles}>
                Company Type
              </label>
              <select
                id="company_type"
                name="company_type"
                value={formData.company_type}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select...</option>
                {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="funding_stage" className={labelStyles}>
                Funding Stage
              </label>
              <select
                id="funding_stage"
                name="funding_stage"
                value={formData.funding_stage}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select...</option>
                {Object.entries(FUNDING_STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label htmlFor="founded" className={labelStyles}>
                Founded Year
              </label>
              <input
                type="number"
                id="founded"
                name="founded"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.founded}
                onChange={handleChange}
                className={inputStyles}
                placeholder="2020"
              />
            </div>

            <div>
              <label htmlFor="hq_country" className={labelStyles}>
                HQ Country
              </label>
              <input
                type="text"
                id="hq_country"
                name="hq_country"
                value={formData.hq_country}
                onChange={handleChange}
                className={inputStyles}
                placeholder="US"
              />
            </div>

            <div>
              <label htmlFor="hq_city" className={labelStyles}>
                HQ City
              </label>
              <input
                type="text"
                id="hq_city"
                name="hq_city"
                value={formData.hq_city}
                onChange={handleChange}
                className={inputStyles}
                placeholder="San Francisco"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="region" className={labelStyles}>
                Region
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select...</option>
                {Object.entries(REGION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="employees" className={labelStyles}>
                Employees
              </label>
              <select
                id="employees"
                name="employees"
                value={formData.employees}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select...</option>
                {Object.entries(EMPLOYEE_RANGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Social Links
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="twitter" className={labelStyles}>
                Twitter Handle
              </label>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className={inputStyles}
                placeholder="@company"
              />
            </div>

            <div>
              <label htmlFor="linkedin" className={labelStyles}>
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className={inputStyles}
                placeholder="https://linkedin.com/company/..."
              />
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
              In case we have questions about your submission
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
            This will open GitHub to create an issue. You&apos;ll need a GitHub account to submit.
          </p>
        </div>
      </form>
    </div>
  );
}
