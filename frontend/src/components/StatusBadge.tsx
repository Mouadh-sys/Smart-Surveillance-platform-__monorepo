import React from 'react';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';
import { cn } from '../lib/utils';

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  return (
    <span className={cn(
      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center whitespace-nowrap",
      getStatusColor(status),
      className
    )}>
      {getStatusLabel(status)}
    </span>
  );
};
