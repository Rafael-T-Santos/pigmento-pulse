import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { isCorClara, isValidRGB } from "@/utils/colorUtils";

interface ColorPreviewProps {
  rgb?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  rounded?: boolean;
  className?: string;
  showFallback?: boolean;
}

export const ColorPreview = ({
  rgb,
  size = 'md',
  showBorder = true,
  rounded = true,
  className = '',
  showFallback = true,
}: ColorPreviewProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-20 h-20',
  };

  // If no valid RGB, show fallback
  if (!rgb || !isValidRGB(rgb)) {
    if (!showFallback) return null;
    
    return (
      <div
        className={cn(
          sizeClasses[size],
          rounded ? 'rounded' : '',
          'bg-muted flex items-center justify-center',
          className
        )}
        aria-label="Sem preview de cor disponível"
      >
        <Palette className={cn(
          size === 'sm' ? 'w-2 h-2' : 
          size === 'md' ? 'w-3 h-3' : 
          size === 'lg' ? 'w-4 h-4' : 'w-8 h-8',
          'text-muted-foreground'
        )} />
      </div>
    );
  }

  const needsBorder = showBorder && isCorClara(rgb);

  return (
    <div
      className={cn(
        sizeClasses[size],
        rounded ? 'rounded' : '',
        needsBorder ? 'border-2 border-border' : '',
        'transition-transform hover:scale-110',
        className
      )}
      style={{ backgroundColor: rgb }}
      aria-label={`Preview da cor ${rgb}`}
      title={rgb}
    />
  );
};
