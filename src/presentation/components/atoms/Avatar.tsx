interface AvatarProps {
  src?: string;
  initials?: string;
  alt?: string;
  className?: string;
  colorClass?: string;
}

export function Avatar({ src, initials, alt = '', className = 'w-10 h-10', colorClass = 'bg-primary text-white' }: AvatarProps) {
  return (
    <div className={`flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-outline-variant ${className} ${!src ? colorClass : 'bg-surface-container-highest'}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-sm">{initials}</span>
      )}
    </div>
  );
}
