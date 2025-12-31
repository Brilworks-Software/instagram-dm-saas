'use client';

import { Avatar } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Inbox,
  Instagram,
  LogOut,
  Send,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";

const navigation = [
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Studio', href: '/ai-studio', icon: Sparkles },
];

const settingsNav = [
  { name: 'Instagram Accounts', href: '/settings/instagram', icon: Instagram },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMenuClick?: () => void;
}

export function Sidebar({ isOpen = false, onClose, onMenuClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("conversations")
        .select("unread_count")
        .gt("unread_count", 0);

      if (data) {
        const total = data.reduce(
          (sum, conv) => sum + (conv.unread_count || 0),
          0
        );
        setUnreadCount(total);
      }
    };

    fetchUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";

  // Close sidebar when navigation link is clicked on mobile
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile/Tablet hamburger button - only visible when sidebar is closed on mobile/tablet */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-background-secondary border border-border hover:bg-background-elevated transition-colors"
          aria-label="Open menu"
        >
          <svg
            className="h-6 w-6 text-foreground"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-background-secondary flex flex-col transition-transform duration-300 ease-in-out",
          // Mobile/Tablet: hidden by default, slide in when open
          "transform -translate-x-full lg:translate-x-0",
          // Show when open on mobile/tablet
          isOpen && "translate-x-0"
        )}
      >
        {/* Mobile/Tablet close button */}
        {onClose && (
          <div className="h-16 flex items-center justify-between px-6 border-b border-border lg:hidden">
            <div className="flex items-center">
              <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="SocialOra"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-xl">
                Social<span className="text-accent">Ora</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-background-elevated transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>
        )}

        {/* Logo - hidden on mobile/tablet when close button is shown */}
        <div className={cn(
          "h-16 flex items-center px-6 border-b border-border",
          onClose && "hidden lg:flex"
        )}>
        <Link href="/" className="flex items-center group">
          <div className="flex items-center">
            <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="SocialOra"
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-bold text-xl">
              Social<span className="text-accent">Ora</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-2 px-3">
          <span className="text-xs font-medium text-foreground-subtle uppercase tracking-wider">
            Main
          </span>
        </div>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const showBadge = item.name === "Inbox" && unreadCount > 0;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-foreground-muted hover:text-foreground hover:bg-background-elevated"
              )}>
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive
                    ? "text-accent"
                    : "text-foreground-subtle group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {showBadge && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    isActive
                      ? "bg-accent text-white"
                      : "bg-accent/10 text-accent"
                  )}>
                  {unreadCount}
                </span>
              )}
              {isActive && <ChevronRight className="h-4 w-4 text-accent" />}
            </Link>
          );
        })}

        <div className="mt-6 mb-2 px-3">
          <span className="text-xs font-medium text-foreground-subtle uppercase tracking-wider">
            Settings
          </span>
        </div>
        {settingsNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-foreground-muted hover:text-foreground hover:bg-background-elevated"
              )}>
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive
                    ? "text-accent"
                    : "text-foreground-subtle group-hover:text-foreground"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border relative" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-background-elevated transition-colors">
          <Avatar name={userName} size="sm" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-foreground-subtle truncate">
              {userEmail || "Pro Plan"}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-foreground-subtle transition-transform",
              showUserMenu && "rotate-180"
            )}
          />
        </button>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-background-elevated border border-border rounded-lg shadow-lg overflow-hidden z-50">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-foreground-muted truncate">
                {userEmail}
              </p>
            </div>
            <div className="p-1">
              <Link
                href="/settings/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary rounded-md transition-colors"
                onClick={() => setShowUserMenu(false)}>
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md transition-colors">
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}

