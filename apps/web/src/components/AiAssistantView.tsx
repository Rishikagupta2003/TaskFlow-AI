'use client';

import React, { useState } from 'react';
import {
  requestTaskDrafts,
  requestProjectSummary,
  toEditableDraft,
  type EditableAiDraft,
  AiClientError,
} from '../lib/ai-client';
import { createClient } from '../lib/supabase/client';
import { type TaskItem } from '../lib/mockData';
import {
  IconSparkles,
  IconCheck,
  IconAlert,
  IconEdit,
  IconTrash,
  IconPlus,
} from './icons';
import type { ProjectSummaryOutput, TaskPriority } from '@taskflow/contracts';

export interface AiAssistantViewProps {
  onAcceptAiDraft?: (task: Omit<TaskItem, 'id'>) => void;
  userEmail?: string | null;
  onOpenAuthModal?: () => void;
}

export function AiAssistantView({
  onAcceptAiDraft,
  userEmail,
  onOpenAuthModal,
}: AiAssistantViewProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'drafts' | 'summary'>('drafts');

  // Input & Generation State
  const [projectObjective, setProjectObjective] = useState('');
  const [maxDrafts, setMaxDrafts] = useState<number>(3);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [draftsError, setDraftsError] = useState<string | null>(null);

  // Drafts & Approval State
  const [drafts, setDrafts] = useState<EditableAiDraft[]>([]);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [disclaimerText, setDisclaimerText] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});

  // Summary State
  const [summaryData, setSummaryData] = useState<ProjectSummaryOutput | null>(null);
  const [summaryProvider, setSummaryProvider] = useState<string | null>(null);
  const [summaryDisclaimer, setSummaryDisclaimer] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Helper to fetch current Supabase access token
  const getAccessToken = async (): Promise<string | null> => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  };

  // Generate Task Drafts via Gateway
  const handleGenerateDrafts = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = projectObjective.trim();

    if (trimmed.length < 5) {
      setDraftsError('Please enter at least 5 characters describing your objective.');
      return;
    }

    setDraftsError(null);
    setIsLoadingDrafts(true);

    try {
      const token = await getAccessToken();
      const result = await requestTaskDrafts(
        {
          projectObjective: trimmed,
          maxDrafts,
        },
        token,
      );

      const editableDrafts = result.drafts.map(toEditableDraft);
      setDrafts(editableDrafts);
      setProviderName(result.provider);
      setDisclaimerText(result.disclaimer);
    } catch (err) {
      if (err instanceof AiClientError) {
        setDraftsError(err.message);
      } else {
        setDraftsError('Failed to generate task drafts. Please check connection and try again.');
      }
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  // Draft Editing Handlers
  const handleToggleEdit = (draftId: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, isEditing: !d.isEditing } : d)),
    );
  };

  const handleUpdateDraft = (
    draftId: string,
    field: keyof EditableAiDraft,
    value: unknown,
  ) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, [field]: value } : d)),
    );
  };

  const handleUpdateSubtask = (draftId: string, index: number, value: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== draftId) return d;
        const newSubtasks = [...d.subtasks];
        newSubtasks[index] = value;
        return { ...d, subtasks: newSubtasks };
      }),
    );
  };

  const handleDeleteSubtask = (draftId: string, index: number) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== draftId) return d;
        const newSubtasks = d.subtasks.filter((_, i) => i !== index);
        return { ...d, subtasks: newSubtasks };
      }),
    );
  };

  const handleAddSubtask = (draftId: string) => {
    const text = (newSubtaskInputs[draftId] || '').trim();
    if (!text) return;

    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== draftId) return d;
        return { ...d, subtasks: [...d.subtasks, text] };
      }),
    );

    setNewSubtaskInputs((prev) => ({ ...prev, [draftId]: '' }));
  };

  const handleDiscardDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  // Explicit Human Approval Action
  const handleApproveDraft = (draft: EditableAiDraft) => {
    setApprovedIds((prev) => [...prev, draft.id]);
    setDrafts((prev) =>
      prev.map((d) => (d.id === draft.id ? { ...d, isApproved: true, isEditing: false } : d)),
    );

    // If parent handler is provided, stage the draft into client review board
    if (onAcceptAiDraft) {
      onAcceptAiDraft({
        title: draft.title,
        description: `${draft.rationale ? draft.rationale + ' | ' : ''}Subtasks: ${draft.subtasks.join(', ')}`,
        projectId: 'proj-3',
        projectName: 'AI Smart Task Assistant',
        status: 'TODO',
        priority: draft.priority === 'URGENT' ? 'HIGH' : draft.priority,
        assignee: userEmail ? `${userEmail} (Approved)` : 'User Approved',
        dueDate: draft.estimatedHours || 'Upcoming sprint',
      });
    }
  };

  // Request Live Project Summary
  const handleRequestSummary = async () => {
    setSummaryError(null);
    setIsLoadingSummary(true);

    try {
      const token = await getAccessToken();
      const result = await requestProjectSummary(
        {
          projectName: 'Core Platform Sprint 42',
          completedCount: 14,
          pendingCount: 4,
          milestoneNotes: 'AI Microservice & Gateway authorization operational',
        },
        token,
      );

      setSummaryData(result.summary);
      setSummaryProvider(result.provider);
      setSummaryDisclaimer(result.disclaimer);
    } catch (err) {
      if (err instanceof AiClientError) {
        setSummaryError(err.message);
      } else {
        setSummaryError('Failed to fetch project summary.');
      }
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <div className="page-container">
      {/* Advisory Disclaimer Banner */}
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
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--indigo-700)' }}>
              AI Advisory Assistant
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: 'var(--indigo-600)',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Advisory Only
            </span>
            {providerName && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {providerName}
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {disclaimerText ||
              'Per TaskFlow AI Architecture Section 8, AI features are strictly advisory and human-in-the-loop. Proposals are never persisted autonomously and require explicit user review and approval.'}
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
          Generate Task Proposals {drafts.length > 0 && `(${drafts.length})`}
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

      {/* Tab 1: Task Drafting */}
      {activeTab === 'drafts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Prompt Input Form */}
          <div className="content-card">
            <h3 className="section-heading" style={{ marginBottom: '8px' }}>
              Describe Your Sprint or Milestone Objective
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Enter what you want your team to accomplish. TaskFlow AI will generate bounded, structured task proposals with subtask breakdowns for your review.
            </p>

            <form onSubmit={handleGenerateDrafts}>
              <div className="form-group">
                <label className="form-label" htmlFor="objective-input">
                  Project / Sprint Objective
                </label>
                <textarea
                  id="objective-input"
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g., Implement secure file attachments for tasks with presigned S3 URLs, virus scanning, and upload progress bars"
                  value={projectObjective}
                  onChange={(e) => setProjectObjective(e.target.value)}
                  disabled={isLoadingDrafts}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="max-drafts-select" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Max Drafts:
                  </label>
                  <select
                    id="max-drafts-select"
                    className="form-select"
                    style={{ width: '80px', padding: '6px 10px' }}
                    value={maxDrafts}
                    onChange={(e) => setMaxDrafts(Number(e.target.value))}
                    disabled={isLoadingDrafts}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoadingDrafts || projectObjective.trim().length < 5}
                    style={{
                      opacity: isLoadingDrafts || projectObjective.trim().length < 5 ? 0.6 : 1,
                      cursor: isLoadingDrafts || projectObjective.trim().length < 5 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <IconSparkles />
                    <span>{isLoadingDrafts ? 'Generating Proposals...' : 'Generate Task Drafts'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Error Message */}
            {draftsError && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--rose-50)',
                  border: '1px solid #fecdd3',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-600)', fontSize: '13px' }}>
                  <IconAlert />
                  <span>{draftsError}</span>
                </div>
                {draftsError.includes('sign in') && onOpenAuthModal && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onOpenAuthModal}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Generated Drafts List */}
          {drafts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="section-heading" style={{ fontSize: '16px' }}>
                  Generated Task Proposals ({drafts.length})
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {approvedIds.length} of {drafts.length} approved
                </span>
              </div>

              {drafts.map((draft) => {
                const isApproved = approvedIds.includes(draft.id) || draft.isApproved;

                return (
                  <div
                    key={draft.id}
                    className="content-card"
                    style={{
                      marginBottom: 0,
                      borderColor: isApproved ? 'var(--emerald-600)' : 'var(--border-subtle)',
                      backgroundColor: isApproved ? '#fafffd' : 'var(--bg-surface)',
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {draft.isEditing ? (
                          <div className="form-group" style={{ marginBottom: '8px' }}>
                            <label className="form-label" style={{ fontSize: '12px' }}>
                              Task Title
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              value={draft.title}
                              onChange={(e) => handleUpdateDraft(draft.id, 'title', e.target.value)}
                            />
                          </div>
                        ) : (
                          <h4
                            style={{
                              fontSize: '16px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              lineHeight: 1.4,
                            }}
                          >
                            {draft.title}
                          </h4>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {draft.isEditing ? (
                          <select
                            className="form-select"
                            style={{ width: '120px', padding: '4px 8px', fontSize: '12px' }}
                            value={draft.priority}
                            onChange={(e) =>
                              handleUpdateDraft(draft.id, 'priority', e.target.value as TaskPriority)
                            }
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                          </select>
                        ) : (
                          <span
                            className={`badge ${
                              draft.priority === 'HIGH' || draft.priority === 'URGENT'
                                ? 'badge-high'
                                : draft.priority === 'MEDIUM'
                                ? 'badge-medium'
                                : 'badge-low'
                            }`}
                          >
                            {draft.priority} Priority
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description & Rationale */}
                    {draft.isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '12px' }}>
                            Description
                          </label>
                          <textarea
                            className="form-textarea"
                            rows={2}
                            value={draft.description}
                            onChange={(e) => handleUpdateDraft(draft.id, 'description', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '12px' }}>
                            Rationale &amp; Safety Context
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={draft.rationale}
                            onChange={(e) => handleUpdateDraft(draft.id, 'rationale', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          {draft.description}
                        </p>
                        {draft.rationale && (
                          <div
                            style={{
                              backgroundColor: 'var(--bg-subtle)',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              marginBottom: '16px',
                            }}
                          >
                            <strong style={{ color: 'var(--text-primary)' }}>AI Rationale:</strong>{' '}
                            {draft.rationale}
                          </div>
                        )}
                      </>
                    )}

                    {/* Subtasks Breakdown */}
                    <div style={{ marginBottom: '16px' }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '8px',
                        }}
                      >
                        Subtasks Breakdown ({draft.subtasks.length})
                      </div>

                      {draft.isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {draft.subtasks.map((st, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '6px 10px', fontSize: '13px' }}
                                value={st}
                                onChange={(e) => handleUpdateSubtask(draft.id, i, e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '6px 8px', color: 'var(--rose-600)' }}
                                onClick={() => handleDeleteSubtask(draft.id, i)}
                                title="Remove subtask"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          ))}

                          {/* Add Subtask Input */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Add a new subtask..."
                              style={{ padding: '6px 10px', fontSize: '13px' }}
                              value={newSubtaskInputs[draft.id] || ''}
                              onChange={(e) =>
                                setNewSubtaskInputs((prev) => ({
                                  ...prev,
                                  [draft.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSubtask(draft.id);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '6px 12px' }}
                              onClick={() => handleAddSubtask(draft.id)}
                            >
                              <IconPlus /> Add
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {draft.subtasks.map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer Controls & Explicit Approval */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '14px',
                        borderTop: '1px solid var(--border-subtle)',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {draft.isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Est. Effort:</span>
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: '100px', padding: '4px 8px', fontSize: '12px' }}
                              value={draft.estimatedHours}
                              onChange={(e) => handleUpdateDraft(draft.id, 'estimatedHours', e.target.value)}
                            />
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Est. effort: {draft.estimatedHours || 'Unestimated'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isApproved && (
                          <>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => handleToggleEdit(draft.id)}
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                            >
                              <IconEdit />
                              <span>{draft.isEditing ? 'Save Changes' : 'Edit Draft'}</span>
                            </button>

                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => handleDiscardDraft(draft.id)}
                              style={{ fontSize: '12px', padding: '6px 10px', color: 'var(--rose-600)' }}
                              title="Discard this draft"
                            >
                              <IconTrash />
                              <span>Discard</span>
                            </button>
                          </>
                        )}

                        {isApproved ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--emerald-50)',
                              border: '1px solid #a7f3d0',
                              color: 'var(--emerald-700)',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            <IconCheck />
                            <span>Approved (Review State)</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => handleApproveDraft(draft)}
                            style={{ fontSize: '12px', padding: '6px 14px' }}
                          >
                            <IconCheck />
                            <span>Approve Proposal</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Review State Notice upon Approval */}
                    {isApproved && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-subtle)',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        <strong style={{ color: 'var(--text-primary)' }}>Review State:</strong> Approved by user. Note: Persistent backend Task Service is not yet connected — this item is staged in client review memory and has not made autonomous database changes.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Project Health Summary */}
      {activeTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Demo/Preview Notice */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--amber-50)',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ color: 'var(--amber-700)', flexShrink: 0 }}>
              <IconAlert />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--amber-700)' }}>
                  Demo Scope Notice: Project Context Verification Pending
                </strong>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: 'var(--amber-600)',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  Phase 2 Prerequisite
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--amber-700)', lineHeight: 1.4 }}>
                Per architectural safety rules, project context cannot be trusted from client browser inputs without backend workspace authorization checks. Live summaries below demonstrate routing through the API Gateway with verified Bearer JWT tokens using scoped sample context.
              </p>
            </div>
          </div>

          {/* Action Trigger Card */}
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 className="section-heading" style={{ fontSize: '16px' }}>
                  Gateway Project Health Summarization
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Routes through the API Gateway to evaluate completed vs pending tasks and identify milestone risks.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleRequestSummary}
                disabled={isLoadingSummary}
                style={{ opacity: isLoadingSummary ? 0.6 : 1 }}
              >
                <IconSparkles />
                <span>{isLoadingSummary ? 'Fetching Summary...' : 'Request Gateway Summary'}</span>
              </button>
            </div>

            {summaryError && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--rose-50)',
                  border: '1px solid #fecdd3',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--rose-600)',
                  fontSize: '13px',
                }}
              >
                {summaryError}
              </div>
            )}
          </div>

          {/* Render Summary Data if fetched */}
          {summaryData ? (
            <div className="content-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor:
                        summaryData.healthStatus === 'ON_TRACK'
                          ? 'var(--emerald-600)'
                          : summaryData.healthStatus === 'AT_RISK'
                          ? 'var(--amber-600)'
                          : 'var(--rose-600)',
                      display: 'inline-block',
                    }}
                  />
                  <h3 className="section-heading">{summaryData.headline}</h3>
                </div>

                <span
                  className={`badge ${
                    summaryData.healthStatus === 'ON_TRACK'
                      ? 'badge-completed'
                      : summaryData.healthStatus === 'AT_RISK'
                      ? 'badge-medium'
                      : 'badge-high'
                  }`}
                >
                  {summaryData.healthStatus}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Key Deliverables &amp; Achievements
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {summaryData.keyAchievements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Milestone Risks &amp; Bottlenecks
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {summaryData.milestoneRisks.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Provider: {summaryProvider || 'AI Service'}</span>
                <span>{summaryDisclaimer}</span>
              </div>
            </div>
          ) : (
            /* Fallback Static Preview */
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
                <h3 className="section-heading">Sprint 42 Health: On Track (Demo Preview)</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Key Achievements
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li>Monorepo foundation verified with NPM workspaces</li>
                    <li>API Gateway Supabase JWT guard fully unit-tested</li>
                    <li>AI Service provider abstraction &amp; offline mock fallback operational</li>
                  </ul>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Upcoming Milestone Risks
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li>Task Service persistence schema not yet deployed</li>
                    <li>Workspace authorization verification scheduled for Phase 2</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
