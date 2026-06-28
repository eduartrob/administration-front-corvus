import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'error' | 'outline' | 'surface';
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'primary', className = '', size = 'md' }: BadgeProps) {
  const baseClasses = 'font-semibold rounded-full flex items-center justify-center whitespace-nowrap';
  
  const sizeClasses = {
    sm: 'px-3 py-0.5 text-[11px] tracking-wide',
    md: 'px-3 py-1 text-label-sm',
  };

  const variantClasses = {
    primary: 'bg-primary-container/20 text-primary border border-primary/20',
    secondary: 'bg-secondary-container/20 text-secondary border border-secondary/20',
    error: 'bg-error-container text-error border border-error/30',
    outline: 'bg-surface-container-low text-on-surface-variant border border-outline-variant',
    surface: 'bg-surface-variant text-on-surface-variant',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
