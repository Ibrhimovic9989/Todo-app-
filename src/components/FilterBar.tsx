import React from 'react';
import { Search, ArrowUpDown, CheckCheck, Trash2, X } from 'lucide-react';
import { FilterStatus, SortOption } from '../types';

interface FilterBarProps {
  status: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  allCount: number;
  activeCount: number;
  completedCount: number;
  onCompleteAll: () => void;
  onClearCompleted: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  status,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  allCount,
  activeCount,
  completedCount,
  onCompleteAll,
  onClearCompleted,
}) => {
  return (
    <div className="space-y-3">
      {/* Top Filter Row: Search & Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Status Tabs */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium">
          <button
            type="button"
            onClick={() => onStatusChange('all')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
              status === 'all'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            All <span className="opacity-60 text-2xs ml-0.5">({allCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('active')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
              status === 'active'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Active <span className="opacity-60 text-2xs ml-0.5">({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('completed')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
              status === 'completed'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Done <span className="opacity-60 text-2xs ml-0.5">({completedCount})</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1.5 rounded-lg text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-zinc-700 dark:text-zinc-300 font-medium focus:outline-hidden cursor-pointer text-xs"
            >
              <option value="created" className="bg-white dark:bg-zinc-800">Date Added</option>
              <option value="due-date" className="bg-white dark:bg-zinc-800">Due Date</option>
              <option value="priority" className="bg-white dark:bg-zinc-800">Priority</option>
              <option value="alpha" className="bg-white dark:bg-zinc-800">A - Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Filter Row: Category Pills & Batch Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            All tags
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              #{cat}
            </button>
          ))}
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2 text-2xs text-zinc-500 dark:text-zinc-400">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onCompleteAll}
              className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3 h-3" />
              Complete all
            </button>
          )}
          {completedCount > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="inline-flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Clear done ({completedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
