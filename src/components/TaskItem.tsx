import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle, 
  AlignLeft, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  X 
} from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showNotes, setShowNotes] = useState(false);
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed });
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleSaveNotes = () => {
    onUpdate(task.id, { notes: editNotes.trim() || undefined });
    setIsEditingNotes(false);
  };

  // Due date status calculation
  const getDueDateInfo = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    const target = new Date(dateStr);
    const todayObj = new Date(today);
    
    // Day diff
    const diffTime = target.getTime() - todayObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Overdue', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50' };
    }
    if (diffDays === 0) {
      return { label: 'Today', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50' };
    }
    if (diffDays === 1) {
      return { label: 'Tomorrow', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50' };
    }
    return {
      label: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700',
    };
  };

  const dueDateInfo = getDueDateInfo(task.dueDate);

  const priorityStyles: Record<Priority, { label: string; badge: string; dot: string }> = {
    none: { label: '', badge: '', dot: '' },
    low: {
      label: 'Low',
      badge: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/40',
      dot: 'bg-blue-500',
    },
    medium: {
      label: 'Medium',
      badge: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40',
      dot: 'bg-amber-500',
    },
    high: {
      label: 'High',
      badge: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40',
      dot: 'bg-rose-500',
    },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`group relative bg-white dark:bg-zinc-900 border rounded-xl p-3 sm:p-3.5 transition-all shadow-2xs ${
        task.completed
          ? 'border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 opacity-75'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Custom Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? 'Mark uncompleted' : 'Mark completed'}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all border shrink-0 ${
            task.completed
              ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900'
              : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500 dark:hover:border-zinc-400 bg-transparent'
          }`}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.div>
          )}
        </button>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Title / Edit field */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                ref={editInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveTitle}
                className="w-full text-sm font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-baseline gap-2">
              <span
                onDoubleClick={() => setIsEditing(true)}
                className={`text-sm font-medium leading-snug break-words transition-all select-none cursor-pointer ${
                  task.completed
                    ? 'line-through text-zinc-400 dark:text-zinc-500'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {task.title}
              </span>
            </div>
          )}

          {/* Badges / Metadata Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-2xs">
            {/* Priority Badge */}
            {task.priority !== 'none' && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${
                  priorityStyles[task.priority].badge
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    priorityStyles[task.priority].dot
                  }`}
                />
                {priorityStyles[task.priority].label}
              </span>
            )}

            {/* Category Badge */}
            {task.category && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-medium">
                #{task.category}
              </span>
            )}

            {/* Due Date Badge */}
            {dueDateInfo && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${dueDateInfo.color}`}
              >
                <Calendar className="w-3 h-3" />
                {dueDateInfo.label}
              </span>
            )}

            {/* Notes Toggle Indicator */}
            {task.notes && (
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <AlignLeft className="w-3 h-3" />
                <span>Note</span>
                {showNotes ? (
                  <ChevronUp className="w-2.5 h-2.5" />
                ) : (
                  <ChevronDown className="w-2.5 h-2.5" />
                )}
              </button>
            )}
          </div>

          {/* Expandable Notes View & Editor */}
          <AnimatePresence>
            {(showNotes || isEditingNotes) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs"
              >
                {isEditingNotes ? (
                  <div className="space-y-1.5">
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={2}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 text-xs focus:outline-hidden"
                      placeholder="Add task notes..."
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(false)}
                        className="px-2 py-0.5 rounded text-2xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="px-2 py-0.5 rounded text-2xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-300">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {task.notes}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditNotes(task.notes || '');
                        setIsEditingNotes(true);
                      }}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 shrink-0"
                      title="Edit note"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hover / Quick Actions */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Edit task title"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {!task.notes && (
            <button
              type="button"
              onClick={() => {
                setShowNotes(true);
                setIsEditingNotes(true);
              }}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Add a note"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
