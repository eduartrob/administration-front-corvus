import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">{title}</h1>
        {description && (
          <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex flex-col items-end gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
