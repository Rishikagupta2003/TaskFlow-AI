'use client';

import React, { useState, useEffect } from 'react';
import type { TaskItem, Project } from '../lib/mockData';
import { IconPlus, IconClose, IconCheck, IconAlert } from './icons';

export interface TasksViewProps {
  tasks: TaskItem[];
  projects: Project[];
  searchQuery: string;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
  onNavigateToCreateProject?: () => void;
}

export function TasksView({
  tasks,
  projects,
  searchQuery,
  onAddTask,
  onUpdateTaskStatus,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  onNavigateToCreateProject,
}: TasksViewProps) {
  // Add task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Keep selected projectId aligned with projects list
  useEffect(() => {
    if (projects.length > 0 && (!projectId || !projects.some((p) => p.id === projectId))) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const filteredTasks = tasks.filter((t) => {
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || projects.length === 0) return;

    const selectedProj = projects.find((p) => p.id === projectId) || projects[0];
    if (!selectedProj) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      projectId: selectedProj.id,
      projectName: selectedProj.name,
      status: 'TODO',
      priority,
      assignee: assignee.trim() || 'Unassigned',
      dueDate: dueDate || 'This sprint',
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setAssignee('');
    setDueDate('');
    onCloseAddModal();
  };

  const renderTaskCard = (task: TaskItem) => (
    <div key={task.id} className="task-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--indigo-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {task.projectName}
        </span>
        <span
          className={`badge ${
            task.priority === 'HIGH'
              ? 'badge-high'
              : task.priority === 'MEDIUM'
              ? 'badge-medium'
              : 'badge-low'
          }`}
        >
          {task.priority}
        </span>
      </div>

      <h4 className="task-title">{task.title}</h4>
      <p className="task-desc">{task.description}</p>

      <div className="task-footer">
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          <div>{task.assignee}</div>
          <div style={{ marginTop: '2px', fontWeight: 500 }}>{task.dueDate}</div>
        </div>

        {/* Transition Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {task.status === 'TODO' && (
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: 'var(--indigo-50)', color: 'var(--indigo-700)', borderColor: 'var(--indigo-100)' }}
              onClick={() => onUpdateTaskStatus(task.id, 'IN_PROGRESS')}
              title="Move to In Progress"
            >
              Start &rarr;
            </button>
          )}

          {task.status === 'IN_PROGRESS' && (
            <>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 6px', fontSize: '11px' }}
                onClick={() => onUpdateTaskStatus(task.id, 'TODO')}
                title="Move back to To Do"
              >
                &larr;
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: 'var(--emerald-600)' }}
                onClick={() => onUpdateTaskStatus(task.id, 'DONE')}
                title="Mark Done"
              >
                <IconCheck /> Done
              </button>
            </>
          )}

          {task.status === 'DONE' && (
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => onUpdateTaskStatus(task.id, 'IN_PROGRESS')}
              title="Reopen task"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Board Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Sprint Workflow Board
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Track and transition tasks across To Do, In Progress, and Done stages.
          </p>
        </div>

        <button type="button" className="btn-primary" onClick={onOpenAddModal}>
          <IconPlus />
          <span>Add Task</span>
        </button>
      </div>

      {/* Guide Banner when zero projects exist */}
      {projects.length === 0 && (
        <div
          style={{
            backgroundColor: 'var(--amber-50)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--amber-700)' }}>
              <IconAlert />
            </span>
            <span style={{ fontSize: '13px', color: 'var(--amber-700)', fontWeight: 500 }}>
              No projects created yet. Create a project first to assign and manage sprint tasks.
            </span>
          </div>
          {onNavigateToCreateProject && (
            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={onNavigateToCreateProject}
            >
              <IconPlus />
              <span>Create Project</span>
            </button>
          )}
        </div>
      )}

      {/* 3-Column Kanban Board */}
      <div className="kanban-board">
        {/* Column: To Do */}
        <div className="kanban-col">
          <div className="kanban-col-header">
            <span className="col-title">To Do</span>
            <span className="col-count">{todoTasks.length}</span>
          </div>
          <div>{todoTasks.map(renderTaskCard)}</div>
          {todoTasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '32px 0' }}>
              No tasks to do
            </div>
          )}
        </div>

        {/* Column: In Progress */}
        <div className="kanban-col">
          <div className="kanban-col-header">
            <span className="col-title">In Progress</span>
            <span className="col-count">{inProgressTasks.length}</span>
          </div>
          <div>{inProgressTasks.map(renderTaskCard)}</div>
          {inProgressTasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '32px 0' }}>
              No tasks in progress
            </div>
          )}
        </div>

        {/* Column: Done */}
        <div className="kanban-col">
          <div className="kanban-col-header">
            <span className="col-title">Done</span>
            <span className="col-count">{doneTasks.length}</span>
          </div>
          <div>{doneTasks.map(renderTaskCard)}</div>
          {doneTasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '32px 0' }}>
              No completed tasks yet
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-task-title">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 id="add-task-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Add New Task
              </h2>
              <button
                type="button"
                onClick={onCloseAddModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <IconClose />
              </button>
            </div>

            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ color: 'var(--amber-600)', marginBottom: '12px' }}>
                  <IconAlert style={{ width: '40px', height: '40px', margin: '0 auto' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Project Required
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5, maxWidth: '360px', margin: '0 auto 24px' }}>
                  Every task belongs to a project. Please create your first project before adding tasks to the workflow board.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      onCloseAddModal();
                      onNavigateToCreateProject?.();
                    }}
                  >
                    <IconPlus />
                    <span>Create Project First</span>
                  </button>
                  <button type="button" className="btn-secondary" onClick={onCloseAddModal}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="task-title">Task Title *</label>
                  <input
                    id="task-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Implement rate limiting on API gateway"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-desc">Description</label>
                  <textarea
                    id="task-desc"
                    className="form-textarea"
                    rows={2}
                    placeholder="Provide task criteria or notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-proj">Project *</label>
                    <select
                      id="task-proj"
                      className="form-select"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-priority">Priority</label>
                    <select
                      id="task-priority"
                      className="form-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                    >
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-assignee">Assignee</label>
                    <input
                      id="task-assignee"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lead Engineer"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-due">Due Date</label>
                    <input
                      id="task-due"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Friday"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button type="button" className="btn-secondary" onClick={onCloseAddModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Task
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
