'use client';

import { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

interface Endpoint {
  label: string;
  url: string;
}

interface EndpointListProps {
  endpoints: Endpoint[];
}

function EndpointItem({ endpoint }: { endpoint: Endpoint }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayUrl = endpoint.url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');

  return (
    <div className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-2xs uppercase tracking-wider text-text-faint mb-0.5">
          {endpoint.label}
        </p>
        <p className="text-sm text-text-secondary truncate font-mono">
          {displayUrl}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-surface-2 text-text-faint hover:text-text-secondary transition-colors"
          title="Copy URL"
        >
          {copied ? <Check size={14} className="text-positive" /> : <Copy size={14} />}
        </button>
        <a
          href={endpoint.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-surface-2 text-text-faint hover:text-text-secondary transition-colors"
          title="Open in new tab"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

export default function EndpointList({ endpoints }: EndpointListProps) {
  if (endpoints.length === 0) {
    return (
      <p className="text-sm text-text-faint">No public endpoints</p>
    );
  }

  return (
    <div className="space-y-0">
      {endpoints.map((ep, i) => (
        <EndpointItem key={i} endpoint={ep} />
      ))}
    </div>
  );
}
