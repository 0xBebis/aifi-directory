'use client';

import { useState, FormEvent } from 'react';
import { Mail, Check } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'inline' | 'stacked';
}

export default function NewsletterForm({ variant = 'inline' }: NewsletterFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 ${variant === 'stacked' ? 'justify-center' : ''}`}>
        <Check className="w-4 h-4 text-positive" />
        <span className="text-sm text-text-secondary">Check your email to confirm!</span>
      </div>
    );
  }

  return (
    <form
      action="https://buttondown.com/api/emails/embed-subscribe/aifi"
      method="post"
      target="_blank"
      onSubmit={handleSubmit}
      className={variant === 'stacked' ? 'flex flex-col gap-3 max-w-sm mx-auto' : 'flex gap-2'}
    >
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-faint focus:border-accent/50 focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-muted transition-colors shrink-0"
      >
        Subscribe
      </button>
    </form>
  );
}
