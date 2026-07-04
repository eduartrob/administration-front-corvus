

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClass = "animate-pulse bg-surface-container-high/50";
  
  let variantClass = "";
  if (variant === 'circular') {
    variantClass = "rounded-full";
  } else if (variant === 'text') {
    variantClass = "rounded-md h-4";
  } else {
    variantClass = "rounded-xl";
  }

  return (
    <div className={`${baseClass} ${variantClass} ${className}`}></div>
  );
}
