'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackHref?: string;
  fallbackLabel?: string;
}

export default function BackButton({ fallbackHref = '/directory', fallbackLabel = 'Back to Directory' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 text-sm tracking-wide"
    >
      <ArrowLeft className="w-4 h-4" />
      {fallbackLabel}
    </button>
  );
}
