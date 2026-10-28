'use client';

import React from 'react';
import {
  IconDashboard,
  IconProjects,
  IconTasks,
  IconSparkles,
  IconWorkspace,
} from './icons';

export type NavView = 'dashboard' | 'projects' | 'tasks' | 'ai' | 'workspace';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const navItems: { id: NavView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { id: 'projects', label: 'Projects', icon: <IconProjects /> },
    { id: 'tasks', label: 'Tasks', icon: <IconTasks /> },
    { id: 'ai', label: 'AI Assistant', icon: <IconSparkles />, badge: 'Demo' },
    { id: 'workspace', label: 'Workspace & Profile', icon: <IconWorkspace /> },
  ];

  return (
    <aside className={`sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon">TF</div>
          <div>
            <div className="brand-name">TaskFlow AI</div>
          </div>
          <span className="brand-badge">v2.0 Demo</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectView(item.id);
                onCloseMobile();
              }}
              type="button"
            >
              <span style={{ color: isActive ? 'var(--indigo-600)' : 'var(--text-muted)' }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--indigo-600)' : 'var(--bg-subtle)',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="demo-banner-pill">
          <span className="pulse-dot" />
          <span>Local Demo Mode</span>
        </div>
      </div>
    </aside>
  );
}
