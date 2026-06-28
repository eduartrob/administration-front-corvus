import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      className={`glass-panel p-6 rounded-2xl ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
