import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900 border border-gray-800 rounded-xl h-48">
    <Icon className="h-12 w-12 text-gray-500 mb-3" />
    <h3 className="text-lg font-medium text-white">{title}</h3>
    <p className="text-sm text-gray-400 mt-1 mb-4 max-w-sm">{description}</p>
    {action}
  </div>
);
