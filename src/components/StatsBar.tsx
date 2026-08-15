import React from 'react';
import { CheckCircle, Clock, Zap, Target } from 'lucide-react';
import { Task } from '../types';

interface StatsBarProps {
  tasks: Task[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const highPriorityPending = tasks.filter(
    (t) => !t.completed && t.priority === 'high'
  ).length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Productivity Overview
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            {pending === 0 && total > 0
              ? '✨ All tasks completed! Great work.'
              : `${pending} task${pending === 1 ? '' : 's'} remaining today`}
          </p>
        </div>

        {/* Mini stats counters */}
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{pending} pending</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>{completed} done</span>
          </div>
          {highPriorityPending > 0 && (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <Zap className="w-3.5 h-3.5" />
              <span>{highPriorityPending} urgent</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-2xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>Completion rate</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
