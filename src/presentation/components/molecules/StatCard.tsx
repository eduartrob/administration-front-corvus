import type { ReactNode } from 'react';
import { Card } from '../atoms/Card';
import { IconWrapper } from '../atoms/IconWrapper';
import { Badge } from '../atoms/Badge';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  iconVariant?: 'primary' | 'secondary' | 'error' | 'success';
  badgeText?: string;
  badgeVariant?: 'primary' | 'secondary' | 'error' | 'outline' | 'surface';
  subText?: ReactNode;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  iconVariant = 'primary', 
  badgeText, 
  badgeVariant = 'outline', 
  subText,
  className = ''
}: StatCardProps) {
  return (
    <Card className={`flex flex-col justify-between h-full ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <IconWrapper variant={iconVariant}>
          {icon}
        </IconWrapper>
        {badgeText && (
          <Badge variant={badgeVariant} size="sm">
            {badgeText}
          </Badge>
        )}
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-display-lg font-bold text-on-surface leading-none">{value}</h2>
          {subText && <span className="font-medium text-title-lg">{subText}</span>}
        </div>
      </div>
    </Card>
  );
}
