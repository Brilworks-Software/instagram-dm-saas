'use client';

import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background-secondary/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-foreground-muted">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:block w-64">
            <Input
              placeholder="Search..."
              leftIcon={<Search className="h-4 w-4" />}
              className="h-9 bg-background-tertiary"
            />
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Primary Action */}
          {action && (
            <Button onClick={action.onClick} size="sm">
              <Plus className="h-4 w-4" />
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

