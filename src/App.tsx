import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Inbox, CheckCircle2, Filter, RefreshCw, Database } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Task, FilterStatus, SortOption, ThemeMode, Priority, AuthUser } from './types';
import { 
  loadStoredTasks, 
  saveStoredTasks, 
  loadStoredTheme, 
  saveStoredTheme 
} from './utils/storage';
import { 
  isSupabaseConfigured, 
  fetchSupabaseTasks, 
  insertSupabaseTask, 
  updateSupabaseTask, 
  deleteSupabaseTask 
} from './lib/supabase';
import { 
  getStoredAuthUser, 
  getStoredGoogleClientId, 
  saveStoredAuthUser 
} from './lib/auth';
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { FilterBar } from './components/FilterBar';
import { TaskItem } from './components/TaskItem';
import { StatsBar } from './components/StatsBar';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ExportImportModal } from './components/ExportImportModal';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [theme, setTheme] = useState<ThemeMode>(() => loadStoredTheme());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  
  // Modals & UI state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  
  // Auth & Supabase Database state
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [googleClientId, setGoogleClientId] = useState<string>(() => getStoredGoogleClientId());
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseActive, setSupabaseActive] = useState<boolean>(() => isSupabaseConfigured());

  const taskInputRef = useRef<HTMLInputElement | null>(null);

  // Sync tasks from Supabase PostgreSQL
  const syncFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseActive(false);
      return;
    }
    setSupabaseActive(true);
    setIsSyncing(true);
    try {
      const { tasks: remoteTasks, error } = await fetchSupabaseTasks();
      if (!error && remoteTasks) {
        if (remoteTasks.length > 0) {
          setTasks(remoteTasks);
          saveStoredTasks(remoteTasks);
        } else {
          // If remote is empty, upload local initial tasks
          const local = loadStoredTasks();
          if (local.length > 0) {
            for (const t of local) {
              await insertSupabaseTask(t, user);
            }
          }
        }
      }
    } catch (e) {
      console.error('Supabase sync error', e);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Listen to custom auth events
  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setUser(e.detail || null);
    };
    window.addEventListener('auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthChange);
  }, []);

  // Initial Database sync on mount
  useEffect(() => {
    syncFromSupabase();
  }, [syncFromSupabase]);

  // Save tasks to local storage
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  // Handle Theme switching & system preference
  useEffect(() => {
    saveStoredTheme(theme);
    const root = document.documentElement;

    const applyTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInput) return;

      if (e.key === 'n' || e.key === 'N' || e.key === '/') {
        e.preventDefault();
        taskInputRef.current?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setTheme((prev) => {
          if (prev === 'system') return 'dark';
          if (prev === 'dark') return 'light';
          return 'system';
        });
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClearCompleted();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Derived Categories
  const categories = useMemo(() => {
    const defaultCats = ['Work', 'Personal', 'Study', 'Urgent'];
    const customCats = tasks.map((t) => t.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...customCats]));
  }, [tasks]);

  // Tasks actions
  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);

    if (isSupabaseConfigured()) {
      insertSupabaseTask(newTask, user).catch((err) => console.error('Supabase insert failed', err));
    }
  };

  const handleToggleTask = async (id: string) => {
    let updatedTask: Task | undefined;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          updatedTask = {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : undefined,
          };
          return updatedTask;
        }
        return task;
      })
    );

    if (isSupabaseConfigured() && updatedTask) {
      updateSupabaseTask(id, {
        completed: updatedTask.completed,
        completedAt: updatedTask.completedAt,
      }).catch((err) => console.error('Supabase update failed', err));
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));

    if (isSupabaseConfigured()) {
      deleteSupabaseTask(id).catch((err) => console.error('Supabase delete failed', err));
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );

    if (isSupabaseConfigured()) {
      updateSupabaseTask(id, updates).catch((err) => console.error('Supabase update failed', err));
    }
  };

  const handleCompleteAll = async () => {
    const now = Date.now();
    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        completed: true,
        completedAt: task.completedAt || now,
      }))
    );

    if (isSupabaseConfigured()) {
      for (const t of tasks) {
        if (!t.completed) {
          updateSupabaseTask(t.id, { completed: true, completedAt: now });
        }
      }
    }
  };

  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter((t) => t.completed);
    setTasks((prev) => prev.filter((task) => !task.completed));

    if (isSupabaseConfigured()) {
      for (const t of completedTasks) {
        deleteSupabaseTask(t.id);
      }
    }
  };

  const handleImportTasks = async (importedTasks: Task[]) => {
    setTasks(importedTasks);
    if (isSupabaseConfigured()) {
      for (const t of importedTasks) {
        await insertSupabaseTask(t, user);
      }
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (filterStatus === 'active' && task.completed) return false;
        if (filterStatus === 'completed' && !task.completed) return false;

        // Category filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesNotes = task.notes?.toLowerCase().includes(q);
          const matchesCat = task.category?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesNotes && !matchesCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Completed items always sort lower
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        if (sortBy === 'due-date') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }

        if (sortBy === 'priority') {
          const priorityWeights: Record<Priority, number> = {
            high: 3,
            medium: 2,
            low: 1,
            none: 0,
          };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }

        if (sortBy === 'alpha') {
          return a.title.localeCompare(b.title);
        }

        // Default: created date descending
        return b.createdAt - a.createdAt;
      });
  }, [tasks, filterStatus, selectedCategory, searchQuery, sortBy]);

  // Counts
  const allCount = tasks.length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  
  const completedTodayCount = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return tasks.filter((t) => t.completed && t.completedAt && t.completedAt >= today).length;
  }, [tasks]);

  const effectiveGoogleClientId = googleClientId || 'google-client-id-placeholder';

  return (
    <GoogleOAuthProvider clientId={effectiveGoogleClientId}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 space-y-6">
          {/* Header */}
          <Header
            theme={theme}
            onThemeChange={setTheme}
            onOpenShortcuts={() => setIsShortcutsOpen(false ? false : true)}
            onOpenExportImport={() => setIsExportImportOpen(true)}
            onOpenDatabaseSettings={() => setIsDatabaseOpen(true)}
            user={user}
            isSupabaseActive={supabaseActive}
            completedTodayCount={completedTodayCount}
            activeCount={activeCount}
          />

          {/* Sync Indicator if active */}
          {isSyncing && (
            <div className="flex items-center justify-center gap-2 py-1 px-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-2xs rounded-lg border border-emerald-200/60 dark:border-emerald-900/60 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Syncing tasks with Supabase PostgreSQL...</span>
            </div>
          )}

          {/* Productivity Stats */}
          <StatsBar tasks={tasks} />

          {/* Task Entry Input */}
          <TaskInput
            onAddTask={handleAddTask}
            categories={categories}
            inputRef={taskInputRef}
          />

          {/* Filters and Controls */}
          <FilterBar
            status={filterStatus}
            onStatusChange={setFilterStatus}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            allCount={allCount}
            activeCount={activeCount}
            completedCount={completedCount}
            onCompleteAll={handleCompleteAll}
            onClearCompleted={handleClearCompleted}
          />

          {/* Task List */}
          <main className="space-y-2">
            {filteredAndSortedTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3">
                  {searchQuery || selectedCategory !== 'all' ? (
                    <Filter className="w-5 h-5" />
                  ) : filterStatus === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Inbox className="w-5 h-5" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {searchQuery
                    ? 'No matching tasks'
                    : filterStatus === 'completed'
                    ? 'No completed tasks yet'
                    : 'No active tasks'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  {searchQuery
                    ? 'Try searching with different keywords or clearing your active filters.'
                    : 'Type a task above and press Enter to start building momentum.'}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredAndSortedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onUpdate={handleUpdateTask}
                  />
                ))}
              </AnimatePresence>
            )}
          </main>

          {/* Footer info & shortcut reminder */}
          <footer className="pt-8 text-center text-2xs text-zinc-400 dark:text-zinc-600 flex items-center justify-center gap-2">
            <span>Press <kbd className="font-mono bg-zinc-200/70 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-600 dark:text-zinc-400">?</kbd> for shortcuts</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsDatabaseOpen(true)}
              className="hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-emerald-500" />
              Supabase DB & Google Auth
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsExportImportOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Export & Backup
            </button>
          </footer>
        </div>

        {/* Modals */}
        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        <ExportImportModal
          isOpen={isExportImportOpen}
          onClose={() => setIsExportImportOpen(false)}
          tasks={tasks}
          onImportTasks={handleImportTasks}
        />

        <DatabaseSettingsModal
          isOpen={isDatabaseOpen}
          onClose={() => setIsDatabaseOpen(false)}
          user={user}
          onUserChange={setUser}
          onSync={syncFromSupabase}
          syncing={isSyncing}
          googleClientId={googleClientId}
          onGoogleClientIdChange={setGoogleClientId}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
