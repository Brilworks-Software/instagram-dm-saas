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
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(defaultOpen ? undefined : 0);

  React.useEffect(() => {
    if (!contentRef.current) return;
    
    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        'border border-border rounded-lg transition-all',
        'bg-background-elevated hover:bg-background-tertiary overflow-hidden'
      )}
      itemScope
      itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
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
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: height !== undefined ? `${height}px` : 'none' }}
        itemScope
        itemType="https://schema.org/Answer"
        itemProp="acceptedAnswer"
      >
        <div className="px-6 pb-5 pt-2">
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
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

