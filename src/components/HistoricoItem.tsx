import { CheckCircle2, AlertCircle, Clock, DollarSign, RefreshCw, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConsultaHistorico } from "@/types/tinta";
import { ColorPreview } from "./ColorPreview";

interface HistoricoItemProps {
  consulta: ConsultaHistorico;
  onConsultarNovamente: () => void;
}

const formatarDataRelativa = (timestamp: number): string => {
  const agora = Date.now();
  const diff = agora - timestamp;
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (minutos < 1) return "Agora";
  if (minutos < 60) return `Há ${minutos} minuto${minutos > 1 ? "s" : ""}`;
  if (horas < 24) {
    const data = new Date(timestamp);
    return `Hoje às ${data.getHours().toString().padStart(2, "0")}:${data
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  if (dias === 1) {
    const data = new Date(timestamp);
    return `Ontem às ${data.getHours().toString().padStart(2, "0")}:${data
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  
  const data = new Date(timestamp);
  return `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${data.getFullYear()}`;
};

export const HistoricoItem = ({
  consulta,
  onConsultarNovamente,
}: HistoricoItemProps) => {
  const isNovo = Date.now() - consulta.timestamp < 120000; // 2 minutos
  const quantidade = consulta.quantidade || 1;

  return (
    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
      <div className="space-y-2">
        {/* Nome da tinta com preview */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <ColorPreview 
              rgb={consulta.corRgb} 
              size="md" 
              rounded={true}
              className="mt-0.5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-tight">
                {quantidade > 1 && `${quantidade}x `}
                {consulta.cor} - {consulta.base} - {consulta.tamanho}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {consulta.tabelaPreco}
                {consulta.tributacao && ` • ${consulta.tributacao}`}
              </p>
              {quantidade > 1 && (
                <div className="flex items-center gap-1 mt-1">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {quantidade} {quantidade === 1 ? 'lata' : 'latas'}
                  </span>
                </div>
              )}
            </div>
          </div>
          {isNovo && (
            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary shrink-0">
              NOVO
            </Badge>
          )}
        </div>

        {/* Data */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatarDataRelativa(consulta.timestamp)}</span>
        </div>

        {/* Preço */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <DollarSign className="h-4 w-4" />
          <span>
            R$ {quantidade > 1 
              ? (consulta.precoVenda * quantidade).toFixed(2).replace(".", ",")
              : consulta.precoVenda.toFixed(2).replace(".", ",")}
          </span>
          {quantidade > 1 && (
            <span className="text-xs text-muted-foreground font-normal">
              (R$ {consulta.precoVenda.toFixed(2).replace(".", ",")} cada)
            </span>
          )}
        </div>

        {/* Status */}
        <div>
          {consulta.cadastrada ? (
            <Badge variant="default" className="bg-success text-success-foreground text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Cadastrada
              {consulta.codigoProduto && (
                <span className="ml-1 font-mono">| {consulta.codigoProduto}</span>
              )}
            </Badge>
          ) : (
            <Badge variant="default" className="bg-warning text-warning-foreground text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              Não Cadastrada
            </Badge>
          )}
        </div>

        {/* Botão */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={onConsultarNovamente}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Consultar Novamente
        </Button>
      </div>
    </div>
  );
};
