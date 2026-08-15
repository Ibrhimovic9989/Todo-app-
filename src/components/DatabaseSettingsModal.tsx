import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Database, 
  Key, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  LogOut, 
  AlertCircle, 
  ShieldCheck,
  UserCheck,
  HelpCircle
} from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { AuthUser } from '../types';
import { 
  isSupabaseConfigured, 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';
import { 
  getStoredGoogleClientId, 
  saveStoredGoogleClientId, 
  handleGoogleCredentialResponse, 
  signOutUser 
} from '../lib/auth';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onUserChange: (user: AuthUser | null) => void;
  onSync: () => void;
  syncing: boolean;
  googleClientId: string;
  onGoogleClientIdChange: (clientId: string) => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChange,
  onSync,
  syncing,
  googleClientId,
  onGoogleClientIdChange,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [inputClientId, setInputClientId] = useState(googleClientId);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedClientSuccess, setSavedClientSuccess] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSync();
    }, 1200);
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    saveStoredGoogleClientId(cleanId);
    onGoogleClientIdChange(cleanId);
    setSavedClientSuccess(true);
    setTimeout(() => setSavedClientSuccess(false), 1500);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    setAuthError('');
    if (credentialResponse.credential) {
      const { user: authedUser, error } = handleGoogleCredentialResponse({
        credential: credentialResponse.credential,
      });
      if (error) {
        setAuthError(error.message);
      } else if (authedUser) {
        onUserChange(authedUser);
      }
    }
  };

  const handleGoogleError = () => {
    setAuthError('Google sign-in was closed or encountered an error.');
  };

  const handleSignOut = () => {
    signOutUser();
    onUserChange(null);
  };

  const configured = isSupabaseConfigured();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-5 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Supabase Postgres & Google Auth
                </h3>
                <p className="text-2xs text-zinc-500 dark:text-zinc-400">
                  PostgreSQL persistence & Passport/OAuth Google Authentication
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 overflow-y-auto space-y-4 text-xs">
            {/* Section 1: Google Authentication (Passport / Google OAuth) */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span>Google Authentication (Passport / OAuth 2.0)</span>
                </div>
                {user && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Authenticated
                  </span>
                )}
              </div>

              {/* User Profile Info or Sign-in Button */}
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                {user ? (
                  <div className="flex items-center gap-2.5">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {user.name || 'Google User'}
                      </div>
                      <div className="text-2xs text-zinc-500 dark:text-zinc-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xs text-zinc-500 dark:text-zinc-400">
                      Sign in with your Google account to associate your tasks
                    </div>
                  </div>
                )}

                <div>
                  {user ? (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-2xs font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  ) : googleClientId ? (
                    <div className="max-w-[220px]">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        shape="rectangular"
                        size="medium"
                        text="signin_with"
                        theme="outline"
                      />
                    </div>
                  ) : (
                    <span className="text-2xs text-amber-600 dark:text-amber-400 font-medium">
                      Enter Google Client ID below
                    </span>
                  )}
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-1.5 text-2xs text-rose-600 dark:text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Google Client ID Config */}
              <form onSubmit={handleSaveClientId} className="pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-medium text-zinc-600 dark:text-zinc-400">
                    Google OAuth 2.0 Client ID
                  </span>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-2xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Google Cloud Console
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-2xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-2xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    {savedClientSuccess ? <Check className="w-3 h-3" /> : 'Set Client ID'}
                  </button>
                </div>
                <p className="text-2xs text-zinc-400 dark:text-zinc-500">
                  Add <code className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.2 rounded font-mono">https://todo-app-khaki-eta-61.vercel.app</code> to Authorized JavaScript Origins in your Google Cloud OAuth Client credentials.
                </p>
              </form>
            </div>

            {/* Section 2: Supabase Postgres Database Credentials */}
            <form onSubmit={handleSaveConfig} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>Supabase PostgreSQL Database</span>
                </div>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-2xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Supabase Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-2xs text-zinc-500 dark:text-zinc-400 font-medium">Project URL</span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://bscsiwejifvalbhpegaq.supabase.co"
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <span className="text-2xs text-zinc-500 dark:text-zinc-400 font-medium">Anon / Public API Key</span>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all text-xs"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Saved & Synced
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Save & Connect Database
                    </>
                  )}
                </button>

                {configured && (
                  <button
                    type="button"
                    onClick={onSync}
                    disabled={syncing}
                    className="inline-flex items-center gap-1 text-2xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Database'}
                  </button>
                )}
              </div>
            </form>

            {/* SQL Table Creation Guide */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                  PostgreSQL Table SQL Script
                </span>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="inline-flex items-center gap-1 text-2xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                >
                  {copiedSchema ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiedSchema ? 'SQL Copied!' : 'Copy SQL Script'}
                </button>
              </div>
              <p className="text-2xs text-zinc-500 dark:text-zinc-400">
                Run this SQL in your <strong>Supabase SQL Editor</strong> to ensure the <code className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded text-2xs">todos</code> table and permissions exist.
              </p>
              <pre className="p-2.5 bg-zinc-900 text-zinc-100 rounded-lg text-2xs font-mono overflow-x-auto max-h-28">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
