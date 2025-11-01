import { Trash2, History, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConsultaHistorico } from "@/types/tinta";
import { HistoricoItem } from "./HistoricoItem";
import { toast } from "sonner";

interface HistoricoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  historico: ConsultaHistorico[];
  onLimparHistorico: () => void;
  onConsultarNovamente: (consulta: ConsultaHistorico) => void;
}

export const HistoricoPanel = ({
  isOpen,
  onClose,
  historico,
  onLimparHistorico,
  onConsultarNovamente,
}: HistoricoPanelProps) => {
  const handleLimpar = () => {
    onLimparHistorico();
    toast.success("Histórico limpo com sucesso");
  };

  const handleConsultarNovamente = (consulta: ConsultaHistorico) => {
    onConsultarNovamente(consulta);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-xl">Consultas Recentes</SheetTitle>
              {historico.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {historico.length}
                </Badge>
              )}
            </div>
            {historico.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja limpar todo o histórico de
                      consultas? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLimpar}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <SheetDescription>
            Suas últimas {historico.length} consulta(s) realizadas
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">
                Nenhuma consulta realizada ainda
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Suas consultas recentes aparecerão aqui
              </p>
            </div>
          ) : (
            historico.map((consulta) => (
              <HistoricoItem
                key={consulta.id}
                consulta={consulta}
                onConsultarNovamente={() => handleConsultarNovamente(consulta)}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
