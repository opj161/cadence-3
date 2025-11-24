import React from 'react';
import { DocumentStats } from '../types';
import { AlignLeft, Hash, Activity } from 'lucide-react';

interface StatsBarProps {
  stats: DocumentStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="h-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center px-6 gap-8 text-xs font-mono text-gray-500 dark:text-gray-400 select-none">
      <div className="flex items-center gap-2" title="Total Word Count">
        <AlignLeft className="w-4 h-4" />
        <span>{stats.wordCount} words</span>
      </div>
      <div className="flex items-center gap-2" title="Total Syllable Count">
        <Hash className="w-4 h-4" />
        <span>{stats.totalSyllables} syll</span>
      </div>
      <div className="flex items-center gap-2" title="Average Syllables per Line">
        <Activity className="w-4 h-4" />
        <span>{stats.avgSyllablesPerLine.toFixed(1)} avg/line</span>
      </div>
    </div>
  );
};
