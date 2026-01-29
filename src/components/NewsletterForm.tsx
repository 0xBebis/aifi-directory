'use client';

import { useState, FormEvent } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'inline' | 'stacked';
}

export default function NewsletterForm({ variant = 'inline' }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const form = e.currentTarget;
    const email = new FormData(form).get('email') as string;

    try {
      const res = await fetch('https://buttondown.com/api/emails/embed-subscribe/aifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
        mode: 'no-cors',
      });

      // Buttondown embed endpoint doesn't return JSON in no-cors mode,
      // but a successful POST will have an opaque response (type: 'opaque')
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 ${variant === 'stacked' ? 'justify-center' : ''}`} role="status" aria-live="polite">
        <Check className="w-4 h-4 text-positive" aria-hidden="true" />
        <span className="text-sm text-text-secondary">Check your email to confirm!</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={variant === 'stacked' ? 'flex flex-col gap-3 max-w-sm mx-auto' : 'flex gap-2'}
    >
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-faint focus:border-accent/50 focus:outline-none transition-colors"
          disabled={status === 'loading'}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-muted transition-colors shrink-0 disabled:opacity-60"
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          'Subscribe'
        )}
      </button>
      {status === 'error' && (
        <div className={`flex items-center gap-1.5 text-negative text-xs ${variant === 'stacked' ? 'justify-center' : ''}`} role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Something went wrong. Please try again.</span>
        </div>
      )}
    </form>
  );
}
