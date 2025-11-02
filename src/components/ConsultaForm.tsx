import { useState } from "react";
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
import { ConsultaForm as ConsultaFormType } from "@/types/tinta";
import { cores, bases, tamanhos, tabelasPreco } from "@/data/mockData";
import { QuantidadeInput } from "@/components/QuantidadeInput";

interface ConsultaFormProps {
  onSubmit: (form: ConsultaFormType) => void;
  isLoading?: boolean;
}

export const ConsultaForm = ({ onSubmit, isLoading }: ConsultaFormProps) => {
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

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData as ConsultaFormType);
    }
  };

  const updateField = (field: keyof ConsultaFormType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: parseInt(value) }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const isFormComplete = 
    formData.cor_id && 
    formData.base_id && 
    formData.tamanho_id && 
    formData.tabela_preco_id;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cor da Tinta */}
        <div className="space-y-2">
          <Label htmlFor="cor">Cor da Tinta</Label>
          <Select
            value={formData.cor_id?.toString()}
            onValueChange={(value) => updateField("cor_id", value)}
          >
            <SelectTrigger id="cor" className={errors.cor_id ? "border-destructive" : ""}>
              <SelectValue placeholder="Digite ou selecione a cor..." />
            </SelectTrigger>
            <SelectContent>
              {cores.map((cor) => (
                <SelectItem key={cor.id} value={cor.id.toString()}>
                  {cor.nome} ({cor.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.cor_id && (
            <p className="text-sm text-destructive">{errors.cor_id}</p>
          )}
        </div>

        {/* Base */}
        <div className="space-y-2">
          <Label htmlFor="base">Base</Label>
          <Select
            value={formData.base_id?.toString()}
            onValueChange={(value) => updateField("base_id", value)}
          >
            <SelectTrigger id="base" className={errors.base_id ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione a base..." />
            </SelectTrigger>
            <SelectContent>
              {bases.map((base) => (
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
          >
            <SelectTrigger id="tamanho" className={errors.tamanho_id ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione o tamanho..." />
            </SelectTrigger>
            <SelectContent>
              {tamanhos.map((tamanho) => (
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

        {/* Tabela de Preço */}
        <div className="space-y-2">
          <Label htmlFor="tabela">Tabela de Preço</Label>
          <Select
            value={formData.tabela_preco_id?.toString()}
            onValueChange={(value) => updateField("tabela_preco_id", value)}
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
