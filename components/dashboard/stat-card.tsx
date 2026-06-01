import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

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
  // Dynamic Sparkline SVG paths based on trend direction
  const sparklinePath = isPositive
    ? "M2 20 Q 15 15, 30 18 T 60 8 T 90 2"
    : "M2 6 Q 15 12, 30 8 T 60 18 T 90 22";

  const sparklineStroke = isPositive ? "#14B8A6" : "#EF4444"; // Growth Teal vs Danger Red
  const sparklineGradId = `sparkGrad-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="bg-white border border-brand-border rounded-[20px] p-6 relative overflow-hidden flex flex-col justify-between space-y-5 group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] select-none">

      {/* Header Row: Title & Icon */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
            {title}
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight text-brand-navy">
            {value}
          </h3>
        </div>

        {/* Rounded square icon container with modern borders */}
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-brand-border flex items-center justify-center text-slate-450 group-hover:text-brand-blue group-hover:bg-blue-50/50 group-hover:border-brand-blue/30 transition-all duration-300">
          <Icon className="w-5 h-5 shrink-0" />
        </div>
      </div>

      {/* Center Row: Sparkline Visual representation */}
      <div className="h-8 w-full flex items-end">
        <svg className="w-24 h-full" viewBox="0 0 92 24" preserveAspectRatio="none">
          <defs>
            <linearGradient id={sparklineGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sparklineStroke} stopOpacity="0.15" />
              <stop offset="100%" stopColor={sparklineStroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Fill path under the trend line */}
          <path
            d={`${sparklinePath} L 90 24 L 2 24 Z`}
            fill={`url(#${sparklineGradId})`}
          />
          {/* Stroke path of the trend line */}
          <path
            d={sparklinePath}
            fill="none"
            stroke={sparklineStroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Footer Row: Description & Trend Badge */}
      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-50">
        <span className="text-slate-400 font-semibold truncate max-w-[70%]">
          {description}
        </span>

        {trend && (
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide leading-none shrink-0
            ${isPositive
              ? 'bg-teal-50 text-brand-teal border-teal-100'
              : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-3 h-3 stroke-[2.5]" />
            )}
            <span>{trend}</span>
          </span>
        )}
      </div>

    </div>
  );
}
