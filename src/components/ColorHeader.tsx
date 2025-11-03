import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getContrast, isValidRGB } from "@/utils/colorUtils";

interface ColorHeaderProps {
  corNome: string;
  corCodigo: string;
  corRgb?: string;
  baseNome: string;
  tamanhoNome: string;
  quantidade?: number;
}

export const ColorHeader = ({
  corNome,
  corCodigo,
  corRgb,
  baseNome,
  tamanhoNome,
  quantidade = 1,
}: ColorHeaderProps) => {
  const hasValidRgb = corRgb && isValidRGB(corRgb);
  const textColor = hasValidRgb ? getContrast(corRgb) : 'dark';

  const copiarRGB = () => {
    if (corRgb) {
      navigator.clipboard.writeText(corRgb);
      toast.success("Código RGB copiado!");
    }
  };

  // Fallback to gradient if no valid RGB
  const backgroundStyle = hasValidRgb
    ? { backgroundColor: corRgb }
    : { background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%)' };

  return (
    <div
      className={cn(
        "rounded-t-lg p-6 relative overflow-hidden",
        textColor === 'light' ? "text-white" : "text-gray-900"
      )}
      style={backgroundStyle}
    >
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold leading-tight">
              {quantidade > 1 && `${quantidade}x `}
              {corNome}
            </h3>
            <p className={cn(
              "text-sm mt-1",
              textColor === 'light' ? "text-white/80" : "text-gray-700"
            )}>
              {baseNome} • {tamanhoNome}
            </p>
          </div>
          
          {hasValidRgb && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copiarRGB}
              className={cn(
                "shrink-0",
                textColor === 'light' 
                  ? "hover:bg-white/20 text-white" 
                  : "hover:bg-black/10 text-gray-900"
              )}
            >
              <Copy className="mr-2 h-4 w-4" />
              {corRgb}
            </Button>
          )}
        </div>
        
        <div className={cn(
          "flex items-center gap-2 text-sm",
          textColor === 'light' ? "text-white/70" : "text-gray-600"
        )}>
          <span>Código: {corCodigo}</span>
          {hasValidRgb && (
            <>
              <span>•</span>
              <span>RGB: {corRgb}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
