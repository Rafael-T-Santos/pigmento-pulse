import { CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const totalPigmentos = resultado.pigmentos.reduce(
    (sum, p) => sum + p.quantidade_ml,
    0
  );

  return (
    <Card className="shadow-elevated animate-in fade-in-50 duration-500">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              {resultado.cor.nome} - {resultado.base.nome} - {resultado.tamanho.nome}
            </CardTitle>
            <div className="flex gap-2">
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
        {/* Fórmula de Pigmentos */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Pigmentos Necessários</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pigmento</TableHead>
                  <TableHead className="text-right">Quantidade (ml)</TableHead>
                  <TableHead className="text-right">Percentual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.pigmentos
                  .filter((p) => p.quantidade_ml > 0)
                  .map((pigmento, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pigmento.nome}</TableCell>
                      <TableCell className="text-right">{pigmento.quantidade_ml}</TableCell>
                      <TableCell className="text-right">
                        {pigmento.percentual.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">
                    {totalPigmentos} ml
                  </TableCell>
                  <TableCell className="text-right font-semibold">100%</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        {/* Precificação */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-accent/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Preço de Venda</p>
          <p className="text-4xl font-bold text-primary">
            R$ {resultado.precoVenda.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ({resultado.tabelaPreco.nome})
          </p>
        </div>

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
