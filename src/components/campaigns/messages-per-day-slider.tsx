'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ReactSlider from 'react-slider';
import { cn } from '@/lib/utils';

interface MessagesPerDaySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function MessagesPerDaySlider({
  value,
  onChange,
  className,
}: MessagesPerDaySliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" />
          <label className="text-sm font-medium text-foreground">
            Messages per day (per account)
          </label>
        </div>
        <p className="text-xs text-foreground-subtle ml-6">
          Set the daily message limit for each Instagram account
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium text-foreground-muted">0</span>
          <div className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
            <span className="text-2xl font-bold text-accent">{localValue}</span>
          </div>
          <span className="text-sm font-medium text-foreground-muted">40</span>
        </div>

        <ReactSlider
          className="horizontal-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={0}
          max={40}
          value={localValue}
          onChange={handleChange}
        />

        <div className="flex items-center justify-between text-xs text-foreground-subtle">
          <span>No limit</span>
          <span className="text-center">
            {localValue} messages/day per account
            <br />
            <span className="text-foreground-muted">
              (Total depends on number of accounts selected)
            </span>
          </span>
          <span>Maximum</span>
        </div>
      </div>

      <p className="text-xs text-foreground-subtle">
        This limit applies to each account independently. If you select 2
        accounts with 35 messages/day, each account can send 35 messages (total:
        70/day).
      </p>
    </div>
  );
}
