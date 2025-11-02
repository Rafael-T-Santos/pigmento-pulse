import { CheckCircle2, AlertCircle, Plus, Package, DollarSign, BarChart3, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { ResultadoConsulta } from "@/types/tinta";
import { toast } from "sonner";

interface ResultadoCardProps {
  resultado: ResultadoConsulta;
  onCadastrar: () => void;
  isCadastrando?: boolean;
}

export const ResultadoCard = ({
  resultado,
  onCadastrar,
  isCadastrando,
}: ResultadoCardProps) => {
  const quantidade = resultado.quantidade || 1;
  const isMultiple = quantidade > 1;
  
  const totalPigmentosPorLata = resultado.pigmentos.reduce(
    (sum, p) => sum + p.quantidade_ml,
    0
  );
  
  const totalPigmentosGeral = totalPigmentosPorLata * quantidade;
  const valorTotal = resultado.precoVenda * quantidade;
  const custoPigmentosEstimado = totalPigmentosGeral * 0.30; // Custo estimado
  const margemTotal = valorTotal - custoPigmentosEstimado;
  const percentualMargem = (margemTotal / valorTotal) * 100;

  const copiarCalculo = () => {
    const texto = `CÁLCULO DE TINTAS - ${new Date().toLocaleString('pt-BR')}
================================
Tinta: ${resultado.cor.nome} - ${resultado.base.nome} - ${resultado.tamanho.nome}
Quantidade: ${quantidade} ${quantidade === 1 ? 'lata' : 'latas'}

PIGMENTOS NECESSÁRIOS:
${resultado.pigmentos
  .filter((p) => p.quantidade_ml > 0)
  .map((p) => `- ${p.nome}: ${(p.quantidade_ml * quantidade).toFixed(1)} ml (${p.quantidade_ml.toFixed(1)} ml por lata)`)
  .join('\n')}
Total: ${totalPigmentosGeral.toFixed(1)} ml

VALORES:
Unitário: R$ ${resultado.precoVenda.toFixed(2).replace('.', ',')}
Total: R$ ${valorTotal.toFixed(2).replace('.', ',')}
Custo Pigmentos: R$ ${custoPigmentosEstimado.toFixed(2).replace('.', ',')}
Margem: R$ ${margemTotal.toFixed(2).replace('.', ',')} (${percentualMargem.toFixed(1)}%)`;

    navigator.clipboard.writeText(texto);
    toast.success("Cálculo copiado para a área de transferência!");
  };

  return (
    <Card className="shadow-elevated animate-in fade-in-50 duration-500">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              {quantidade > 1 && `${quantidade}x `}
              {resultado.cor.nome} - {resultado.base.nome} - {resultado.tamanho.nome}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              {resultado.cadastrada ? (
                <Badge variant="default" className="bg-success text-success-foreground">
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Cadastrada
                </Badge>
              ) : (
                <Badge variant="default" className="bg-warning text-warning-foreground">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Não Cadastrada
                </Badge>
              )}
              {isMultiple && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Package className="mr-1 h-4 w-4" />
                  Cálculo Múltiplo
                </Badge>
              )}
              {quantidade >= 10 && (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                  Pedido Grande
                </Badge>
              )}
            </div>
          </div>
          {resultado.cadastrada && resultado.codigoProduto && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Código</p>
              <p className="font-mono font-semibold text-lg">{resultado.codigoProduto}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Header para Cálculo Múltiplo */}
        {isMultiple && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg text-primary">
                CÁLCULO PARA {quantidade} LATAS
              </h3>
            </div>
          </div>
        )}

        {/* Fórmula de Pigmentos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              Pigmentos Necessários {isMultiple && "- TOTAL"}
            </h3>
            {isMultiple && (
              <Button
                variant="outline"
                size="sm"
                onClick={copiarCalculo}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Cálculo
              </Button>
            )}
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pigmento</TableHead>
                  {isMultiple && (
                    <TableHead className="text-right">Por Lata</TableHead>
                  )}
                  <TableHead className="text-right">
                    {isMultiple ? "Total" : "Quantidade (ml)"}
                  </TableHead>
                  <TableHead className="text-right">
                    {isMultiple ? "% Total" : "Percentual"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.pigmentos
                  .filter((p) => p.quantidade_ml > 0)
                  .map((pigmento, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pigmento.nome}</TableCell>
                      {isMultiple && (
                        <TableCell className="text-right text-muted-foreground">
                          {pigmento.quantidade_ml.toFixed(1)} ml
                        </TableCell>
                      )}
                      <TableCell className={`text-right ${isMultiple ? 'font-semibold text-primary' : ''}`}>
                        {isMultiple 
                          ? `${(pigmento.quantidade_ml * quantidade).toFixed(1)} ml`
                          : `${pigmento.quantidade_ml} ml`
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {pigmento.percentual.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  {isMultiple && (
                    <TableCell className="text-right font-semibold text-muted-foreground">
                      {totalPigmentosPorLata.toFixed(1)} ml
                    </TableCell>
                  )}
                  <TableCell className="text-right font-semibold">
                    {isMultiple 
                      ? `${totalPigmentosGeral.toFixed(1)} ml`
                      : `${totalPigmentosPorLata} ml`
                    }
                  </TableCell>
                  <TableCell className="text-right font-semibold">100%</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        {/* Precificação */}
        {isMultiple ? (
          <div className="space-y-4">
            <div className="bg-accent/30 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Valores Financeiros</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor Unitário:</span>
                  <span className="font-medium">R$ {resultado.precoVenda.toFixed(2).replace(".", ",")}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-medium">× {quantidade} {quantidade === 1 ? 'lata' : 'latas'}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center bg-success/10 rounded-md p-3 border border-success/20">
                  <span className="font-semibold text-lg">Valor Total:</span>
                  <span className="text-2xl font-bold text-success">
                    R$ {valorTotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo Pigmentos:</span>
                  <span>R$ {custoPigmentosEstimado.toFixed(2).replace(".", ",")}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Margem Total:</span>
                  <span className="text-success font-medium">
                    R$ {margemTotal.toFixed(2).replace(".", ",")} ({percentualMargem.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Resumo Rápido */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">Resumo Rápido</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Total de pigmentos: {totalPigmentosGeral.toFixed(1)} ml</li>
                <li>• Custo médio por lata: R$ {(custoPigmentosEstimado / quantidade).toFixed(2).replace(".", ",")}</li>
                <li>• Receita total: R$ {valorTotal.toFixed(2).replace(".", ",")}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-accent/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Preço de Venda</p>
            <p className="text-4xl font-bold text-primary">
              R$ {resultado.precoVenda.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ({resultado.tabelaPreco.nome})
            </p>
          </div>
        )}
        
        {/* Alerta para pedidos grandes */}
        {quantidade >= 10 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Pedido Grande!</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Considere verificar disponibilidade de pigmentos antes de confirmar.
              </p>
            </div>
          </div>
        )}

        {/* Ação de Cadastro */}
        <div className="pt-4">
          {resultado.cadastrada ? (
            <div className="text-center space-y-2 p-4 bg-success/10 rounded-lg border border-success/20">
              <p className="font-medium text-success">Tinta já cadastrada no sistema</p>
              {resultado.nomeProduto && (
                <p className="text-sm text-muted-foreground">{resultado.nomeProduto}</p>
              )}
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              onClick={onCadastrar}
              disabled={isCadastrando}
            >
              <Plus className="mr-2 h-5 w-5" />
              {isCadastrando ? "Cadastrando..." : "Cadastrar Tinta no Sistema"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
