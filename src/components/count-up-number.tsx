'use client';

import { useCountUp } from '@/hooks/use-count-up';

interface CountUpNumberProps {
  value: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function CountUpNumber({ value, duration = 2000, delay = 0, className = '' }: CountUpNumberProps) {
  // Parse the value to extract number, prefix, and suffix
  const parseValue = (val: string) => {
    // Ensure val is a string
    const strVal = String(val || '');
    
    // Handle special cases like "24/7"
    if (strVal.includes('/')) {
      return { number: 0, prefix: '', suffix: strVal, shouldAnimate: false };
    }

    // Extract number and suffix (K+, M+, %)
    const match = strVal.match(/^(\d+(?:\.\d+)?)(K\+|M\+|%)?$/);
    if (match) {
      const num = parseFloat(match[1]);
      const suffix = match[2] || '';
      
      // Convert K and M to actual numbers for animation
      let actualNumber = num;
      if (suffix === 'K+') {
        actualNumber = num * 1000;
      } else if (suffix === 'M+') {
        actualNumber = num * 1000000;
      }

      return { 
        number: actualNumber, 
        prefix: '', 
        suffix: suffix,
        shouldAnimate: true,
        displayNumber: num,
        decimals: num % 1 !== 0 ? 1 : 0
      };
    }

    return { number: 0, prefix: '', suffix: strVal, shouldAnimate: false };
  };

  const parsed = parseValue(value);

  const countUp = useCountUp({
    end: parsed.displayNumber || parsed.number,
    duration,
    delay,
    suffix: parsed.suffix,
    prefix: parsed.prefix,
    decimals: parsed.decimals || 0,
  });

  if (!parsed.shouldAnimate) {
    return <span className={className}>{parsed.suffix}</span>;
  }

  return (
    <span ref={countUp.ref} className={className}>
      {countUp.value}
    </span>
  );
}
