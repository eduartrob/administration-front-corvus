import { ReactNode } from 'react';
import { Card } from '../atoms/Card';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { AlertCircle } from 'lucide-react';

export interface ActivityItem {
  id: string | number;
  user: string;
  role?: string;
  action: string;
  detail: string;
  time: string;
  tag: string;
  tagVariant?: 'primary' | 'secondary' | 'error' | 'outline' | 'surface';
  avatar?: string;
  isAlert?: boolean;
}

interface ActivityListProps {
  items: ActivityItem[];
  title?: string;
  actionElement?: ReactNode;
}

export function ActivityList({ items, title = 'Historial de Acciones Recientes', actionElement }: ActivityListProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-title-lg font-semibold text-on-surface">{title}</h3>
        {actionElement}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="divide-y divide-outline-variant/50">
          {items.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-surface-container-low/50 transition-colors">
              {item.isAlert ? (
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-error" />
                </div>
              ) : (
                <Avatar 
                  src={item.avatar} 
                  initials={item.user.substring(0, 2).toUpperCase()} 
                  alt={item.user} 
                  className="w-12 h-12" 
                />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-on-surface truncate">
                  {item.role ? `El ${item.role} ` : ''}
                  <span className="font-semibold">{item.user}</span> {item.action}.
                </p>
                <p className="text-label-sm text-on-surface-variant truncate mt-0.5">{item.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-label-sm text-outline font-medium">{item.time}</span>
                <Badge variant={item.tagVariant || 'surface'} size="sm">
                  {item.tag}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
