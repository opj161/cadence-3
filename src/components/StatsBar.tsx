import React from 'react';
import { DocumentStats } from '../types/index';
import { AlignLeft, Hash, Activity, BarChart2 } from 'lucide-react';

interface StatsBarProps {
  stats: DocumentStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="h-10 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 select-none shrink-0 z-10">
      <div className="flex items-center gap-6 text-[11px] font-mono font-medium tracking-tight text-gray-500 dark:text-gray-500">
        <div className="flex items-center gap-1.5" title="Total Word Count">
          <AlignLeft className="w-3.5 h-3.5" />
          <span>{stats.wordCount} <span className="hidden sm:inline">words</span></span>
        </div>
        <div className="flex items-center gap-1.5" title="Total Syllable Count">
          <Hash className="w-3.5 h-3.5" />
          <span>{stats.totalSyllables} <span className="hidden sm:inline">syl</span></span>
        </div>
        <div className="flex items-center gap-1.5" title="Average Syllables per Line">
          <Activity className="w-3.5 h-3.5" />
          <span>{stats.avgSyllablesPerLine.toFixed(1)} <span className="hidden sm:inline">avg</span></span>
        </div>
      </div>
      
      <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-600 font-mono">
        <BarChart2 className="w-3 h-3" />
        <span>ANALYTICS ACTIVE</span>
      </div>
    </div>
  );
};