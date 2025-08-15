import React from 'react';
import { type LucideIcon } from 'lucide-react';
import Card from './Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  color = 'primary',
}) => {
  const colorClasses = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-secondary-500 text-white',
    success: 'bg-success-500 text-white',
    warning: 'bg-warning-500 text-white',
    error: 'bg-error-500 text-white',
  };

  const changeClasses = {
    positive: 'text-success-600',
    negative: 'text-error-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card hover className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${changeClasses[changeType]} mt-1`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;