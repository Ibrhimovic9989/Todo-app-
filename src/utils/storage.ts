import { Task } from '../types';

const STORAGE_KEY = 'minimalist_todo_tasks_v1';
const THEME_KEY = 'minimalist_todo_theme_v1';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review pull request for new navigation redesign',
    completed: false,
    priority: 'high',
    category: 'Work',
    dueDate: new Date().toISOString().split('T')[0],
    notes: 'Focus on mobile responsiveness and keyboard navigation flow.',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'task-2',
    title: 'Complete 30-minute afternoon workout',
    completed: false,
    priority: 'medium',
    category: 'Personal',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'task-3',
    title: 'Draft weekly engineering sprint goals',
    completed: true,
    priority: 'high',
    category: 'Work',
    notes: 'Aligned with Q3 milestone delivery.',
    createdAt: Date.now() - 3600000 * 24,
    completedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'task-4',
    title: 'Order replacement mechanical keyboard switches',
    completed: false,
    priority: 'low',
    category: 'Personal',
    createdAt: Date.now() - 3600000 * 12,
  },
];

export function loadStoredTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_TASKS;
    return JSON.parse(data);
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to persist tasks', e);
  }
}

export function loadStoredTheme(): 'light' | 'dark' | 'system' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark' | 'system'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to persist theme', e);
  }
}
