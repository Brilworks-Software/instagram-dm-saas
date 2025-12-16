'use client';

import { useState } from 'react';
import { Shield, Key, Smartphone, History, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const sessions = [
    { device: 'Chrome on MacOS', location: 'New York, US', lastActive: 'Now', current: true },
    { device: 'Safari on iPhone', location: 'New York, US', lastActive: '2 hours ago', current: false },
    { device: 'Firefox on Windows', location: 'Chicago, US', lastActive: '3 days ago', current: false },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Security Settings</h1>
        <p className="text-zinc-400">Manage your account security and authentication</p>
      </div>

      {/* Password Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Password</h2>
            <p className="text-sm text-zinc-500">Last changed 30 days ago</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium">
          Change Password
        </button>
      </div>

      {/* Two-Factor Auth */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Two-Factor Authentication</h2>
              <p className="text-sm text-zinc-500">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-pink-500' : 'bg-zinc-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
              twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
        {twoFactorEnabled && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-sm text-emerald-400">
              ✓ Two-factor authentication is enabled. Your account is more secure.
            </p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Active Sessions</h2>
            <p className="text-sm text-zinc-500">Devices currently logged into your account</p>
          </div>
        </div>
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
              <div>
                <p className="font-medium text-white flex items-center gap-2">
                  {session.device}
                  {session.current && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-sm text-zinc-500">{session.location} • {session.lastActive}</p>
              </div>
              {!session.current && (
                <button className="text-sm text-rose-400 hover:text-rose-300">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Danger Zone</h2>
            <p className="text-sm text-zinc-500">Irreversible and destructive actions</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors text-sm font-medium">
          Delete Account
        </button>
      </div>
    </div>
  );
}
