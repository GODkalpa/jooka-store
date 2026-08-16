import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp 
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md hover:border-gray-300 transition-all group">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 truncate ${
              trendUp ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${trendUp ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-900 group-hover:bg-[#C8102E] group-hover:text-white group-hover:border-[#C8102E] transition-all flex-shrink-0 ml-3 shadow-2xs">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}