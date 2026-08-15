/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, AuthUser } from '../types';

// Default Supabase project credentials provided by user
const DEFAULT_SUPABASE_URL = 'https://bscsiwejifvalbhpegaq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzY3Npd2VqaWZ2YWxiaHBlZ2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODAyNzMsImV4cCI6MjEwMjM1NjI3M30.BYtAbuEC2eWq1kRJMGSBhVYKunZbaBXFFpz1lqvRhSw';

const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

const LOCAL_CONFIG_KEY = 'minimalist_todo_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(LOCAL_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local supabase config', e);
  }
  return {
    url: envUrl || DEFAULT_SUPABASE_URL,
    anonKey: envAnonKey || DEFAULT_SUPABASE_ANON_KEY,
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig) {
  try {
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
    // Reset client instance
    _supabaseClient = null;
  } catch (e) {
    console.error('Failed to save local supabase config', e);
  }
}

let _supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_supabaseClient) return _supabaseClient;

  const config = getStoredSupabaseConfig();
  const url = config.url || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = config.anonKey || envAnonKey || DEFAULT_SUPABASE_ANON_KEY;

  if (url && anonKey && url.startsWith('https://')) {
    try {
      _supabaseClient = createClient(url, anonKey);
      return _supabaseClient;
    } catch (e) {
      console.error('Failed to initialize Supabase client', e);
      return null;
    }
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredSupabaseConfig();
  const url = config.url || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = config.anonKey || envAnonKey || DEFAULT_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && url.startsWith('https://'));
}

/**
 * Fetch all tasks from Supabase Postgres `todos` table
 */
export async function fetchSupabaseTasks(): Promise<{ tasks: Task[] | null; error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) return { tasks: null, error: new Error('Supabase client not configured') };

  try {
    const { data, error } = await client
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { tasks: null, error: new Error(error.message) };
    }

    if (!data) return { tasks: [], error: null };

    const mappedTasks: Task[] = data.map((row: any) => ({
      id: String(row.id),
      title: row.title,
      completed: Boolean(row.completed),
      priority: row.priority || 'none',
      category: row.category || 'General',
      dueDate: row.due_date || undefined,
      notes: row.notes || undefined,
      createdAt: Number(row.created_at) || Date.now(),
      completedAt: row.completed_at ? Number(row.completed_at) : undefined,
    }));

    return { tasks: mappedTasks, error: null };
  } catch (e: any) {
    return { tasks: null, error: e };
  }
}

/**
 * Insert or Upsert a task into Supabase Postgres
 */
export async function insertSupabaseTask(task: Task, user?: AuthUser | null): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: new Error('Supabase not configured') };

  try {
    const payload: any = {
      id: task.id,
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      category: task.category,
      due_date: task.dueDate || null,
      notes: task.notes || null,
      created_at: task.createdAt,
      completed_at: task.completedAt || null,
    };

    if (user?.id) {
      payload.user_id = user.id;
    }

    const { error } = await client.from('todos').upsert(payload);
    return { error: error ? new Error(error.message) : null };
  } catch (e: any) {
    return { error: e };
  }
}

/**
 * Update a task in Supabase Postgres
 */
export async function updateSupabaseTask(id: string, updates: Partial<Task>): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: new Error('Supabase not configured') };

  try {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.completed !== undefined) payload.completed = updates.completed;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
    if (updates.notes !== undefined) payload.notes = updates.notes || null;
    if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt || null;

    const { error } = await client.from('todos').update(payload).eq('id', id);
    return { error: error ? new Error(error.message) : null };
  } catch (e: any) {
    return { error: e };
  }
}

/**
 * Delete a task in Supabase Postgres
 */
export async function deleteSupabaseTask(id: string): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: new Error('Supabase not configured') };

  try {
    const { error } = await client.from('todos').delete().eq('id', id);
    return { error: error ? new Error(error.message) : null };
  } catch (e: any) {
    return { error: e };
  }
}

/**
 * PostgreSQL Schema creation SQL for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- 1. Create the todos table in Postgres
create table if not exists public.todos (
  id text primary key,
  user_id text,
  title text not null,
  completed boolean default false,
  priority text default 'none',
  category text default 'General',
  due_date text,
  notes text,
  created_at bigint not null,
  completed_at bigint
);

-- 2. Enable Row Level Security (RLS) or public access for anon API key
alter table public.todos enable row level security;

-- 3. Policy: Allow anon key to read and write todos
create policy "Allow access to todos" on public.todos
  for all
  using (true)
  with check (true);

-- 4. Enable Realtime updates
alter publication supabase_realtime add table public.todos;
`;
