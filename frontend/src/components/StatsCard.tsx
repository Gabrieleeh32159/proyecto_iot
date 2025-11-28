import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'cyan' | 'indigo';
}

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-900/40 to-blue-800/40 border-blue-600',
    cyan: 'from-cyan-900/40 to-cyan-800/40 border-cyan-600',
    indigo: 'from-indigo-900/40 to-indigo-800/40 border-indigo-600',
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    indigo: 'text-indigo-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 backdrop-blur-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-blue-200 text-sm mb-2">{title}</p>
          <p className="text-4xl">{value}</p>
        </div>
        <div className={`${iconColorClasses[color]} bg-white/10 p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
