import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bases, tamanhos, tabelasPreco, tributacoes } from "@/data/mockData";
import { ConsultaForm as ConsultaFormType, Cor, Base, Tamanho } from "@/types/tinta";
import { QuantidadeInput } from "@/components/QuantidadeInput";
import { SeletorCorUnificado } from "@/components/SeletorCorUnificado";

import {
  getBasesDisponiveis,
  getTamanhosDisponiveis,
} from "@/data/formulaService";

interface ConsultaFormProps {
  onSubmit: (form: ConsultaFormType) => void;
  isLoading?: boolean;
  isDataLoading?: boolean;
  cores: Cor[];
}

export const ConsultaForm = ({ onSubmit, isLoading, isDataLoading, cores }: ConsultaFormProps) => {
  const [formData, setFormData] = useState<Partial<ConsultaFormType>>({
    quantidade: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.cor_id) newErrors.cor_id = "Selecione uma cor";
    if (!formData.base_id) newErrors.base_id = "Selecione uma base";
    if (!formData.tamanho_id) newErrors.tamanho_id = "Selecione um tamanho";
    if (!formData.tabela_preco_id) newErrors.tabela_preco_id = "Selecione uma tabela de preço";
    if (formData.tabela_preco_id === 1 && !formData.tributacao_id) {
      newErrors.tributacao_id = "Selecione a tributação";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData as ConsultaFormType);
    }
  };

  const updateField = (field: keyof ConsultaFormType, value: string) => {
    const intValue = parseInt(value);

    setFormData((prev) => {
      const newValues: Partial<ConsultaFormType> = {
        ...prev,
        [field]: intValue,
      };

      const corSel = cores.find(c => c.id === (field === 'cor_id' ? intValue : prev.cor_id)) || null;

      // Se mudei a Base, verifico se o Tamanho atual ainda é válido
      if (field === 'base_id') {
        const baseSel = bases.find(b => b.id === intValue) || null;
        const tamanhosVálidos = getTamanhosDisponiveis(corSel, baseSel);
        if (prev.tamanho_id && !tamanhosVálidos.find(t => t.id === prev.tamanho_id)) {
          newValues.tamanho_id = undefined;
        }
      }

      // Se mudei o Tamanho, verifico se a Base atual ainda é válida
      if (field === 'tamanho_id') {
        const tamanhoSel = tamanhos.find(t => t.id === intValue) || null;
        const basesVálidas = getBasesDisponiveis(corSel, tamanhoSel);
        if (prev.base_id && !basesVálidas.find(b => b.id === prev.base_id)) {
          newValues.base_id = undefined;
        }
      }

      // Lógica da tributação (existente)
      if (field === "tabela_preco_id" && intValue !== 1) {
        newValues.tributacao_id = undefined;
      }
      
      return newValues;
    });

    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Limpar campos 'base_id' e 'tamanho_id' ao mudar a cor
  const handleCorSelecionada = (cor: Cor | null) => {
    setFormData((prev) => ({
      ...prev,
      cor_id: cor?.id,
      base_id: undefined,
      tamanho_id: undefined,
    }));
    setErrors((prev) => ({
      ...prev,
      cor_id: "",
      base_id: "",
      tamanho_id: "",
    }));
  };
  
  // Calcular listas disponíveis usando useMemo
  const { corSelecionada, baseSelecionada, tamanhoSelecionado } = useMemo(() => {
    const cor = cores.find(c => c.id === formData.cor_id) || null;
    const base = bases.find(b => b.id === formData.base_id) || null;
    const tamanho = tamanhos.find(t => t.id === formData.tamanho_id) || null;
    return { 
      corSelecionada: cor, 
      baseSelecionada: base, 
      tamanhoSelecionado: tamanho 
    };
  }, [formData.cor_id, formData.base_id, formData.tamanho_id, cores]);

  const basesDisponiveis = useMemo(
    () => getBasesDisponiveis(corSelecionada, tamanhoSelecionado),
    [corSelecionada, tamanhoSelecionado]
  );
  
  const tamanhosDisponiveis = useMemo(
    () => getTamanhosDisponiveis(corSelecionada, baseSelecionada),
    [corSelecionada, baseSelecionada]
  );

  const isFormComplete =
    formData.cor_id &&
    formData.base_id &&
    formData.tamanho_id &&
    formData.tabela_preco_id &&
    (formData.tabela_preco_id !== 1 || formData.tributacao_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seletor de Cor Unificado */}
        <div className="md:col-span-2">
          <SeletorCorUnificado
            cores={cores}
            corSelecionada={cores.find(c => c.id === formData.cor_id) || null}
            onCorSelecionada={handleCorSelecionada}
          />
          {errors.cor_id && (
            <p className="text-sm text-destructive mt-2">{errors.cor_id}</p>
          )}
        </div>


        {/* Base */}
        <div className="space-y-2">
          <Label htmlFor="base">Base</Label>
          <Select
            value={formData.base_id?.toString()}
            onValueChange={(value) => updateField("base_id", value)}
            disabled={!formData.cor_id || isDataLoading}
          >
            <SelectTrigger id="base" className={errors.base_id ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione a base..." />
            </SelectTrigger>
            <SelectContent>
              {/* Mapeia a lista filtrada */}
              {basesDisponiveis.map((base) => (
                <SelectItem key={base.id} value={base.id.toString()}>
                  {base.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.base_id && (
            <p className="text-sm text-destructive">{errors.base_id}</p>
          )}
        </div>

        {/* Tamanho */}
        <div className="space-y-2">
          <Label htmlFor="tamanho">Tamanho</Label>
          <Select
            value={formData.tamanho_id?.toString()}
            onValueChange={(value) => updateField("tamanho_id", value)}
            disabled={!formData.cor_id || isDataLoading}
          >
            <SelectTrigger id="tamanho" className={errors.tamanho_id ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione o tamanho..." />
            </SelectTrigger>
            <SelectContent>
              {/* Mapeia a lista filtrada */}
              {tamanhosDisponiveis.map((tamanho) => (
                <SelectItem key={tamanho.id} value={tamanho.id.toString()}>
                  {tamanho.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tamanho_id && (
            <p className="text-sm text-destructive">{errors.tamanho_id}</p>
          )}
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
          {/* Tabela de Preço */}
          <div className="space-y-2">
            <Label htmlFor="tabela">Tabela de Preço</Label>
            <Select
              value={formData.tabela_preco_id?.toString()}
              onValueChange={(value) => updateField("tabela_preco_id", value)}
              disabled={isDataLoading}
            >
              <SelectTrigger id="tabela" className={errors.tabela_preco_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione a tabela..." />
              </SelectTrigger>
              <SelectContent>
                {tabelasPreco.map((tabela) => (
                  <SelectItem key={tabela.id} value={tabela.id.toString()}>
                    {tabela.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tabela_preco_id && (
              <p className="text-sm text-destructive">{errors.tabela_preco_id}</p>
            )}
          </div>

          {/*Tributação condicional */}
          {formData.tabela_preco_id === 1 && (
            <div className="space-y-2 animate-in fade-in-50 duration-300">
              <Label htmlFor="tributacao">Tributação</Label>
              <Select
                value={formData.tributacao_id?.toString()}
                onValueChange={(value) => updateField("tributacao_id", value)}
                disabled={isDataLoading}
              >
                <SelectTrigger id="tributacao" className={errors.tributacao_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione a tributação..." />
                </SelectTrigger>
                <SelectContent>
                  {tributacoes.map((tributacao) => (
                    <SelectItem key={tributacao.id} value={tributacao.id.toString()}>
                      {tributacao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tributacao_id && (
                <p className="text-sm text-destructive">{errors.tributacao_id}</p>
              )}
            </div>
          )}
        </div>

      {/* Quantidade de Latas */}
      <div className="pt-4 border-t">
        <QuantidadeInput
          value={formData.quantidade || 1}
          onChange={(value) => setFormData((prev) => ({ ...prev, quantidade: value }))}
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={!isFormComplete || isLoading}
          className="min-w-[200px]"
        >
          <Search className="mr-2 h-5 w-5" />
          {isLoading ? "Consultando..." : "Consultar"}
        </Button>
      </div>
    </form>
  );
};
