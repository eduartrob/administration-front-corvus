

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  // Use outline-variant/30 instead of surface-container-high/50 because outline-variant supports <alpha-value> opacity in Tailwind config
  const baseClass = "animate-pulse bg-outline-variant/30";
  
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
