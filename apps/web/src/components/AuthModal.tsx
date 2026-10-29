'use client';

import React, { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { IconClose } from './icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!isConfigured) {
      setErrorMessage(
        'Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in apps/web/.env.local',
      );
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.user?.email) {
          onAuthSuccess(data.user.email);
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session && data.user?.email) {
          // If auto-confirm is enabled in Supabase
          onAuthSuccess(data.user.email);
          onClose();
        } else {
          // Email confirmation is required
          setSuccessNotice(
            'Confirmation email sent! Please check your inbox to verify your email address before signing in.',
          );
        }
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 id="auth-modal-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {mode === 'signin' ? 'Sign In to TaskFlow AI' : 'Create TaskFlow AI Account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <IconClose />
          </button>
        </div>

        {/* Configuration Notice if env vars are missing */}
        {!isConfigured && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--amber-50)',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--amber-700)',
              lineHeight: 1.5,
              marginBottom: '16px',
            }}
          >
            <strong>Local Configuration Notice:</strong> Supabase credentials are not detected in your browser environment.
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to <code>apps/web/.env.local</code> to test live authentication.
          </div>
        )}

        {/* Tab Toggle */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: mode === 'signin' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'signin' ? 'var(--indigo-600)' : 'var(--text-muted)',
              boxShadow: mode === 'signin' ? 'var(--shadow-sm)' : 'none',
            }}
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setSuccessNotice(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: mode === 'signup' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'signup' ? 'var(--indigo-600)' : 'var(--text-muted)',
              boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
            }}
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              setSuccessNotice(null);
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--rose-50)',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--rose-600)',
              marginBottom: '16px',
            }}
          >
            {errorMessage}
          </div>
        )}

        {successNotice && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--emerald-50)',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--emerald-700)',
              marginBottom: '16px',
            }}
          >
            {successNotice}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address *
            </label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password *
            </label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '11px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In with Supabase' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
