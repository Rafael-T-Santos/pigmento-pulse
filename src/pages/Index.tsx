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
  Cor
} from "@/types/tinta";
import {
  bases,
  tamanhos,
  tabelasPreco,
  tributacoes,
  pigmentos,
  calcularPreco,
} from "@/data/mockData";
import {
  carregarDadosFormulas,
  buscarFormula,
  getCores,
} from "@/data/formulaService";
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

  // Estados para dados dinâmicos
  const [isFormulasLoading, setIsFormulasLoading] = useState(true);
  const [cores, setCores] = useState<Cor[]>([]); // Apenas 'cores' é dinâmico

  // Limpar cache expirado ao carregar
  useEffect(() => {
    limparCacheExpirado();
    
    const carregarDados = async () => {
      try {
        await carregarDadosFormulas(); // Carrega CSV e processa cores
        setCores(getCores()); // Busca as cores processadas
      } catch (error) {
        console.error(error);
        toast.error("Falha ao carregar arquivo de fórmulas.", {
          description: "Verifique o console e se o arquivo formulas.csv está na pasta /public",
        });
      } finally {
        setIsFormulasLoading(false); // Libera o formulário
      }
    };
    carregarDados();
  }, []);

  const realizarConsulta = async (form: ConsultaFormType) => {
    setIsConsultando(true);
    setResultado(null);

    // Validar quantidade
    const quantidade = form.quantidade || 1;
    if (quantidade < 1 || quantidade > 999) {
      toast.error("Quantidade deve ser entre 1 e 999");
      setIsConsultando(false);
      return;
    }

    // Buscar dados (componentes do formulário)
    const cor = cores.find((c) => c.id === form.cor_id)!;
    const base = bases.find((b) => b.id === form.base_id)!;
    const tamanho = tamanhos.find((t) => t.id === form.tamanho_id)!;
    const tabelaPreco = tabelasPreco.find((tp) => tp.id === form.tabela_preco_id)!;
    const tributacao = form.tributacao_id
      ? tributacoes.find((t) => t.id === form.tributacao_id)!
      : undefined;

    try {
      // 1. Verificar cache (para fórmula e preço)
      const cache = buscarNoCache(form.cor_id, form.base_id, form.tamanho_id);
      let pigmentosComNome: PigmentoComNome[];
      let precoVenda: number;

      if (cache) {
        pigmentosComNome = cache.pigmentos;
        precoVenda = cache.precoVenda;
        toast.info("Fórmula e preço carregados do cache.");
      } else {
        // 2. Buscar fórmula do CSV (se não estiver em cache)
        pigmentosComNome = buscarFormula(cor, base, tamanho);

        if (pigmentosComNome.length === 0) {
          toast.error("Fórmula não encontrada", {
            description: "Não existe fórmula para esta combinação de cor, base e tamanho no arquivo CSV.",
          });
          setIsConsultando(false);
          return;
        }

        // 3. Calcular preço (se não estiver em cache)
        precoVenda = calcularPreco(tamanho, tabelaPreco);
      }

      // 4. [NOVO] Montar o payload para a API
      const payloadApi = {
        baseLike: base.nome,
        baseVols: [tamanho.codigo, tamanho.nome],
        tolerancia: 0.001,
        pigmentos: pigmentosComNome.map(p => ({
          codigo: pigmentos.find(pig => pig.id === p.pigmento_id)?.codigo, // Encontra o código do pigmento
          quantidade: p.quantidade_ml,
          volume: tamanho.codigo // Usa o código do tamanho (ex: "T3200")
        }))
      };

      // 5. [NOVO] Chamar sua API para verificar o status
      const response = await fetch("/api/verificar-produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadApi),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.erro || "Falha ao verificar produto no banco de dados.");
      }

      const dadosDB: { cadastrada: boolean; codigoProduto?: string, nomeProduto?: string } = await response.json();

      // 6. Montar o resultado final com dados reais do DB
      const novoResultado: ResultadoConsulta = {
        cor,
        base,
        tamanho,
        tabelaPreco,
        tributacao,
        pigmentos: pigmentosComNome,
        precoVenda,
        cadastrada: dadosDB.cadastrada, // <-- DADO REAL
        codigoProduto: dadosDB.codigoProduto, // <-- DADO REAL
        nomeProduto: dadosDB.nomeProduto, // <-- DADO REAL
        quantidade: form.quantidade || 1,
      };

      setResultado(novoResultado);
      salvarNoCache(novoResultado); // Salva o resultado completo no cache
      toast.success("Consulta realizada com sucesso!");

      // 7. Adicionar ao histórico
      const consultaHistorico: ConsultaHistorico = {
        id: `${Date.now()}-${Math.random()}`,
        cor: cor.nome,
        corRgb: cor.rgb,
        base: base.nome,
        tamanho: tamanho.nome,
        tabelaPreco: tabelaPreco.nome,
        tributacao: tributacao?.nome,
        precoVenda,
        cadastrada: dadosDB.cadastrada, // <-- DADO REAL
        codigoProduto: dadosDB.codigoProduto, // <-- DADO REAL
        timestamp: Date.now(),
        dataFormatada: new Date().toLocaleString("pt-BR"),
        cor_id: form.cor_id,
        base_id: form.base_id,
        tamanho_id: form.tamanho_id,
        tabela_preco_id: form.tabela_preco_id,
        tributacao_id: form.tributacao_id,
        quantidade: form.quantidade || 1,
      };
      adicionarConsulta(consultaHistorico);

    } catch (error) {
      console.error("Erro na consulta:", error);
      toast.error("Erro ao realizar consulta", { description: (error as Error).message });
    } finally {
      setIsConsultando(false);
    }
  };

  const cadastrarTinta = async () => {
    if (!resultado) return;

    setIsCadastrando(true);

    try {
      // [NOVO] Chamar a API de cadastro
      const responseApi = await fetch("/api/cadastrar-produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultado), // Envia o resultado atual para o backend
      });

      if (!responseApi.ok) {
        const err = await responseApi.json();
        throw new Error(err.erro || "Falha ao cadastrar a tinta no sistema externo.");
      }

      const response: CadastroResponse = await responseApi.json();

      if (!response.sucesso) {
        throw new Error("API de cadastro retornou um erro.");
      }

      // Atualizar resultado (lógica mantida)
      const resultadoAtualizado: ResultadoConsulta = {
        ...resultado,
        cadastrada: true,
        codigoProduto: response.codigo,
        nomeProduto: response.nomeProduto,
        quantidade: resultado.quantidade || 1
      };

      setResultado(resultadoAtualizado);
      salvarNoCache(resultadoAtualizado); // Atualiza o cache com o item cadastrado
      setDadosCadastro(response);
      setModalAberto(true);

      // Atualizar histórico com status de cadastrada
      const consultaHistorico: ConsultaHistorico = {
        id: `${Date.now()}-${Math.random()}`,
        cor: resultado.cor.nome,
        corRgb: resultado.cor.rgb,
        base: resultado.base.nome,
        tamanho: resultado.tamanho.nome,
        tabelaPreco: resultado.tabelaPreco.nome,
        tributacao: resultado.tributacao?.nome,
        precoVenda: resultado.precoVenda,
        cadastrada: true,
        codigoProduto: response.codigo,
        timestamp: Date.now(),
        dataFormatada: new Date().toLocaleString("pt-BR"),
        cor_id: resultado.cor.id,
        base_id: resultado.base.id,
        tamanho_id: resultado.tamanho.id,
        tabela_preco_id: resultado.tabelaPreco.id,
        tributacao_id: resultado.tributacao?.id,
        quantidade: resultado.quantidade || 1,
      };
      adicionarConsulta(consultaHistorico);

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao cadastrar tinta", { description: (error as Error).message });
    } finally {
      setIsCadastrando(false); // Garante que o botão seja liberado
    }
  };

  const handleConsultarNovamente = async (consulta: ConsultaHistorico) => {
    const formData: ConsultaFormType = {
      cor_id: consulta.cor_id,
      base_id: consulta.base_id,
      tamanho_id: consulta.tamanho_id,
      tabela_preco_id: consulta.tabela_preco_id,
      tributacao_id: consulta.tributacao_id,
      quantidade: consulta.quantidade || 1,
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
              isDataLoading={isFormulasLoading} // Passa o status de loading
              cores={cores} // Passa as cores carregadas
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
