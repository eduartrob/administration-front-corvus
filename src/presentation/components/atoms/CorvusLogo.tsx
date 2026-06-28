interface CorvusLogoProps {
  className?: string;
}

export function CorvusLogo({ className = 'w-6 h-6' }: CorvusLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className={className}
    >
      <circle cx="256" cy="256" r="48" fill="currentColor" />
      <line x1="256" y1="256" x2="256" y2="112" stroke="currentColor" stroke-width="24" stroke-linecap="round" />
      <line x1="256" y1="256" x2="384" y2="192" stroke="currentColor" stroke-width="24" stroke-linecap="round" />
      <line x1="256" y1="256" x2="368" y2="368" stroke="currentColor" stroke-width="24" stroke-linecap="round" />
      <line x1="256" y1="256" x2="144" y2="336" stroke="currentColor" stroke-width="24" stroke-linecap="round" />
      <circle cx="256" cy="112" r="32" fill="currentColor" />
      <circle cx="384" cy="192" r="32" fill="currentColor" />
      <circle cx="368" cy="368" r="32" fill="currentColor" />
      <circle cx="144" cy="336" r="32" fill="currentColor" />
    </svg>
  );
}
