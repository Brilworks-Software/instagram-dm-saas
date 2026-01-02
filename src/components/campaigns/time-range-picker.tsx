'use client';

import { useState, useEffect, useRef } from "react";
import { Clock, Search, ChevronDown, X } from "lucide-react";
import ReactSlider from "react-slider";
import { cn } from "@/lib/utils";
import {
  TIMEZONES,
  getUserTimezone,
  getTimezoneOffset,
  type TimezoneOption,
} from "@/lib/campaigns/timezones";

interface TimeRangePickerProps {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onTimezoneChange: (tz: string) => void;
  className?: string;
}

// Re-export for backward compatibility
export { getUserTimezone };

// Searchable Timezone Selector Component
interface SearchableTimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
}

function SearchableTimezoneSelector({
  value,
  onChange,
}: SearchableTimezoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === value);
  const selectedLabel = selectedTimezone
    ? `${selectedTimezone.label}${
        selectedTimezone.abbreviation
          ? ` (${selectedTimezone.abbreviation})`
          : ""
      }`
    : value;

  // Filter timezones based on search query
  const filteredTimezones = TIMEZONES.filter((tz) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tz.label.toLowerCase().includes(query) ||
      tz.value.toLowerCase().includes(query) ||
      tz.region.toLowerCase().includes(query) ||
      (tz.abbreviation && tz.abbreviation.toLowerCase().includes(query))
    );
  });

  // Group filtered timezones by region
  const groupedTimezones = filteredTimezones.reduce((acc, tz) => {
    if (!acc[tz.region]) {
      acc[tz.region] = [];
    }
    acc[tz.region].push(tz);
    return acc;
  }, {} as Record<string, TimezoneOption[]>);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(0);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(0);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredTimezones.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredTimezones[highlightedIndex]) {
          onChange(filteredTimezones[highlightedIndex].value);
          setIsOpen(false);
          setSearchQuery("");
          setHighlightedIndex(0);
        }
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (timezone: string) => {
    onChange(timezone);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  let currentIndex = 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-accent outline-none focus:ring-2 focus:ring-accent/20 flex items-center justify-between transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select timezone">
        <span className="text-left truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search timezones..."
                className="w-full pl-9 pr-8 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
                aria-label="Search timezones"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-background-elevated rounded"
                  aria-label="Clear search">
                  <X className="h-3 w-3 text-foreground-muted" />
                </button>
              )}
            </div>
          </div>

          {/* Timezone List */}
          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            role="listbox"
            aria-label="Timezone options">
            {Object.keys(groupedTimezones).length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-foreground-muted">
                No timezones found
              </div>
            ) : (
              Object.entries(groupedTimezones).map(([region, timezones]) => (
                <div key={region}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-foreground-muted bg-background-elevated sticky top-0">
                    {region}
                  </div>
                  {timezones.map((tz) => {
                    const index = currentIndex++;
                    const isSelected = tz.value === value;
                    const isHighlighted = index === highlightedIndex;
                    const offset = getTimezoneOffset(tz.value);
                    const displayLabel = `${tz.label}${
                      tz.abbreviation ? ` (${tz.abbreviation})` : ""
                    }${offset ? ` ${offset}` : ""}`;

                    return (
                      <button
                        key={tz.value}
                        type="button"
                        data-index={index}
                        onClick={() => handleSelect(tz.value)}
                        className={cn(
                          "w-full px-4 py-2.5 text-left text-sm transition-colors",
                          "hover:bg-background-elevated focus:bg-background-elevated focus:outline-none",
                          isSelected && "bg-accent/10 text-accent font-medium",
                          isHighlighted &&
                            !isSelected &&
                            "bg-background-elevated"
                        )}
                        role="option"
                        aria-selected={isSelected}>
                        {displayLabel}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Time range: 8:00 AM (480 minutes) to 10:00 PM (1320 minutes)
const MIN_TIME = 8 * 60; // 8:00 AM in minutes
const MAX_TIME = 22 * 60; // 10:00 PM in minutes

export function TimeRangePicker({
  startTime,
  endTime,
  timezone,
  onStartTimeChange,
  onEndTimeChange,
  onTimezoneChange,
  className,
}: TimeRangePickerProps) {
  // Convert time to minutes
  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Convert minutes to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Clamp time to valid range (8:00 - 22:00)
  const clampTime = (minutes: number): number => {
    return Math.max(MIN_TIME, Math.min(MAX_TIME, minutes));
  };

  const [startMinutes, setStartMinutes] = useState(() => {
    const minutes = timeToMinutes(startTime);
    return clampTime(minutes);
  });
  const [endMinutes, setEndMinutes] = useState(() => {
    const minutes = timeToMinutes(endTime);
    return clampTime(minutes);
  });

  // Update when props change
  useEffect(() => {
    const start = clampTime(timeToMinutes(startTime));
    const end = clampTime(timeToMinutes(endTime));
    setStartMinutes(start);
    setEndMinutes(end);
  }, [startTime, endTime]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${String(mins).padStart(2, "0")} ${period}`;
  };

  const handleChange = (values: number[]) => {
    const [start, end] = values;
    const clampedStart = Math.min(start, end - 15); // Ensure 15 min gap
    const clampedEnd = Math.max(end, start + 15); // Ensure 15 min gap

    setStartMinutes(clampedStart);
    setEndMinutes(clampedEnd);

    onStartTimeChange(minutesToTime(clampedStart) + ":00");
    onEndTimeChange(minutesToTime(clampedEnd) + ":00");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          <label className="text-sm font-medium text-foreground">
            Select time range for sending messages
          </label>
        </div>
        <p className="text-xs text-foreground-subtle ml-6">
          Messages will only be sent during this time window
        </p>
      </div>

      {/* Dual Range Slider */}
      <div className="space-y-4">
        <ReactSlider
          className="horizontal-slider dual-range-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={MIN_TIME}
          max={MAX_TIME}
          step={15}
          value={[startMinutes, endMinutes]}
          onChange={handleChange}
          pearling
          minDistance={15}
        />

        {/* Time Display */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex-1 text-center p-3 rounded-lg bg-background border border-border">
            <p className="text-xs text-foreground-muted mb-1.5 font-medium">
              Start Time
            </p>
            <p className="text-xl font-bold text-foreground">
              {formatTime(startMinutes)}
            </p>
          </div>
          <div className="px-4">
            <span className="text-foreground-subtle">→</span>
          </div>
          <div className="flex-1 text-center p-3 rounded-lg bg-background border border-border">
            <p className="text-xs text-foreground-muted mb-1.5 font-medium">
              End Time
            </p>
            <p className="text-xl font-bold text-foreground">
              {formatTime(endMinutes)}
            </p>
          </div>
        </div>

        {/* Time Range Labels */}
        <div className="flex items-center justify-between text-xs text-foreground-subtle px-1">
          <span>8:00 AM</span>
          <span>10:00 PM</span>
        </div>
      </div>

      {/* Timezone Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground-muted">
          Timezone
        </label>
        <SearchableTimezoneSelector
          value={timezone}
          onChange={onTimezoneChange}
        />
      </div>
    </div>
  );
}
