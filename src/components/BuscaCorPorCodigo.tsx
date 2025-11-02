import { useEffect } from "react";
import { Hash, Check, X, Loader2, Clock, Paintbrush } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBuscaCor } from "@/hooks/useBuscaCor";
import { cn } from "@/lib/utils";

interface BuscaCorPorCodigoProps {
  onCorSelecionada: (corId: number) => void;
  corIdAtual?: number;
}

export const BuscaCorPorCodigo = ({
  onCorSelecionada,
  corIdAtual,
}: BuscaCorPorCodigoProps) => {
  const {
    codigoInput,
    setCodigoInput,
    corEncontrada,
    corSelecionada,
    buscando,
    historico,
    buscarCor,
    confirmarSelecao,
    limparSelecao,
    selecionarDoHistorico,
  } = useBuscaCor();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (codigoInput) {
        buscarCor(codigoInput);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [codigoInput]);

  const handleConfirmar = () => {
    if (corEncontrada) {
      confirmarSelecao();
      onCorSelecionada(corEncontrada.id);
    }
  };

  const handleLimpar = () => {
    limparSelecao();
  };

  const handleHistoricoClick = (codigo: string) => {
    selecionarDoHistorico(codigo);
    const cor = historico.find((h) => h.codigo === codigo);
    if (cor) {
      const corCompleta = require("@/data/mockData").cores.find(
        (c: any) => c.codigo === codigo
      );
      if (corCompleta) {
        onCorSelecionada(corCompleta.id);
      }
    }
  };

  if (corSelecionada) {
    return (
      <div className="space-y-3">
        <Label>Cor da Tinta</Label>
        <Card className="border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                {corSelecionada.rgb && (
                  <div
                    className="w-10 h-10 rounded-full border-2 border-border shrink-0"
                    style={{ backgroundColor: corSelecionada.rgb }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                    <span className="font-semibold text-sm">
                      Cor Selecionada
                    </span>
                  </div>
                  <p className="font-medium text-foreground truncate">
                    <Paintbrush className="inline h-4 w-4 mr-1" />
                    {corSelecionada.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Código: {corSelecionada.codigo}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLimpar}
                className="shrink-0"
              >
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (buscando) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (codigoInput && corEncontrada) {
      return <Check className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }
    if (codigoInput && !corEncontrada && !buscando) {
      return <X className="h-4 w-4 text-destructive" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codigo-busca" className="flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Buscar por Código
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="codigo-busca"
              placeholder="Digite o código (ex: 0450, COR-0025)"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              className={cn(
                "pr-10",
                corEncontrada && "border-green-500 dark:border-green-400",
                codigoInput &&
                  !corEncontrada &&
                  !buscando &&
                  "border-destructive"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
          {historico.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" type="button">
                  <Clock className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Códigos Recentes
                  </p>
                  {historico.map((item) => (
                    <button
                      key={item.codigo}
                      onClick={() => handleHistoricoClick(item.codigo)}
                      className="w-full text-left px-2 py-2 rounded-md hover:bg-accent text-sm transition-colors"
                      type="button"
                    >
                      <div className="font-medium">{item.codigo}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.cor}
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Ex: 0450, C-450, COR-0025
        </p>
      </div>

      {corEncontrada && (
        <Card className="border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-700 dark:text-green-300">
                Cor encontrada!
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
              {corEncontrada.rgb && (
                <div
                  className="w-12 h-12 rounded-full border-2 border-border shrink-0"
                  style={{ backgroundColor: corEncontrada.rgb }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-foreground truncate">
                  <Paintbrush className="inline h-5 w-5 mr-1" />
                  {corEncontrada.nome}
                </p>
                <p className="text-sm text-muted-foreground">
                  {corEncontrada.codigo}
                </p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {corEncontrada.pigmentos.length} pigmentos
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConfirmar}
                className="flex-1"
                size="lg"
                type="button"
              >
                <Check className="mr-2 h-4 w-4" />
                Confirmar Seleção
              </Button>
              <Button
                onClick={() => setCodigoInput("")}
                variant="outline"
                size="lg"
                type="button"
              >
                Buscar Outra
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {codigoInput && !corEncontrada && !buscando && (
        <Card className="border-2 border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-destructive">
                Código não encontrado
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Verifique o código e tente novamente.
            </p>
            <p className="text-sm text-muted-foreground">
              Use a busca por nome abaixo se preferir.
            </p>
          </CardContent>
        </Card>
      )}

      {!codigoInput && !corEncontrada && (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">─── OU ───</p>
        </div>
      )}
    </div>
  );
};
