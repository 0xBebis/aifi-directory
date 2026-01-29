'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from './types';

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className={`border rounded-xl overflow-hidden transition-all duration-300 ${
            openIndex === i
              ? 'bg-surface-2/30 border-accent/20'
              : 'border-border/30 bg-transparent hover:bg-surface/50'
          }`}
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-4 px-5 text-left group"
          >
            <span className={`text-[0.9375rem] font-semibold transition-colors ${
              openIndex === i ? 'text-accent' : 'text-text-primary group-hover:text-accent'
            }`}>
              {faq.question}
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 ml-4 transition-all duration-300 ${
                openIndex === i ? 'rotate-180 text-accent' : 'text-text-faint group-hover:text-text-muted'
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              openIndex === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-sm text-text-secondary leading-relaxed px-5 pb-5">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
