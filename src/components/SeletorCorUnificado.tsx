import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Cor } from "@/types/tinta";
import { cn } from "@/lib/utils";

interface SeletorCorUnificadoProps {
  cores: Cor[];
  corSelecionada: Cor | null;
  onCorSelecionada: (cor: Cor | null) => void;
}

export const SeletorCorUnificado = ({
  cores,
  corSelecionada,
  onCorSelecionada,
}: SeletorCorUnificadoProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filtrarCores = (termo: string): Cor[] => {
    if (!termo || termo.trim() === "") {
      return cores;
    }

    const termoNormalizado = termo.toLowerCase().trim();

    return cores.filter((cor) => {
      const nomeMatch = cor.nome.toLowerCase().includes(termoNormalizado);
      const codigoMatch = cor.codigoDisplay?.toLowerCase().includes(termoNormalizado) || 
                          cor.codigo.toLowerCase().includes(termoNormalizado);
      return nomeMatch || codigoMatch;
    });
  };

  const coresFiltradas = filtrarCores(searchValue);

  const handleSelect = (cor: Cor) => {
    onCorSelecionada(cor);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCorSelecionada(null);
    setSearchValue("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cor-selector">Cor da Tinta</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="cor-selector"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            {corSelecionada ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {corSelecionada.rgb && (
                  <div
                    className="w-4 h-4 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: corSelecionada.rgb }}
                  />
                )}
                <span className="truncate">
                  {corSelecionada.nome} ({corSelecionada.codigoDisplay || corSelecionada.codigo})
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                Digite o nome ou código da cor...
              </span>
            )}
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {corSelecionada && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100"
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Ex: Azul Celeste ou 0450"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center">
                  <p className="text-sm font-medium">⚠ Nenhuma cor encontrada</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verifique o nome ou código digitado
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {coresFiltradas.slice(0, 50).map((cor) => (
                  <CommandItem
                    key={cor.id}
                    value={cor.id.toString()}
                    onSelect={() => handleSelect(cor)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {cor.rgb && (
                        <div
                          className="w-4 h-4 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: cor.rgb }}
                        />
                      )}
                      <span className="truncate">
                        {cor.nome}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({cor.codigoDisplay || cor.codigo})
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        corSelecionada?.id === cor.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        Digite o nome (ex: Azul Celeste) ou código (ex: 0450)
      </p>
    </div>
  );
};
