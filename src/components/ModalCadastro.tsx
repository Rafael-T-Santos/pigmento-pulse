import { CheckCircle2, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CadastroResponse } from "@/types/tinta";

interface ModalCadastroProps {
  isOpen: boolean;
  onClose: () => void;
  dados: CadastroResponse | null;
}

export const ModalCadastro = ({ isOpen, onClose, dados }: ModalCadastroProps) => {
  if (!dados) return null;

  const copiarTexto = async (texto: string, tipo: string) => {
    try {
      // Tenta usar a API moderna de Clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(texto);
        toast.success(`${tipo} copiado com sucesso!`);
      } else {
        throw new Error("Clipboard API indisponível");
      }
    } catch (err) {
      // Fallback para método antigo se a API falhar ou não existir
      try {
        const textArea = document.createElement("textarea");
        textArea.value = texto;
        
        // Garante que o elemento não afete o layout visualmente
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success(`${tipo} copiado com sucesso!`);
        } else {
          toast.error(`Não foi possível copiar o ${tipo.toLowerCase()}`);
        }
      } catch (fallbackErr) {
        console.error("Erro ao copiar:", fallbackErr);
        toast.error("Erro ao copiar para a área de transferência");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4 pt-4">
            <div className="rounded-full bg-success/20 p-3">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <DialogTitle className="text-2xl text-center">
              Tinta Cadastrada com Sucesso!
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Código */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Código
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-accent rounded-md">
                <p className="font-mono font-semibold text-lg">{dados.codigo}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copiarTexto(dados.codigo, "Código")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Nome do Produto */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Nome do Produto
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-accent rounded-md">
                <p className="font-medium">{dados.nomeProduto}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copiarTexto(dados.nomeProduto, "Nome")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button onClick={onClose} size="lg" className="min-w-[200px]">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};