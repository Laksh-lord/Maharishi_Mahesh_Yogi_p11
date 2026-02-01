
import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '../types';

export const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  const colors: Record<ComplaintStatus, string> = {
    'Submitted': 'bg-blue-100 text-blue-800',
    'Assigned': 'bg-purple-100 text-purple-800',
    'In Progress': 'bg-amber-100 text-amber-800',
    'Resolved': 'bg-emerald-100 text-emerald-800',
    'Closed': 'bg-slate-100 text-slate-800',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: ComplaintPriority }> = ({ priority }) => {
  const colors: Record<ComplaintPriority, string> = {
    'Low': 'bg-slate-100 text-slate-700',
    'Medium': 'bg-indigo-100 text-indigo-700',
    'High': 'bg-rose-100 text-rose-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${colors[priority]}`}>
      {priority}
    </span>
  );
};
