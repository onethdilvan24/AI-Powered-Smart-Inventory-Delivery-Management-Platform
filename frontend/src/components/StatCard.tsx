import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down';
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
}

export default function StatCard({
  label,
  value,
  delta,
  deltaType,
  subtitle,
  icon,
  iconBg = 'bg-primary-600',
}: StatCardProps) {
  const isUp = deltaType === 'up';

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className={cn('flex items-center gap-1 mt-1.5 text-xs font-medium', isUp ? 'text-emerald-600' : 'text-red-500')}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{delta}</span>
          {subtitle && <span className="text-gray-400 font-normal">{subtitle}</span>}
        </div>
      </div>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0', iconBg)}>
        {icon}
      </div>
    </div>
  );
}
