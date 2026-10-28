'use client';

import React from 'react';
import type { Project, TaskItem, Activity } from '../lib/mockData';
import { IconClock, IconAlert, IconCheck } from './icons';

interface DashboardViewProps {
  projects: Project[];
  tasks: TaskItem[];
  activities: Activity[];
  onNavigateToProjects: () => void;
  onNavigateToTasks: () => void;
}

export function DashboardView({
  projects,
  tasks,
  activities,
  onNavigateToProjects,
  onNavigateToTasks,
}: DashboardViewProps) {
  const activeProjectsCount = projects.filter((p) => p.status === 'In Progress').length;
  const openTasksCount = tasks.filter((t) => t.status !== 'DONE').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'DONE').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE').length;

  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(49, 46, 129, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Engineering Workspace • Sprint 42
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Welcome to TaskFlow AI
          </h2>
          <p style={{ fontSize: '14px', color: '#c7d2fe', maxWidth: '600px' }}>
            Here is your live team delivery snapshot. Track progress across microservices, manage Kanban priorities, and explore AI task drafting.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onNavigateToTasks}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: '1px solid #6366f1',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Open Tasks Board
          </button>
          <button
            type="button"
            onClick={onNavigateToProjects}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            View Projects
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Active Projects</div>
          <div className="metric-value">{activeProjectsCount}</div>
          <div className="metric-subtitle">{projects.length} total tracked projects</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Open Tasks</div>
          <div className="metric-value" style={{ color: 'var(--indigo-600)' }}>
            {openTasksCount}
          </div>
          <div className="metric-subtitle">Across all active sprints</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Completed Tasks</div>
          <div className="metric-value" style={{ color: 'var(--emerald-600)' }}>
            {completedTasksCount}
          </div>
          <div className="metric-subtitle">{completionPercentage}% overall completion</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">High Priority / Urgent</div>
          <div className="metric-value" style={{ color: 'var(--rose-600)' }}>
            {highPriorityCount}
          </div>
          <div className="metric-subtitle">Requires immediate focus</div>
        </div>
      </div>

      {/* Progress Visualization Card */}
      <div className="content-card">
        <div className="card-header-flex">
          <div>
            <h3 className="section-heading">Sprint Task Completion Rate</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Real-time calculation derived from your current board state
            </p>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--indigo-600)' }}>
            {completionPercentage}%
          </div>
        </div>

        <div className="progress-track" style={{ height: '12px' }}>
          <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
          <span>{completedTasksCount} tasks completed</span>
          <span>{openTasksCount} tasks remaining</span>
          <span>{totalTasks} total tasks in sprint</span>
        </div>
      </div>

      {/* Lower Grid: Active Projects Snapshot & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Active Projects List */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-flex">
            <h3 className="section-heading">Active Projects Snapshot</h3>
            <button type="button" className="btn-secondary" onClick={onNavigateToProjects}>
              All Projects &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                  <span
                    className={`badge ${
                      p.status === 'Completed'
                        ? 'badge-completed'
                        : p.status === 'In Progress'
                        ? 'badge-in-progress'
                        : 'badge-planning'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {p.description}
                </div>
                <div className="progress-track" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Lead: {p.lead}</span>
                  <span>{p.progress}% progress</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-flex">
            <h3 className="section-heading">Recent Team Activity</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Demo Stream</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor:
                      act.badge === 'completed'
                        ? 'var(--emerald-50)'
                        : act.badge === 'created'
                        ? 'var(--indigo-50)'
                        : 'var(--amber-50)',
                    color:
                      act.badge === 'completed'
                        ? 'var(--emerald-700)'
                        : act.badge === 'created'
                        ? 'var(--indigo-700)'
                        : 'var(--amber-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {act.badge === 'completed' ? (
                    <IconCheck />
                  ) : act.badge === 'created' ? (
                    <IconAlert />
                  ) : (
                    <IconClock />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    <strong>{act.user}</strong> {act.action}{' '}
                    <span style={{ color: 'var(--indigo-600)', fontWeight: 500 }}>
                      &ldquo;{act.target}&rdquo;
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {act.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
