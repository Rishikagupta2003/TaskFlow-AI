'use client';

import React, { useState } from 'react';
import type { Project } from '../lib/mockData';
import { IconPlus, IconClose, IconSearch } from './icons';

interface ProjectsViewProps {
  projects: Project[];
  searchQuery: string;
  onCreateProject: (project: Omit<Project, 'id' | 'progress' | 'taskCount' | 'completedTaskCount'>) => void;
  isCreateModalOpen: boolean;
  onOpenCreateModal: () => void;
  onCloseCreateModal: () => void;
}

export function ProjectsView({
  projects,
  searchQuery,
  onCreateProject,
  isCreateModalOpen,
  onOpenCreateModal,
  onCloseCreateModal,
}: ProjectsViewProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'In Progress' | 'Planning' | 'Completed'>('ALL');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'In Progress' | 'Planning' | 'Completed'>('In Progress');
  const [lead, setLead] = useState('');
  const [dueDate, setDueDate] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      status,
      lead: lead.trim() || 'Current User (Demo)',
      dueDate: dueDate || 'TBD',
    });

    // Reset and close
    setName('');
    setDescription('');
    setStatus('In Progress');
    setLead('');
    setDueDate('');
    onCloseCreateModal();
  };

  return (
    <div className="page-container">
      {/* Action & Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'In Progress', 'Planning', 'Completed'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn-secondary ${statusFilter === s ? 'active' : ''}`}
              style={{
                backgroundColor: statusFilter === s ? 'var(--indigo-600)' : 'var(--bg-surface)',
                color: statusFilter === s ? '#ffffff' : 'var(--text-secondary)',
                borderColor: statusFilter === s ? 'var(--indigo-600)' : 'var(--border-subtle)',
              }}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'ALL' ? 'All Projects' : s}
            </button>
          ))}
        </div>

        <button type="button" className="btn-primary" onClick={onOpenCreateModal}>
          <IconPlus />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-strong)',
          }}
        >
          <div style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
            <IconSearch style={{ width: '40px', height: '40px' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No projects match your filter
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Try adjusting your search query or create a new project.
          </p>
          <button type="button" className="btn-primary" onClick={onOpenCreateModal}>
            <IconPlus />
            <span>Create a Project</span>
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {project.name}
                  </h3>
                  <span
                    className={`badge ${
                      project.status === 'Completed'
                        ? 'badge-completed'
                        : project.status === 'In Progress'
                        ? 'badge-in-progress'
                        : 'badge-planning'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                  {project.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div>
                    Lead: <strong style={{ color: 'var(--text-primary)' }}>{project.lead}</strong>
                  </div>
                  <div>Due: {project.dueDate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 id="modal-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Create New Project (Demo State)
              </h2>
              <button
                type="button"
                onClick={onCloseCreateModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="proj-name">Project Name *</label>
                <input
                  id="proj-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Real-Time Analytics Pipeline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-desc">Description</label>
                <textarea
                  id="proj-desc"
                  className="form-textarea"
                  rows={3}
                  placeholder="Summarize project objectives and scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-status">Status</label>
                  <select
                    id="proj-status"
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Planning">Planning</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="proj-due">Target Date</label>
                  <input
                    id="proj-due"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dec 15, 2026"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-lead">Project Lead</label>
                <input
                  id="proj-lead"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rishika Gupta"
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={onCloseCreateModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
