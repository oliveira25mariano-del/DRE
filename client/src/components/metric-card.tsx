import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'value' | 'none';
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  subtitle?: string;
  badge?: string;
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = 'percentage',
  trend = 'neutral',
  icon: Icon,
  color = 'blue',
  subtitle,
  badge,
  loading = false
}: MetricCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/20',
      icon: 'text-blue-400',
      border: 'border-blue-200/20'
    },
    green: {
      bg: 'bg-green-500/20',
      icon: 'text-green-400',
      border: 'border-green-200/20'
    },
    red: {
      bg: 'bg-red-500/20',
      icon: 'text-red-400',
      border: 'border-red-200/20'
    },
    yellow: {
      bg: 'bg-yellow-500/20',
      icon: 'text-yellow-400',
      border: 'border-yellow-200/20'
    },
    purple: {
      bg: 'bg-purple-500/20',
      icon: 'text-purple-400',
      border: 'border-purple-200/20'
    },
    orange: {
      bg: 'bg-orange-500/20',
      icon: 'text-orange-400',
      border: 'border-orange-200/20'
    }
  };

  const trendClasses = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  };

  const TrendIcon = trendIcons[trend];
  const colors = colorClasses[color];

  const formatChange = () => {
    if (change === undefined) return '';
    
    const absChange = Math.abs(change);
    
    switch (changeType) {
      case 'percentage':
        return `${absChange.toFixed(1)}%`;
      case 'value':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0
        }).format(absChange);
      default:
        return absChange.toString();
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded w-20"></div>
              <div className="h-8 bg-white/20 rounded w-24"></div>
              <div className="h-3 bg-white/20 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-effect ${colors.border}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-blue-100">{title}</p>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            
            <p className="text-2xl font-bold text-white">
              {typeof value === 'number' 
                ? new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0
                  }).format(value)
                : value
              }
            </p>
            
            {subtitle && (
              <p className="text-xs text-blue-300">{subtitle}</p>
            )}
            
            {change !== undefined && (
              <div className={`flex items-center text-sm ${trendClasses[trend]}`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                <span>{formatChange()}</span>
              </div>
            )}
          </div>
          
          <div className={`${colors.bg} p-3 rounded-full`}>
            <Icon className={`${colors.icon} w-6 h-6`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}