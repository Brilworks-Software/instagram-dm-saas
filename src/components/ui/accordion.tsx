'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  question: string;
  answer: string;
  index: number;
  defaultOpen?: boolean;
}

export function AccordionItem({ question, answer, index, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        'border border-border rounded-lg overflow-hidden transition-all',
        'bg-background-elevated hover:bg-background-tertiary'
      )}
      itemScope
      itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <h3
          className="text-lg font-semibold text-foreground pr-4"
          itemProp="name"
        >
          {question}
        </h3>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-foreground-muted flex-shrink-0 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      <div
        id={`faq-answer-${index}`}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        itemScope
        itemType="https://schema.org/Answer"
        itemProp="acceptedAnswer"
      >
        <div className="px-6 pb-4 pt-0">
          <p className="text-foreground-muted leading-relaxed" itemProp="text">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {children}
    </div>
  );
}

