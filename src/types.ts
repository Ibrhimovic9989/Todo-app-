export type Priority = 'none' | 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string;
  notes?: string;
  createdAt: number;
  completedAt?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  provider: 'google';
}

export interface GoogleAuthConfig {
  clientId: string;
}

export type FilterStatus = 'all' | 'active' | 'completed';
export type SortOption = 'created' | 'due-date' | 'priority' | 'alpha';
export type ThemeMode = 'light' | 'dark' | 'system';

