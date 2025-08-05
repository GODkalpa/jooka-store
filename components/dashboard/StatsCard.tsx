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
    <div className="bg-charcoal rounded-lg p-4 sm:p-6 border border-gold/20">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">{value}</p>
          {trend && (
            <p className={`text-xs sm:text-sm mt-1 sm:mt-2 truncate ${
              trendUp ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {trend}
            </p>
          )}
        </div>
        <div className="p-2 sm:p-3 bg-gold/10 rounded-full flex-shrink-0 ml-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
        </div>
      </div>
    </div>
  );
}