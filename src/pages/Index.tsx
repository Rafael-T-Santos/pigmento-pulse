import { useState, useEffect, useRef } from "react";
import { Paintbrush, History } from "lucide-react";
import { ConsultaForm } from "@/components/ConsultaForm";
import { ResultadoCard } from "@/components/ResultadoCard";
import { ModalCadastro } from "@/components/ModalCadastro";
import { HistoricoPanel } from "@/components/HistoricoPanel";
import {
  ConsultaForm as ConsultaFormType,
  ResultadoConsulta,
  CadastroResponse,
  PigmentoComNome,
  ConsultaHistorico,
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
import { useHistoricoConsultas } from "@/hooks/useHistoricoConsultas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [isConsultando, setIsConsultando] = useState(false);
  const [isCadastrando, setIsCadastrando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [dadosCadastro, setDadosCadastro] = useState<CadastroResponse | null>(
    null
  );
  const [historicoPanelAberto, setHistoricoPanelAberto] = useState(false);
  const resultadoRef = useRef<HTMLDivElement>(null);
  
  const { historico, adicionarConsulta, limparHistorico } = useHistoricoConsultas();

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

    // Adicionar ao histórico
    const consultaHistorico: ConsultaHistorico = {
      id: `${Date.now()}-${Math.random()}`,
      cor: cor.nome,
      base: base.nome,
      tamanho: tamanho.nome,
      tabelaPreco: tabelaPreco.nome,
      precoVenda,
      cadastrada: false,
      timestamp: Date.now(),
      dataFormatada: new Date().toLocaleString("pt-BR"),
      cor_id: form.cor_id,
      base_id: form.base_id,
      tamanho_id: form.tamanho_id,
      tabela_preco_id: form.tabela_preco_id,
    };
    adicionarConsulta(consultaHistorico);
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

    // Atualizar histórico com status de cadastrada
    const consultaHistorico: ConsultaHistorico = {
      id: `${Date.now()}-${Math.random()}`,
      cor: resultado.cor.nome,
      base: resultado.base.nome,
      tamanho: resultado.tamanho.nome,
      tabelaPreco: resultado.tabelaPreco.nome,
      precoVenda: resultado.precoVenda,
      cadastrada: true,
      codigoProduto: response.codigo,
      timestamp: Date.now(),
      dataFormatada: new Date().toLocaleString("pt-BR"),
      cor_id: resultado.cor.id,
      base_id: resultado.base.id,
      tamanho_id: resultado.tamanho.id,
      tabela_preco_id: resultado.tabelaPreco.id,
    };
    adicionarConsulta(consultaHistorico);
  };

  const handleConsultarNovamente = async (consulta: ConsultaHistorico) => {
    const formData: ConsultaFormType = {
      cor_id: consulta.cor_id,
      base_id: consulta.base_id,
      tamanho_id: consulta.tamanho_id,
      tabela_preco_id: consulta.tabela_preco_id,
    };
    
    await realizarConsulta(formData);
    
    // Scroll suave até o resultado
    setTimeout(() => {
      resultadoRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-header shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Paintbrush className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Consulta de Tintas</h1>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHistoricoPanelAberto(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <History className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Histórico</span>
              {historico.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {historico.length}
                </span>
              )}
            </Button>
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
            <div ref={resultadoRef}>
              <ResultadoCard
                resultado={resultado}
                onCadastrar={cadastrarTinta}
                isCadastrando={isCadastrando}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <ModalCadastro
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        dados={dadosCadastro}
      />

      {/* Painel de Histórico */}
      <HistoricoPanel
        isOpen={historicoPanelAberto}
        onClose={() => setHistoricoPanelAberto(false)}
        historico={historico}
        onLimparHistorico={limparHistorico}
        onConsultarNovamente={handleConsultarNovamente}
      />
    </div>
  );
};

export default Index;
