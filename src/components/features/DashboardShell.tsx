'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { UserAvatar } from './UserAvatar';

interface DashboardShellProps {
  activeBoardId: string;
  sidebarItems: Array<{ id: string; name: string; desc: string }>;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export function DashboardShell({ activeBoardId, sidebarItems, logoutAction, children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-text-main font-sans overflow-hidden transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-surface border-r border-border-color flex flex-col flex-shrink-0 z-50 transform transition-transform duration-300 lg:static ${
        isSidebarOpen ? 'translate-x-0' : 'max-lg:-translate-x-full'
      }`}>
        <div className="p-6 border-b border-border-color space-y-4">
          <div className="flex justify-between items-center">
            {/* Dynamic Logo */}
            <div className="relative w-40 h-10">
              <img
                src="/assets/site logo light theme.png"
                alt="Sovereign CRM Logo"
                className="h-full object-contain block dark:hidden"
              />
              <img
                src="/assets/site logo dark theme.png"
                alt="Sovereign CRM Logo"
                className="h-full object-contain hidden dark:block"
              />
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center border border-border-color rounded-full hover:bg-background cursor-pointer font-mono text-xs text-text-muted hover:text-text-main"
            >
              [X]
            </button>
          </div>
          <p className="text-[10px] text-text-muted font-mono">operator_terminal_v1.0</p>
        </div>
        
        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2 px-2">Workspaces</span>
          {sidebarItems.map((item) => {
            const isActive = activeBoardId === item.id;
            return (
              <Link
                key={item.id}
                href={`/dashboard?board=${item.id}`}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex flex-col px-4 py-2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-[#e67e22] text-white'
                    : 'text-text-main hover:bg-background'
                }`}
              >
                <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                <span className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-orange-100' : 'text-text-muted'}`}>
                  {item.desc}
                </span>
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-color bg-surface">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full py-2.5 bg-background dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-main text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider border border-border-color cursor-pointer"
            >
              Terminate Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workspace Header */}
        <header className="flex justify-between items-center px-4 lg:px-8 py-4 border-b border-border-color bg-surface/50">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex flex-col justify-center items-center border border-border-color rounded-full bg-surface hover:bg-background cursor-pointer gap-1"
              title="Open Menu"
            >
              <span className="w-5 h-0.5 bg-text-main rounded-full" />
              <span className="w-5 h-0.5 bg-text-main rounded-full" />
              <span className="w-5 h-0.5 bg-text-main rounded-full" />
            </button>
            
            <div>
              <h2 className="text-xs font-mono text-text-muted hidden sm:block">workspace_status: online</h2>
              <p className="text-xs text-text-main font-mono mt-0.5 sm:mt-0">operator_session: active</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <span className="inline-flex items-center px-2 py-0.5 lg:py-1 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ONLINE
            </span>
            <span className="inline-flex items-center px-2 py-0.5 lg:py-1 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 border border-amber-500/20 hidden md:inline-flex">
              AGENT_CONNECTED
            </span>
            <ThemeToggle />
            <UserAvatar />
          </div>
        </header>

        {/* Workspace Kanban Panel */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
