import React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, colorClass }) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col justify-center">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{title}</p>
        {/* Optional icon inclusion */}
        {Icon && <Icon className="h-4 w-4 text-neutral-600" />}
      </div>
      <div className="flex items-end gap-2">
        <h3 className={cn("text-2xl font-mono", colorClass ? colorClass : "text-white")}>{value}</h3>
        
        {trend && (
          <span className={cn(
            "text-[10px] mb-1",
            trendUp ? "text-emerald-500" : "text-rose-500"
          )}>
            {trendUp ? '+' : ''}{trend} vs yest.
          </span>
        )}
      </div>
    </div>
  );
};
