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
  userEmail?: string | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export function Header({
  activeView,
  searchQuery,
  onSearchChange,
  onOpenCreateProject,
  onOpenCreateTask,
  onToggleMobileMenu,
  userEmail,
  onOpenAuthModal,
  onSignOut,
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

        {/* Authentication State Pill */}
        {userEmail ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: 'var(--emerald-50)',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                color: 'var(--emerald-700)',
                fontWeight: 500,
              }}
              title={`Authenticated Supabase User: ${userEmail}`}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--emerald-600)',
                }}
              />
              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={onSignOut}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenAuthModal}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderColor: 'var(--indigo-600)',
              color: 'var(--indigo-600)',
              backgroundColor: 'var(--indigo-50)',
            }}
          >
            Sign In / Sign Up
          </button>
        )}

        <div className="avatar-badge" title={userEmail ? `User: ${userEmail}` : 'Demo User: Rishika Gupta'}>
          {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'RG'}
        </div>
      </div>
    </header>
  );
}
