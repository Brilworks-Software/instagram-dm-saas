'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Volume2 } from 'lucide-react';
import { api } from '@/lib/api';

interface NotificationSetting {
  id: string;
  type: string; // Backend enum value
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

const NOTIFICATION_TYPES = [
  {
    id: 'new_message',
    type: 'NEW_MESSAGE',
    title: 'New Messages',
    description: 'When you receive a new Instagram DM',
    defaults: { email: true, push: true, inApp: true },
  },
  {
    id: 'campaign_complete',
    type: 'CAMPAIGN_COMPLETE',
    title: 'Campaign Completed',
    description: 'When a campaign finishes sending all messages',
    defaults: { email: true, push: false, inApp: true },
  },
  {
    id: 'new_follower',
    type: 'NEW_FOLLOWER',
    title: 'New Followers',
    description: 'When someone new follows your Instagram account',
    defaults: { email: false, push: true, inApp: true },
  },
  {
    id: 'weekly_report',
    type: 'WEEKLY_REPORT',
    title: 'Weekly Reports',
    description: 'Weekly summary of your Instagram DM performance',
    defaults: { email: true, push: false, inApp: false },
  },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const preferences = await api.getNotificationPreferences();
      
      // Map preferences to settings
      const mappedSettings = NOTIFICATION_TYPES.map(typeDef => {
        const pref = preferences.find((p: any) => p.type === typeDef.type);
        return {
          id: typeDef.id,
          type: typeDef.type,
          title: typeDef.title,
          description: typeDef.description,
          email: pref?.email ?? typeDef.defaults.email,
          push: pref?.push ?? typeDef.defaults.push,
          inApp: pref?.inApp ?? typeDef.defaults.inApp,
        };
      });

      setSettings(mappedSettings);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      // Fallback to defaults
      setSettings(
        NOTIFICATION_TYPES.map(typeDef => ({
          id: typeDef.id,
          type: typeDef.type,
          title: typeDef.title,
          description: typeDef.description,
          ...typeDef.defaults,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetting = async (id: string, channel: 'email' | 'push' | 'inApp') => {
    const setting = settings.find(s => s.id === id);
    if (!setting) return;

    const newValue = !setting[channel];
    const updatedSettings = settings.map(s =>
      s.id === id ? { ...s, [channel]: newValue } : s
    );
    setSettings(updatedSettings);

    // Save to backend
    try {
      setIsSaving(id);
      await api.updateNotificationPreference(setting.type, {
        [channel]: newValue,
      });
    } catch (error) {
      console.error('Failed to save preference:', error);
      // Revert on error
      setSettings(settings);
      alert('Failed to save preference. Please try again.');
    } finally {
      setIsSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center py-12 text-zinc-400">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Notification Settings</h1>
        <p className="text-zinc-400">Configure how and when you receive notifications</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
          <div className="text-sm font-medium text-zinc-400">Notification</div>
          <div className="text-sm font-medium text-zinc-400 text-center flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </div>
          <div className="text-sm font-medium text-zinc-400 text-center flex items-center justify-center gap-2">
            <Smartphone className="h-4 w-4" /> Push
          </div>
          <div className="text-sm font-medium text-zinc-400 text-center flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" /> In-App
          </div>
        </div>

        {/* Settings */}
        {settings.map((setting, index) => (
          <div
            key={setting.id}
            className={`grid grid-cols-4 gap-4 px-6 py-4 items-center ${
              index !== settings.length - 1 ? 'border-b border-zinc-800' : ''
            }`}
          >
            <div>
              <p className="font-medium text-white">{setting.title}</p>
              <p className="text-sm text-zinc-500">{setting.description}</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => toggleSetting(setting.id, 'email')}
                disabled={isSaving === setting.id}
                className={`w-12 h-6 rounded-full transition-colors ${
                  setting.email ? 'bg-pink-500' : 'bg-zinc-700'
                } ${isSaving === setting.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  setting.email ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => toggleSetting(setting.id, 'push')}
                disabled={isSaving === setting.id}
                className={`w-12 h-6 rounded-full transition-colors ${
                  setting.push ? 'bg-pink-500' : 'bg-zinc-700'
                } ${isSaving === setting.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  setting.push ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => toggleSetting(setting.id, 'inApp')}
                disabled={isSaving === setting.id}
                className={`w-12 h-6 rounded-full transition-colors ${
                  setting.inApp ? 'bg-pink-500' : 'bg-zinc-700'
                } ${isSaving === setting.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  setting.inApp ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sound Settings */}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Sound Settings</h2>
            <p className="text-sm text-zinc-500">Configure notification sounds</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-300">Play sound for new messages</span>
          <button className="w-12 h-6 rounded-full bg-pink-500 transition-colors">
            <div className="w-5 h-5 rounded-full bg-white transform translate-x-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
