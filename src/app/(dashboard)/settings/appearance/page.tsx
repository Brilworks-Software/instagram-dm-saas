'use client';

import { useState } from 'react';
import { Palette, Sun, Moon, Monitor, Type, Layout } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type AccentColor = 'pink' | 'purple' | 'blue' | 'green' | 'orange';

const accentColors: { name: AccentColor; color: string }[] = [
  { name: 'pink', color: 'bg-pink-500' },
  { name: 'purple', color: 'bg-purple-500' },
  { name: 'blue', color: 'bg-blue-500' },
  { name: 'green', color: 'bg-emerald-500' },
  { name: 'orange', color: 'bg-orange-500' },
];

export default function AppearancePage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accentColor, setAccentColor] = useState<AccentColor>('pink');
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Appearance</h1>
        <p className="text-zinc-400">Customize the look and feel of your dashboard</p>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Theme</h2>
            <p className="text-sm text-zinc-500">Choose your preferred color scheme</p>
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
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                  theme === option.value
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                <Icon className={`h-6 w-6 ${theme === option.value ? 'text-pink-400' : 'text-zinc-400'}`} />
                <span className={`text-sm font-medium ${theme === option.value ? 'text-white' : 'text-zinc-400'}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Accent Color</h2>
            <p className="text-sm text-zinc-500">Choose your primary accent color</p>
          </div>
        </div>
        <div className="flex gap-3">
          {accentColors.map((color) => (
            <button
              key={color.name}
              onClick={() => setAccentColor(color.name)}
              className={`w-10 h-10 rounded-full ${color.color} transition-all ${
                accentColor === color.name
                  ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110'
                  : 'hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
            <Type className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Font Size</h2>
            <p className="text-sm text-zinc-500">Adjust the text size throughout the app</p>
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
              onClick={() => setFontSize(option.value)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                fontSize === option.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Mode */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Compact Mode</h2>
              <p className="text-sm text-zinc-500">Reduce spacing and padding for denser UI</p>
            </div>
          </div>
          <button
            onClick={() => setCompactMode(!compactMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              compactMode ? 'bg-pink-500' : 'bg-zinc-700'
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
        <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
