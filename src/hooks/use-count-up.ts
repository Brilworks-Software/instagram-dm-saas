import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function useCountUp({
  end,
  duration = 1000,
  delay = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
}: UseCountUpOptions) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
            hasAnimated.current = true;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = end;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // Easing function (easeOutExpo)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        const currentCount = startValue + (endValue - startValue) * easeProgress;
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, end, duration, delay]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toString();

  return {
    ref: elementRef,
    value: `${prefix}${displayValue}${suffix}`,
    rawValue: count,
  };
}
