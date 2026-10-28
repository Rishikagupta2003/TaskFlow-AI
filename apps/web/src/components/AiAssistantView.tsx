'use client';

import React, { useState } from 'react';
import { DEMO_AI_SUGGESTIONS, type TaskItem } from '../lib/mockData';
import { IconSparkles, IconCheck } from './icons';

interface AiAssistantViewProps {
  onAcceptAiDraft: (task: Omit<TaskItem, 'id'>) => void;
}

export function AiAssistantView({ onAcceptAiDraft }: AiAssistantViewProps) {
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'drafts' | 'summary'>('drafts');

  const handleAccept = (suggestion: (typeof DEMO_AI_SUGGESTIONS)[0]) => {
    onAcceptAiDraft({
      title: suggestion.title,
      description: `${suggestion.rationale} Subtasks: ${suggestion.subtasks.join(', ')}`,
      projectId: suggestion.projectId,
      projectName: suggestion.projectName,
      status: 'TODO',
      priority: suggestion.priority,
      assignee: 'AI Drafted (Approved)',
      dueDate: 'Upcoming sprint',
    });
    setAcceptedIds((prev) => [...prev, suggestion.id]);
  };

  return (
    <div className="page-container">
      {/* Disclaimer Banner */}
      <div
        style={{
          backgroundColor: 'var(--indigo-50)',
          border: '1px solid var(--indigo-100)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--indigo-600)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconSparkles />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--indigo-700)' }}>
              AI Advisory Assistant (Demo Prototype)
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: 'var(--indigo-600)',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Demo Preview
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Per TaskFlow AI Architecture Section 8, AI features are strictly advisory and human-in-the-loop.
            Task proposals are never persisted automatically. Below is a demo preview showing sample task proposals and project summarization.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          className="btn-secondary"
          style={{
            backgroundColor: activeTab === 'drafts' ? 'var(--indigo-600)' : 'var(--bg-surface)',
            color: activeTab === 'drafts' ? '#ffffff' : 'var(--text-secondary)',
            borderColor: activeTab === 'drafts' ? 'var(--indigo-600)' : 'var(--border-subtle)',
          }}
          onClick={() => setActiveTab('drafts')}
        >
          Task Proposal Suggestions ({DEMO_AI_SUGGESTIONS.length})
        </button>
        <button
          type="button"
          className="btn-secondary"
          style={{
            backgroundColor: activeTab === 'summary' ? 'var(--indigo-600)' : 'var(--bg-surface)',
            color: activeTab === 'summary' ? '#ffffff' : 'var(--text-secondary)',
            borderColor: activeTab === 'summary' ? 'var(--indigo-600)' : 'var(--border-subtle)',
          }}
          onClick={() => setActiveTab('summary')}
        >
          Project Health Summary
        </button>
      </div>

      {/* Tab 1: Task Proposals */}
      {activeTab === 'drafts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {DEMO_AI_SUGGESTIONS.map((sug) => {
            const isAccepted = acceptedIds.includes(sug.id);

            return (
              <div key={sug.id} className="content-card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--indigo-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Proposed for: {sug.projectName}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {sug.title}
                    </h3>
                  </div>

                  <span className={`badge ${sug.priority === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                    {sug.priority} Priority
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>Rationale:</strong> {sug.rationale}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    Generated Subtasks Breakdown
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {sug.subtasks.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Est. effort: {sug.estimatedHours}
                  </span>

                  {isAccepted ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--emerald-600)',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    >
                      <IconCheck /> Added to Board!
                    </span>
                  ) : (
                    <button type="button" className="btn-primary" onClick={() => handleAccept(sug)}>
                      <IconCheck />
                      <span>Review &amp; Add to Tasks</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Project Health Summary */}
      {activeTab === 'summary' && (
        <div className="content-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-600)',
                display: 'inline-block',
              }}
            />
            <h3 className="section-heading">Sprint 42 Health: On Track (Demo Summary)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Key Achievements
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Monorepo foundation verified with NPM workspaces</li>
                <li>API Gateway Supabase JWT guard fully unit-tested (100% pass)</li>
                <li>Identity service schema &amp; idempotent upsert logic verified</li>
              </ul>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Upcoming Milestone Risks
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li>Supabase connection pooler sizing needs load benchmarking</li>
                <li>Frontend SSR auth integration planned for Stage 4</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
