'use client';

import { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Type, Layout, Check } from 'lucide-react';
import { toast } from 'sonner';

type Theme = 'light' | 'dark' | 'system';
type AccentColor = 'pink' | 'purple' | 'blue' | 'green' | 'orange';

const accentColors: { name: AccentColor; color: string; hex: string }[] = [
  { name: 'pink', color: 'bg-pink-500', hex: '#ec4899' },
  { name: 'purple', color: 'bg-purple-500', hex: '#a855f7' },
  { name: 'blue', color: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'green', color: 'bg-emerald-500', hex: '#10b981' },
  { name: 'orange', color: 'bg-orange-500', hex: '#f97316' },
];

interface AppearancePreferences {
  theme: Theme;
  accentColor: AccentColor;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

const STORAGE_KEY = 'socialora_appearance_preferences';

export default function AppearancePage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accentColor, setAccentColor] = useState<AccentColor>('pink');
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const preferences: AppearancePreferences = JSON.parse(saved);
        setTheme(preferences.theme || 'dark');
        setAccentColor(preferences.accentColor || 'pink');
        setFontSize(preferences.fontSize || 'medium');
        setCompactMode(preferences.compactMode || false);
        applyPreferences(preferences);
      } catch (e) {
        console.error('Failed to load appearance preferences:', e);
      }
    } else {
      // Apply defaults
      applyPreferences({ theme: 'dark', accentColor: 'pink', fontSize: 'medium', compactMode: false });
    }
  }, []);

  // Track changes
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const preferences: AppearancePreferences = JSON.parse(saved);
        const current = { theme, accentColor, fontSize, compactMode };
        setHasChanges(JSON.stringify(current) !== JSON.stringify(preferences));
      } catch (e) {
        setHasChanges(true);
      }
    } else {
      setHasChanges(true);
    }
  }, [theme, accentColor, fontSize, compactMode]);

  // Apply preferences to the DOM
  const applyPreferences = (prefs: AppearancePreferences) => {
    const root = document.documentElement;
    const body = document.body;

    // Apply theme - remove both classes first, then add the correct one
    root.classList.remove('dark', 'light');
    if (prefs.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(prefs.theme);
    }

    // Apply accent color via CSS variable
    const selectedColor = accentColors.find(c => c.name === prefs.accentColor);
    if (selectedColor) {
      root.style.setProperty('--accent-color', selectedColor.hex);
      // Calculate hover color (lighter)
      const hoverHex = adjustBrightness(selectedColor.hex, 20);
      root.style.setProperty('--accent-hover', hoverHex);
      // Calculate muted color (lighter, more transparent)
      const mutedHex = adjustBrightness(selectedColor.hex, 40);
      root.style.setProperty('--accent-muted', mutedHex);
    }

    // Apply font size
    body.classList.remove('text-sm', 'text-base', 'text-lg');
    if (prefs.fontSize === 'small') {
      body.classList.add('text-sm');
    } else if (prefs.fontSize === 'large') {
      body.classList.add('text-lg');
    } else {
      body.classList.add('text-base');
    }

    // Apply compact mode
    body.classList.toggle('compact-mode', prefs.compactMode);
  };

  // Helper to adjust color brightness
  const adjustBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    const newHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    return '#' + newHex;
  };

  // Save preferences
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const preferences: AppearancePreferences = {
        theme,
        accentColor,
        fontSize,
        compactMode,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      applyPreferences(preferences);
      setHasChanges(false);
      toast.success('Appearance preferences saved!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Apply changes immediately when settings change (optional - for preview)
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    // Apply immediately for preview
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(newTheme);
    }
  };

  const handleAccentColorChange = (newColor: AccentColor) => {
    setAccentColor(newColor);
    // Apply immediately for preview
    const selectedColor = accentColors.find(c => c.name === newColor);
    if (selectedColor) {
      const root = document.documentElement;
      root.style.setProperty('--accent-color', selectedColor.hex);
      const hoverHex = adjustBrightness(selectedColor.hex, 20);
      root.style.setProperty('--accent-hover', hoverHex);
      const mutedHex = adjustBrightness(selectedColor.hex, 40);
      root.style.setProperty('--accent-muted', mutedHex);
    }
  };

  const handleFontSizeChange = (newSize: 'small' | 'medium' | 'large') => {
    setFontSize(newSize);
    // Apply immediately for preview
    const body = document.body;
    body.classList.remove('text-sm', 'text-base', 'text-lg');
    if (newSize === 'small') {
      body.classList.add('text-sm');
    } else if (newSize === 'large') {
      body.classList.add('text-lg');
    } else {
      body.classList.add('text-base');
    }
  };

  const handleCompactModeChange = (newValue: boolean) => {
    setCompactMode(newValue);
    // Apply immediately for preview
    document.body.classList.toggle('compact-mode', newValue);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Appearance</h1>
        <p className="text-foreground-muted">Customize the look and feel of your dashboard</p>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-border bg-background-elevated p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Theme</h2>
            <p className="text-sm text-foreground-muted">Choose your preferred color scheme</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light' as Theme, label: 'Light', icon: Sun },
            { value: 'dark' as Theme, label: 'Dark', icon: Moon },
            { value: 'system' as Theme, label: 'System', icon: Monitor },
          ].map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                  theme === option.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-background-tertiary hover:border-border-hover'
                }`}
              >
                <Icon className={`h-6 w-6 ${theme === option.value ? 'text-accent' : 'text-foreground-muted'}`} />
                <span className={`text-sm font-medium ${theme === option.value ? 'text-foreground' : 'text-foreground-muted'}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="rounded-xl border border-border bg-background-elevated p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent-muted/20 text-accent">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Accent Color</h2>
            <p className="text-sm text-foreground-muted">Choose your primary accent color</p>
          </div>
        </div>
        <div className="flex gap-3">
          {accentColors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleAccentColorChange(color.name)}
              className={`w-10 h-10 rounded-full ${color.color} transition-all relative ${
                accentColor === color.name
                  ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110'
                  : 'hover:scale-105'
              }`}
            >
              {accentColor === color.name && (
                <Check className="h-5 w-5 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="rounded-xl border border-border bg-background-elevated p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent-muted/20 text-accent">
            <Type className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Font Size</h2>
            <p className="text-sm text-foreground-muted">Adjust the text size throughout the app</p>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { value: 'small' as const, label: 'Small' },
            { value: 'medium' as const, label: 'Medium' },
            { value: 'large' as const, label: 'Large' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleFontSizeChange(option.value)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                fontSize === option.value
                  ? 'bg-accent text-white'
                  : 'bg-background-tertiary text-foreground-muted hover:bg-background-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Mode */}
      <div className="rounded-xl border border-border bg-background-elevated p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent-muted/20 text-accent">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Compact Mode</h2>
              <p className="text-sm text-foreground-muted">Reduce spacing and padding for denser UI</p>
            </div>
          </div>
          <button
            onClick={() => handleCompactModeChange(!compactMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              compactMode ? 'bg-accent' : 'bg-background-tertiary'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
              compactMode ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            hasChanges && !isSaving
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-background-tertiary text-foreground-muted cursor-not-allowed'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
