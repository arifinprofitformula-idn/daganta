import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  isPositive?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  isPositive = true 
}: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between space-y-4 group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/10">
      {/* Background glow overlay */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-colors pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-start justify-between relative">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl font-extrabold tracking-tight text-white">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
          <Icon className="w-5 h-5 shrink-0" />
        </div>
      </div>

      {/* Footer / Trend Info */}
      <div className="flex items-center justify-between text-[10px] relative border-t border-slate-900 pt-3">
        <span className="text-slate-400 font-medium leading-none">{description}</span>
        {trend && (
          <span className={`font-bold px-1.5 py-0.5 rounded border leading-none
            ${isPositive 
              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/10' 
              : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
