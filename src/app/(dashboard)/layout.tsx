'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen, openSidebar, closeSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop overlay for mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      <Sidebar 
        isOpen={isOpen}
        onClose={closeSidebar}
        onMenuClick={openSidebar}
      />
      
      <main className="pl-0 lg:pl-64">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}

