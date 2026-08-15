import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Tag, AlertCircle, AlignLeft, X } from 'lucide-react';
import { Priority, Task } from '../types';

interface TaskInputProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  categories: string[];
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, categories, inputRef }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleQuickDate = (type: 'today' | 'tomorrow' | 'clear') => {
    if (type === 'clear') {
      setDueDate('');
      return;
    }
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    }
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const finalCategory = category === 'custom' && customCategory.trim() 
      ? customCategory.trim() 
      : (category === 'custom' ? 'General' : category);

    onAddTask({
      title: trimmedTitle,
      completed: false,
      priority,
      category: finalCategory,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset fields
    setTitle('');
    setNotes('');
    setDueDate('');
    setPriority('none');
    setShowDetails(false);
  };

  return (
    <form
      id="task-input-form"
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs p-3 sm:p-4 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-900/5 dark:focus-within:ring-zinc-100/5"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <input
            id="new-task-title-input"
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task... (Press 'N' or '/' to focus)"
            className="w-full bg-transparent text-sm sm:text-base font-normal text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="toggle-details-btn"
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              showDetails || priority !== 'none' || dueDate || notes
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
            title="Toggle extra options (Date, Priority, Category, Notes)"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            id="add-task-submit-btn"
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Expandable attributes row */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Priority Selector */}
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-400 ml-1" />
              <span className="text-zinc-500 dark:text-zinc-400 mr-1">Priority:</span>
              {(['none', 'low', 'medium', 'high'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  none: 'text-zinc-600 dark:text-zinc-400',
                  low: 'text-blue-600 dark:text-blue-400',
                  medium: 'text-amber-600 dark:text-amber-400',
                  high: 'text-rose-600 dark:text-rose-400',
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2 py-0.5 rounded capitalize transition-colors font-medium ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-700 shadow-2xs font-semibold ' + colors[p]
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
              <Tag className="w-3.5 h-3.5 text-zinc-400 ml-1" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent text-zinc-700 dark:text-zinc-300 text-xs font-medium focus:outline-hidden pr-2 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    {cat}
                  </option>
                ))}
                <option value="custom" className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  + New Category
                </option>
              </select>
              {category === 'custom' && (
                <input
                  type="text"
                  placeholder="Tag name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-24 px-1.5 py-0.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                />
              )}
            </div>

            {/* Due Date Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 ml-1" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-xs text-zinc-700 dark:text-zinc-300 font-medium focus:outline-hidden cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleQuickDate('today')}
                className="px-1.5 py-0.5 text-2xs font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate('tomorrow')}
                className="px-1.5 py-0.5 text-2xs font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                Tmrw
              </button>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => handleQuickDate('clear')}
                  className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  title="Clear date"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Notes Textarea */}
          <div>
            <textarea
              placeholder="Optional notes or details for this task..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>
        </div>
      )}
    </form>
  );
};
