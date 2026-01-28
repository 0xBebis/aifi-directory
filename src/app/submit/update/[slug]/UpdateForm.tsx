'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { segments, layers } from '@/lib/data';
import { COMPANY_TYPE_LABELS, FUNDING_STAGE_LABELS, AI_TYPE_LABELS, REGION_LABELS, EMPLOYEE_RANGE_LABELS, CompanyType, FundingStage, AIType, Region, EmployeeRange, Project } from '@/types';

const GITHUB_REPO = '0xBebis/aifi-directory';

interface UpdateFormProps {
  project: Project;
}

export default function UpdateForm({ project }: UpdateFormProps) {
  const [formData, setFormData] = useState({
    website: project.website || '',
    tagline: project.tagline || '',
    description: project.description || '',
    summary: project.summary || '',
    segment: project.segment || '',
    layer: project.layer || '',
    company_type: (project.company_type || '') as CompanyType | '',
    funding_stage: (project.funding_stage || '') as FundingStage | '',
    founded: project.founded?.toString() || '',
    hq_country: project.hq_country || '',
    hq_city: project.hq_city || '',
    crypto: project.crypto || false,
    ai_types: (project.ai_types || []) as AIType[],
    region: (project.region || '') as Region | '',
    employees: (project.employees || '') as EmployeeRange | '',
    funding: project.funding?.toString() || '',
    last_funding_date: project.last_funding_date || '',
    valuation: project.valuation?.toString() || '',
    defunct: project.defunct || false,
    twitter: project.twitter || '',
    linkedin: project.linkedin || '',
    updateReason: '',
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

    // Build the changes object - only include fields that differ from original
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const updatedProject: Record<string, unknown> = {
      slug: project.slug,
      name: project.name,
    };

    // Check each field for changes
    const checkField = (key: string, originalValue: unknown, newValue: unknown) => {
      // Normalize empty strings and undefined
      const normalizedOriginal = originalValue === undefined || originalValue === '' ? null : originalValue;
      const normalizedNew = newValue === '' ? null : newValue;

      if (normalizedOriginal !== normalizedNew) {
        changes[key] = { from: normalizedOriginal, to: normalizedNew };
      }

      // Always include in updated project if has value
      if (normalizedNew !== null) {
        updatedProject[key] = newValue;
      }
    };

    checkField('website', project.website, formData.website);
    checkField('tagline', project.tagline, formData.tagline);
    checkField('description', project.description, formData.description);
    checkField('summary', project.summary, formData.summary);
    checkField('segment', project.segment, formData.segment);
    checkField('layer', project.layer, formData.layer);
    checkField('company_type', project.company_type, formData.company_type);
    checkField('funding_stage', project.funding_stage, formData.funding_stage);
    checkField('founded', project.founded, formData.founded ? parseInt(formData.founded) : null);
    checkField('hq_country', project.hq_country, formData.hq_country);
    checkField('hq_city', project.hq_city, formData.hq_city);
    checkField('crypto', project.crypto, formData.crypto || null);
    checkField('region', project.region, formData.region);
    checkField('employees', project.employees, formData.employees);
    checkField('funding', project.funding, formData.funding ? parseInt(formData.funding) : null);
    checkField('last_funding_date', project.last_funding_date, formData.last_funding_date);
    checkField('valuation', project.valuation, formData.valuation ? parseInt(formData.valuation) : null);
    checkField('defunct', project.defunct, formData.defunct || null);
    checkField('twitter', project.twitter, formData.twitter.replace(/^@/, '') || null);
    checkField('linkedin', project.linkedin, formData.linkedin);

    // ai_types requires array comparison
    const origTypes = JSON.stringify((project.ai_types || []).sort());
    const newTypes = JSON.stringify([...formData.ai_types].sort());
    if (origTypes !== newTypes) {
      changes['ai_types'] = { from: project.ai_types || [], to: formData.ai_types };
    }
    if (formData.ai_types.length > 0) {
      updatedProject.ai_types = formData.ai_types;
    }

    // Ensure required fields are in the updated project
    updatedProject.tagline = formData.tagline;
    updatedProject.segment = formData.segment;
    updatedProject.layer = formData.layer;

    // Build changes summary
    const changesList = Object.entries(changes).map(([field, { from, to }]) => {
      const fromStr = from === null ? '(empty)' : String(from);
      const toStr = to === null ? '(empty)' : String(to);
      return `- **${field}**: ${fromStr} → ${toStr}`;
    }).join('\n');

    // Format JSON nicely
    const jsonStr = JSON.stringify(updatedProject, null, 2);

    // Build issue body
    const issueBody = `## Update Request: ${project.name}

**Project:** [${project.name}](/p/${project.slug})
**Slug:** \`${project.slug}\`

### Reason for Update
${formData.updateReason || 'Not specified'}

### Requested Changes
${changesList || 'No changes detected'}

---

### Updated JSON for \`projects.json\`

\`\`\`json
${jsonStr}
\`\`\`

---
${formData.email ? `\n**Submitter contact:** ${formData.email}` : ''}
*Submitted via AIFI directory update form*`;

    // Build GitHub issue URL
    const issueTitle = encodeURIComponent(`[Update] ${project.name}`);
    const issueBodyEncoded = encodeURIComponent(issueBody);
    const labels = encodeURIComponent('update-request');

    const githubUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${issueTitle}&body=${issueBodyEncoded}&labels=${labels}`;

    // Open in new tab
    window.open(githubUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-14">
      {/* Back Link */}
      <Link
        href={`/p/${project.slug}`}
        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {project.name}
      </Link>

      {/* Eyebrow */}
      <p className="label-refined mb-4 text-accent">
        Request Update
      </p>

      <h1 className="headline-display mb-4">
        Update {project.name}
      </h1>
      <p className="text-lg text-text-muted mb-10 leading-relaxed">
        Help us keep the directory accurate by suggesting updates to this company&apos;s information.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Update Reason */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            What needs updating?
          </h2>

          <div>
            <label htmlFor="updateReason" className={labelStyles}>
              Reason for Update <span className="text-accent">*</span>
            </label>
            <textarea
              id="updateReason"
              name="updateReason"
              rows={2}
              required
              value={formData.updateReason}
              onChange={handleChange}
              className={inputStyles}
              placeholder="e.g., Company raised a new funding round, website changed, incorrect information..."
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Basic Information
          </h2>

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
              One-Line Description
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
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
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={inputStyles}
              placeholder="A detailed description of what the company does..."
            />
          </div>

          <div>
            <label htmlFor="summary" className={labelStyles}>
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              value={formData.summary}
              onChange={handleChange}
              className={inputStyles}
              placeholder="A detailed description of the company..."
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
                Primary Segment
              </label>
              <select
                id="segment"
                name="segment"
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
                Primary Layer
              </label>
              <select
                id="layer"
                name="layer"
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

        {/* Financial */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border/50 pb-2">
            Financial Information
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="funding" className={labelStyles}>
                Total Funding (USD)
              </label>
              <input
                type="number"
                id="funding"
                name="funding"
                min="0"
                value={formData.funding}
                onChange={handleChange}
                className={inputStyles}
                placeholder="50000000"
              />
              <p className="text-xs text-text-faint mt-1">Raw number, e.g. 50000000 for $50M</p>
            </div>

            <div>
              <label htmlFor="valuation" className={labelStyles}>
                Valuation (USD)
              </label>
              <input
                type="number"
                id="valuation"
                name="valuation"
                min="0"
                value={formData.valuation}
                onChange={handleChange}
                className={inputStyles}
                placeholder="500000000"
              />
              <p className="text-xs text-text-faint mt-1">Latest known valuation</p>
            </div>
          </div>

          <div>
            <label htmlFor="last_funding_date" className={labelStyles}>
              Last Funding Date
            </label>
            <input
              type="text"
              id="last_funding_date"
              name="last_funding_date"
              value={formData.last_funding_date}
              onChange={handleChange}
              className={inputStyles}
              placeholder="2025-03"
            />
            <p className="text-xs text-text-faint mt-1">Format: YYYY or YYYY-MM</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="defunct"
              name="defunct"
              checked={formData.defunct}
              onChange={handleChange}
              className="w-5 h-5 rounded border-border bg-surface-2 text-accent focus:ring-accent/30 cursor-pointer"
            />
            <label htmlFor="defunct" className="text-sm text-text-secondary cursor-pointer">
              This company is no longer operating
            </label>
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
              In case we have questions about your update request
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button
            type="submit"
            disabled={!formData.updateReason}
            className="w-full px-5 py-4 bg-accent text-white text-base font-semibold rounded-lg hover:bg-accent-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Update Request
          </button>

          <p className="text-sm text-text-faint text-center">
            This will open GitHub to create an issue. You&apos;ll need a GitHub account to submit.
          </p>
        </div>
      </form>
    </div>
  );
}
