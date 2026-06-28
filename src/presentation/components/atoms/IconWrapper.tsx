import { ReactNode } from 'react';

interface IconWrapperProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'error' | 'success';
  className?: string;
  shape?: 'rounded' | 'circle';
}

export function IconWrapper({ children, variant = 'primary', className = '', shape = 'rounded' }: IconWrapperProps) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
  
  const variantClasses = {
    primary: 'bg-surface-container text-primary',
    secondary: 'bg-secondary-container/20 text-secondary',
    error: 'bg-error-container text-error',
    success: 'bg-green-500/20 text-green-600',
  };

  return (
    <div className={`p-3 ${shapeClass} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
