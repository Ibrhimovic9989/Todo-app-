import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Download, Upload, Check, GitBranch, Globe, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onImportTasks,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'md' | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'deploy'>('export');

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# Minimalist Todo List\n\nGenerated on: ${new Date().toLocaleString()}\n\n`;
    
    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    md += `## Active Tasks (${pending.length})\n`;
    if (pending.length === 0) {
      md += `*No active tasks.*\n`;
    } else {
      pending.forEach((t) => {
        const priorityTag = t.priority !== 'none' ? ` [${t.priority.toUpperCase()}]` : '';
        const categoryTag = t.category ? ` #${t.category}` : '';
        const dueTag = t.dueDate ? ` (Due: ${t.dueDate})` : '';
        md += `- [ ] **${t.title}**${priorityTag}${categoryTag}${dueTag}\n`;
        if (t.notes) md += `  > ${t.notes}\n`;
      });
    }

    md += `\n## Completed Tasks (${completed.length})\n`;
    if (completed.length === 0) {
      md += `*No completed tasks.*\n`;
    } else {
      completed.forEach((t) => {
        md += `- [x] ~~${t.title}~~\n`;
      });
    }

    return md;
  };

  const handleCopy = (type: 'json' | 'md') => {
    const text = type === 'json' ? JSON.stringify(tasks, null, 2) : generateMarkdown();
    navigator.clipboard.writeText(text);
    setCopiedFormat(type);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownload = (type: 'json' | 'md') => {
    const text = type === 'json' ? JSON.stringify(tasks, null, 2) : generateMarkdown();
    const filename = `todos-${new Date().toISOString().split('T')[0]}.${type === 'json' ? 'json' : 'md'}`;
    const blob = new Blob([text], { type: type === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        setImportError('Invalid format: Expected a JSON array of tasks.');
        return;
      }
      // Basic validation
      const valid = parsed.every((t) => t && typeof t.title === 'string');
      if (!valid) {
        setImportError('Invalid task format in JSON array.');
        return;
      }
      onImportTasks(parsed);
      setImportJsonText('');
      onClose();
    } catch {
      setImportError('Failed to parse JSON string. Please verify the format.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-5 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Data & Deployment
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-3 pb-2 text-xs font-medium border-b border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'export'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'import'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Import
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('deploy')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'deploy'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              GitHub & Vercel
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-4 overflow-y-auto space-y-4 text-xs">
            {activeTab === 'export' && (
              <div className="space-y-4">
                <p className="text-zinc-600 dark:text-zinc-400">
                  Export your active and completed task list as clean Markdown documentation or structured JSON.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Markdown Card */}
                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2.5">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Markdown (.md)
                    </div>
                    <p className="text-2xs text-zinc-500 dark:text-zinc-400">
                      Formatted with checkboxes and tags, ideal for Obsidian, Notion, or GitHub Readme.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopy('md')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-2xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600"
                      >
                        {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedFormat === 'md' ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload('md')}
                        className="p-1.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600"
                        title="Download Markdown file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* JSON Card */}
                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2.5">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      JSON Data (.json)
                    </div>
                    <p className="text-2xs text-zinc-500 dark:text-zinc-400">
                      Complete data backup with full timestamps, categories, and priority fields.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopy('json')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-2xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600"
                      >
                        {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedFormat === 'json' ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload('json')}
                        className="p-1.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600"
                        title="Download JSON file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="space-y-3">
                <p className="text-zinc-600 dark:text-zinc-400">
                  Paste a previously exported JSON backup to restore or append tasks.
                </p>
                <textarea
                  rows={5}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='[{"id": "1", "title": "Example task", "completed": false, "priority": "high", "category": "Work"}]'
                  className="w-full p-2.5 font-mono text-2xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                />
                {importError && (
                  <div className="flex items-center gap-1.5 text-2xs text-rose-600 dark:text-rose-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{importError}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!importJsonText.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Restore Tasks
                </button>
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                    <GitBranch className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    Push to GitHub
                  </div>
                  <p className="text-2xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    You can export this codebase directly to GitHub at any time using the <strong>Export to GitHub</strong> option in the AI Studio upper header / settings menu, or download as a standalone ZIP.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                    <Globe className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    Deploy to Vercel / Production
                  </div>
                  <p className="text-2xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Once synced to your GitHub repo, connect the repository directly in your <strong>Vercel Dashboard</strong>. Vercel automatically detects the Vite/Next build configuration and deploys in seconds with zero configuration.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
