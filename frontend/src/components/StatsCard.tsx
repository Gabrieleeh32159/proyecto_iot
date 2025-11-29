import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'cyan' | 'indigo' | 'green';
}

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  // Render different complete components to ensure Tailwind sees all classes
  if (color === 'blue') {
    return (
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-600 border rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-2">{title}</p>
            <p className="text-4xl font-bold">{value}</p>
          </div>
          <div className="text-blue-400 bg-white/10 p-3 rounded-lg">
            {icon}
          </div>
        </div>
      </div>
    );
  } else if (color === 'cyan') {
    return (
      <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 border-cyan-600 border rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-cyan-200 text-sm mb-2">{title}</p>
            <p className="text-4xl font-bold">{value}</p>
          </div>
          <div className="text-cyan-400 bg-white/10 p-3 rounded-lg">
            {icon}
          </div>
        </div>
      </div>
    );
  } else if (color === 'indigo') {
    return (
      <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border-indigo-600 border rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm mb-2">{title}</p>
            <p className="text-4xl font-bold">{value}</p>
          </div>
          <div className="text-indigo-400 bg-white/10 p-3 rounded-lg">
            {icon}
          </div>
        </div>
      </div>
    );
  } else {
    // green - using exact same structure as cyan
    return (
      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-600 border rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-sm mb-2">{title}</p>
            <p className="text-4xl font-bold">{value}</p>
          </div>
          <div className="text-green-400 bg-white/10 p-3 rounded-lg">
            {icon}
          </div>
        </div>
      </div>
    );
  }
}
