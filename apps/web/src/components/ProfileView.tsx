'use client';

import React, { useState, useEffect } from 'react';
import { DEMO_WORKSPACE } from '../lib/mockData';

export interface UserProfileData {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferences?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileViewProps {
  userEmail: string | null;
  profile: UserProfileData | null;
  isLoading: boolean;
  onUpdateProfile: (data: { displayName?: string; bio?: string }) => Promise<boolean>;
  isSaving: boolean;
  onOpenAuthModal: () => void;
}

export function ProfileView({
  userEmail,
  profile,
  isLoading,
  onUpdateProfile,
  isSaving,
  onOpenAuthModal,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const success = await onUpdateProfile({
      displayName: displayName.trim() || undefined,
      bio: bio.trim() || undefined,
    });

    if (success) {
      setMessage({ type: 'success', text: 'Profile updated in database successfully!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim().length > 0) {
      return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    if (email && email.length >= 2) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'TF';
  };

  return (
    <div className="page-container">
      {/* Notice Banner */}
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
            backgroundColor: userEmail ? 'var(--emerald-50)' : 'var(--indigo-50)',
            color: userEmail ? 'var(--emerald-700)' : 'var(--indigo-600)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {userEmail ? 'Live Database Connection' : 'Authentication Required'}
        </span>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginTop: '8px',
            marginBottom: '4px',
          }}
        >
          Workspace &amp; User Profile Settings
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {userEmail
            ? 'Connected to Supabase PostgreSQL database table: public.user_profiles via API Gateway and Identity Service.'
            : 'Please sign in to view and provision your live PostgreSQL profile row in public.user_profiles.'}
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '13px',
            backgroundColor: message.type === 'success' ? 'var(--emerald-50)' : 'var(--rose-50)',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
            color: message.type === 'success' ? 'var(--emerald-700)' : 'var(--rose-600)',
          }}
        >
          {message.text}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3 className="section-heading" style={{ margin: 0 }}>
              User Profile {userEmail ? '(Live Database)' : '(Demo)'}
            </h3>
            {userEmail && profile && !isEditing && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(true)}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {!userEmail ? (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                You are currently viewing demo data. Sign in to sync your profile with Supabase PostgreSQL.
              </p>
              <button type="button" className="btn-primary" onClick={onOpenAuthModal}>
                Sign In / Sign Up
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Provisioning &amp; loading profile from database...
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="profile-displayName">
                  Display Name
                </label>
                <input
                  id="profile-displayName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rishika Gupta"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="profile-bio">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  className="form-input"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save to Database'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
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
                  {getInitials(profile?.displayName, userEmail)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                    {profile?.displayName || 'TaskFlow Member'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--emerald-600)', fontWeight: 500 }}>
                    ● Authenticated &amp; Verified
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {profile?.email || userEmail}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>User ID (UUID in Supabase):</span>
                  <div style={{ fontWeight: 500, color: 'var(--text-secondary)', marginTop: '2px', fontSize: '12px' }}>
                    <code>{profile?.id || '—'}</code>
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Bio:</span>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                    {profile?.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Database Record Created:</span>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
