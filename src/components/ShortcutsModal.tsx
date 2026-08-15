import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N or /', description: 'Focus new task input' },
    { key: 'Enter', description: 'Save task or save edited title' },
    { key: 'Esc', description: 'Blur input / close modal / cancel edit' },
    { key: 'D', description: 'Toggle Dark / Light / System theme' },
    { key: 'C', description: 'Clear all completed tasks' },
    { key: '?', description: 'Open this shortcuts guide' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-5 z-10"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <Keyboard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Keyboard Shortcuts
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-xs"
              >
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                  {s.description}
                </span>
                <kbd className="px-2 py-1 font-mono text-2xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded shadow-2xs">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-2xs text-zinc-400 dark:text-zinc-500">
              Designed for effortless, keyboard-first workflow efficiency.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
