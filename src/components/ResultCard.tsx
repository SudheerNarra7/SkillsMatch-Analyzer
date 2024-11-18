import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResultCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-xl p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-indigo-600" />
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);