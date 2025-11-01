import { useState, useEffect } from "react";
import { Paintbrush } from "lucide-react";
import { ConsultaForm } from "@/components/ConsultaForm";
import { ResultadoCard } from "@/components/ResultadoCard";
import { ModalCadastro } from "@/components/ModalCadastro";
import {
  ConsultaForm as ConsultaFormType,
  ResultadoConsulta,
  CadastroResponse,
  PigmentoComNome,
} from "@/types/tinta";
import {
  cores,
  bases,
  tamanhos,
  tabelasPreco,
  pigmentos,
  calcularPreco,
} from "@/data/mockData";
import {
  buscarNoCache,
  salvarNoCache,
  limparCacheExpirado,
} from "@/utils/cache";
import { toast } from "sonner";

const Index = () => {
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [isConsultando, setIsConsultando] = useState(false);
  const [isCadastrando, setIsCadastrando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [dadosCadastro, setDadosCadastro] = useState<CadastroResponse | null>(
    null
  );

  // Limpar cache expirado ao carregar
  useEffect(() => {
    limparCacheExpirado();
  }, []);

  const realizarConsulta = async (form: ConsultaFormType) => {
    setIsConsultando(true);
    setResultado(null);

    // Simular delay de busca
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Buscar no cache primeiro
    const cache = buscarNoCache(form.cor_id, form.base_id, form.tamanho_id);
    if (cache) {
      setResultado(cache);
      setIsConsultando(false);
      toast.success("Consulta realizada (dados em cache)");
      return;
    }

    // Buscar dados
    const cor = cores.find((c) => c.id === form.cor_id)!;
    const base = bases.find((b) => b.id === form.base_id)!;
    const tamanho = tamanhos.find((t) => t.id === form.tamanho_id)!;
    const tabelaPreco = tabelasPreco.find((tp) => tp.id === form.tabela_preco_id)!;

    // Calcular pigmentos com nomes e percentuais
    const totalPigmentos = cor.pigmentos.reduce(
      (sum, p) => sum + p.quantidade_ml,
      0
    );
    const pigmentosComNome: PigmentoComNome[] = cor.pigmentos.map((p) => {
      const pigmento = pigmentos.find((pig) => pig.id === p.pigmento_id)!;
      return {
        ...p,
        nome: pigmento.nome,
        percentual: (p.quantidade_ml / totalPigmentos) * 100,
      };
    });

    // Calcular preço
    const precoVenda = calcularPreco(tamanho, tabelaPreco);

    const novoResultado: ResultadoConsulta = {
      cor,
      base,
      tamanho,
      tabelaPreco,
      pigmentos: pigmentosComNome,
      precoVenda,
      cadastrada: false,
    };

    setResultado(novoResultado);
    salvarNoCache(novoResultado);
    setIsConsultando(false);
    toast.success("Consulta realizada com sucesso!");
  };

  const cadastrarTinta = async () => {
    if (!resultado) return;

    setIsCadastrando(true);

    // Simular chamada ao sistema externo
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Gerar resposta mockada
    const codigoGerado = `TIN-${Math.floor(100000 + Math.random() * 900000)}`;
    const nomeProduto = `${resultado.cor.nome} - ${resultado.base.nome} - ${resultado.tamanho.nome}`;

    const response: CadastroResponse = {
      sucesso: true,
      codigo: codigoGerado,
      nomeProduto,
    };

    // Atualizar resultado
    const resultadoAtualizado: ResultadoConsulta = {
      ...resultado,
      cadastrada: true,
      codigoProduto: response.codigo,
      nomeProduto: response.nomeProduto,
    };

    setResultado(resultadoAtualizado);
    salvarNoCache(resultadoAtualizado);
    setDadosCadastro(response);
    setModalAberto(true);
    setIsCadastrando(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-header shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Paintbrush className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Consulta de Tintas</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Formulário */}
          <div className="bg-card rounded-lg shadow-card p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Realizar Consulta</h2>
            <ConsultaForm
              onSubmit={realizarConsulta}
              isLoading={isConsultando}
            />
          </div>

          {/* Resultado */}
          {resultado && (
            <ResultadoCard
              resultado={resultado}
              onCadastrar={cadastrarTinta}
              isCadastrando={isCadastrando}
            />
          )}
        </div>
      </main>

      {/* Modal */}
      <ModalCadastro
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        dados={dadosCadastro}
      />
    </div>
  );
};

export default Index;
