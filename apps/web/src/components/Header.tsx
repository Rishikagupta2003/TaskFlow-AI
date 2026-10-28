'use client';

import React from 'react';
import { IconSearch, IconPlus, IconMenu } from './icons';
import type { NavView } from './Sidebar';

interface HeaderProps {
  activeView: NavView;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateProject?: () => void;
  onOpenCreateTask?: () => void;
  onToggleMobileMenu: () => void;
}

export function Header({
  activeView,
  searchQuery,
  onSearchChange,
  onOpenCreateProject,
  onOpenCreateTask,
  onToggleMobileMenu,
}: HeaderProps) {
  const titles: Record<NavView, string> = {
    dashboard: 'Project Overview & Metrics',
    projects: 'Active Projects',
    tasks: 'Team Task Board',
    ai: 'AI Advisory Assistant (Demo)',
    workspace: 'Workspace & Profile Settings',
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <IconMenu />
        </button>
        <h1 className="page-title">{titles[activeView]}</h1>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <IconSearch style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects or tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {activeView === 'projects' && onOpenCreateProject && (
          <button type="button" className="btn-primary" onClick={onOpenCreateProject}>
            <IconPlus />
            <span>New Project</span>
          </button>
        )}

        {(activeView === 'tasks' || activeView === 'dashboard') && onOpenCreateTask && (
          <button type="button" className="btn-primary" onClick={onOpenCreateTask}>
            <IconPlus />
            <span>Add Task</span>
          </button>
        )}

        <div className="workspace-badge">
          <span>Acme Eng</span>
        </div>

        <div className="avatar-badge" title="Demo User: Rishika Gupta">
          RG
        </div>
      </div>
    </header>
  );
}
