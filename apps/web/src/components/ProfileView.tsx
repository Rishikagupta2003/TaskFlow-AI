'use client';

import React from 'react';
import { DEMO_WORKSPACE } from '../lib/mockData';

export function ProfileView() {
  return (
    <div className="page-container">
      {/* Notice */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: 'var(--indigo-50)',
            color: 'var(--indigo-600)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Phase 1 Demo Preview
        </span>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px', marginBottom: '4px' }}>
          Workspace &amp; User Profile (Local Demo State)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Backend Supabase JWT authentication and the <code>/api/v1/profiles/me</code> endpoint have been scaffolded and verified.
          Live cookie-backed SSR authentication will be connected in Stage 4.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Workspace Card */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <h3 className="section-heading" style={{ marginBottom: '16px' }}>
            Current Workspace
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Workspace Name:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {DEMO_WORKSPACE.name}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Workspace Slug:</span>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                <code>{DEMO_WORKSPACE.slug}</code>
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Your Role:</span>
              <div style={{ fontWeight: 600, color: 'var(--indigo-600)', marginTop: '2px' }}>
                {DEMO_WORKSPACE.role}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Team Members:</span>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                {DEMO_WORKSPACE.totalMembers} active engineers
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Subscription Plan:</span>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                {DEMO_WORKSPACE.plan}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <h3 className="section-heading" style={{ marginBottom: '16px' }}>
            User Profile (Demo)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--indigo-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              RG
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                Rishika Gupta
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Lead Software Engineer
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Email:</span>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                rishika.gupta@example.local
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Bio:</span>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                Building high-performance distributed systems, Next.js applications, and AI workflows.
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Preferences:</span>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                Theme: System • Email Notifications: Enabled
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
