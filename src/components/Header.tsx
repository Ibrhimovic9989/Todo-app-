import React from 'react';
import { CheckCircle2, Moon, Sun, Monitor, Keyboard, FileText, Database, User } from 'lucide-react';
import { AuthUser, ThemeMode } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenShortcuts: () => void;
  onOpenExportImport: () => void;
  onOpenDatabaseSettings: () => void;
  user: AuthUser | null;
  isSupabaseActive: boolean;
  completedTodayCount: number;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  onOpenShortcuts,
  onOpenExportImport,
  onOpenDatabaseSettings,
  user,
  isSupabaseActive,
  completedTodayCount,
  activeCount,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const cycleTheme = () => {
    if (theme === 'system') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('light');
    else onThemeChange('system');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-amber-400" />;
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-600" />;
    return <Monitor className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />;
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Dark';
    if (theme === 'light') return 'Light';
    return 'System';
  };

  return (
    <header id="app-header" className="pt-8 pb-6 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Date */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Tasks
            </h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              {activeCount} active
            </span>
          </div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {today} • {completedTodayCount} completed today
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Supabase & Google Auth Button */}
          <button
            id="database-auth-btn"
            type="button"
            onClick={onOpenDatabaseSettings}
            title={
              user
                ? `Signed in as ${user.name || user.email} (Google Auth)`
                : isSupabaseActive
                ? 'Supabase DB Connected & Google Auth'
                : 'Configure Supabase DB & Google Auth'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              user
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/60'
                : isSupabaseActive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/60'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/80'
            }`}
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'User'}
                referrerPolicy="no-referrer"
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : user ? (
              <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-2xs">
                {user.email.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Database className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className="hidden sm:inline">
              {user ? (user.name ? user.name.split(' ')[0] : user.email.split('@')[0]) : 'DB & Auth'}
            </span>
          </button>

          <button
            id="shortcuts-btn"
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts (?)"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            id="export-import-btn"
            type="button"
            onClick={onOpenExportImport}
            title="Backup & Export"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            id="theme-toggle-btn"
            type="button"
            onClick={cycleTheme}
            title={`Theme: ${getThemeLabel()} (Click to toggle or press D)`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 transition-colors"
          >
            {getThemeIcon()}
            <span className="hidden sm:inline capitalize">{getThemeLabel()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
