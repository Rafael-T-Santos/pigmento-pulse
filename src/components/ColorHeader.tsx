import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getContrast, isValidRGB } from "@/utils/colorUtils";
import { ColorPreview } from "./ColorPreview";

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

  // Sem hex conhecido não há o que pintar. Antes caía num gradiente da cor
  // primária do sistema, que o usuário lia como se fosse a cor da tinta; agora
  // fica neutro e mostra o mesmo marcador de "sem preview" usado no seletor.
  const backgroundStyle = hasValidRgb ? { backgroundColor: corRgb } : undefined;

  return (
    <div
      className={cn(
        "rounded-t-lg p-6 relative overflow-hidden",
        hasValidRgb
          ? textColor === 'light' ? "text-white" : "text-gray-900"
          : "bg-muted text-foreground"
      )}
      style={backgroundStyle}
    >
      {/* Subtle overlay for depth */}
      {hasValidRgb && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      )}
      
      <div className="relative z-10 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold leading-tight">
              {quantidade > 1 && `${quantidade}x `}
              {corNome}
            </h3>
            <p className={cn(
              "text-sm mt-1",
              hasValidRgb
                ? textColor === 'light' ? "text-white/80" : "text-gray-700"
                : "text-muted-foreground"
            )}>
              {baseNome} • {tamanhoNome}
            </p>
          </div>

          {hasValidRgb ? (
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
          ) : (
            // Mesmo quadrado com ícone de paleta que o seletor mostra para esta cor.
            <div className="shrink-0 flex items-center gap-2 text-sm text-muted-foreground">
              <ColorPreview rgb={undefined} size="lg" rounded={true} />
              <span>Sem preview de cor</span>
            </div>
          )}
        </div>

        <div className={cn(
          "flex items-center gap-2 text-sm",
          hasValidRgb
            ? textColor === 'light' ? "text-white/70" : "text-gray-600"
            : "text-muted-foreground"
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
