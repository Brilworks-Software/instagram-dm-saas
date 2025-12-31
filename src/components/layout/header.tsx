'use client';

import { Search, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { useSidebar } from '@/contexts/sidebar-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { openSidebar } = useSidebar();

  return (
    <header className="h-16 border-b border-border bg-background-secondary/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Mobile/Tablet menu button and title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {openSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={openSidebar}
              className="lg:hidden flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-foreground-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
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
            <Button onClick={action.onClick} size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">{action.label}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

