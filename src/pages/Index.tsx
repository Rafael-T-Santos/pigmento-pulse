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
} from "@/data/mockData";
import {
  carregarDadosFormulas,
  buscarFormula,
  getCores,
} from "@/data/formulaService";
// Cache removido completamente conforme solicitado
import { calcularPrecoTotalViaApi } from "@/services/pricingService";
import { useHistoricoConsultas } from "@/hooks/useHistoricoConsultas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { aplicarRegraPrecoPsicologico } from "@/utils/pricingRules";

const Index = () => {
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [isConsultando, setIsConsultando] = useState(false);
  const [isCadastrando, setIsCadastrando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [dadosCadastro, setDadosCadastro] = useState<CadastroResponse | null>(null);
  const [historicoPanelAberto, setHistoricoPanelAberto] = useState(false);
  const resultadoRef = useRef<HTMLDivElement>(null);
  
  const { historico, adicionarConsulta, limparHistorico } = useHistoricoConsultas();

  // Estados para dados
  const [isFormulasLoading, setIsFormulasLoading] = useState(true);
  const [cores, setCores] = useState<Cor[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        await carregarDadosFormulas();
        setCores(getCores());
      } catch (error) {
        console.error(error);
        toast.error("Falha ao carregar arquivo de fórmulas.", {
          description: "Verifique o console e se o arquivo formulas.csv está na pasta /public",
        });
      } finally {
        setIsFormulasLoading(false);
      }
    };
    carregarDados();
  }, []);

  const realizarConsulta = async (form: ConsultaFormType) => {
    setIsConsultando(true);
    setResultado(null);

    const quantidade = form.quantidade || 1;
    if (quantidade < 1 || quantidade > 999) {
      toast.error("Quantidade deve ser entre 1 e 999");
      setIsConsultando(false);
      return;
    }

    // Identificar objetos selecionados
    const cor = cores.find((c) => c.id === form.cor_id)!;
    const base = bases.find((b) => b.id === form.base_id)!;
    const tamanho = tamanhos.find((t) => t.id === form.tamanho_id)!;
    const tabelaPreco = tabelasPreco.find((tp) => tp.id === form.tabela_preco_id)!;
    const tributacao = form.tributacao_id
      ? tributacoes.find((t) => t.id === form.tributacao_id)!
      : undefined;

    try {
      // 1. Obter a fórmula (Sempre busca fresca do arquivo carregado)
      const pigmentosComNome = buscarFormula(cor, base, tamanho);

      if (pigmentosComNome.length === 0) {
        toast.error("Fórmula não encontrada", {
          description: "Não existe fórmula para esta combinação de cor, base e tamanho.",
        });
        setIsConsultando(false);
        return;
      }

      // 2. Calcular Preço via API (Executa N vezes: Base + Pigmentos)
      // Se Tabela for Varejo (1) -> Tributação é selecionável. Se for Contribuinte (1) -> S, senão N.
      // Se Tabela for Atacado (0) -> Tributação é irrelevante aqui? Assumindo 'N' ou lógica padrão.
      // Ajuste a lógica do cobraST conforme sua regra exata.
      const cobraST = (tributacao?.id === 1) ? "S" : "N"; 
      const tabelaId = (tabelaPreco?.id === 1) ? 0 : 1;

      let precoVendaCalculado = 0;
      try {
        precoVendaCalculado = await calcularPrecoTotalViaApi({
          base,
          pigmentos: pigmentosComNome,
          codTabela: tabelaId,
          cobraST
        });
      } catch (error) {
        toast.error("Erro ao calcular preço", { 
          description: "Não foi possível conectar à API de preços." 
        });
        setIsConsultando(false);
        return;
      }

      // === APLICAÇÃO DA REGRA DE NEGÓCIO ===
      const precoVendaFinal = aplicarRegraPrecoPsicologico(
        precoVendaCalculado, 
        form.tabela_preco_id // Usamos o ID do form (2 = Varejo)
      );

      // 3. Verificar se produto já está cadastrado via API
      const payloadVerificacao = {
        pigmentos: pigmentosComNome.map((p) => ({
          codigo: p.pigmento_id,
          quantidade: p.quantidade_ml,
        })),
        base: {
          codigo: base.id
        }
      };

      let dadosDB = { cadastrada: false, codigoProduto: undefined, nomeProduto: undefined };
      
      try {
        const response = await fetch("/api/verificar-produto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadVerificacao),
        });

        if (response.ok) {
          dadosDB = await response.json();
        } else {
          console.warn("API de verificação retornou erro, assumindo não cadastrado.");
        }
      } catch (error) {
        console.error("Erro ao verificar produto:", error);
        // Não interrompe o fluxo, apenas assume que não está cadastrado
      }

      // 4. Montar Resultado Final
      const novoResultado: ResultadoConsulta = {
        cor,
        base,
        tamanho,
        tabelaPreco,
        tributacao,
        pigmentos: pigmentosComNome,
        precoVenda: precoVendaFinal, // Usamos o preço já ajustado pela regra
        cadastrada: dadosDB.cadastrada, // Status vindo da API
        codigoProduto: dadosDB.codigoProduto,
        nomeProduto: dadosDB.nomeProduto,
        quantidade: quantidade,
      };

      setResultado(novoResultado);
      toast.success("Consulta realizada com sucesso!");

      // Adicionar ao histórico visual (apenas log de sessão, sem impacto na lógica de negócio)
      const consultaHistorico: ConsultaHistorico = {
        id: `${Date.now()}-${Math.random()}`,
        cor: cor.nome,
        corRgb: cor.rgb,
        base: base.nome,
        tamanho: tamanho.nome,
        tabelaPreco: tabelaPreco.nome,
        tributacao: tributacao?.nome,
        precoVenda: precoVendaFinal,
        cadastrada: dadosDB.cadastrada,
        codigoProduto: dadosDB.codigoProduto,
        timestamp: Date.now(),
        dataFormatada: new Date().toLocaleString("pt-BR"),
        cor_id: form.cor_id,
        base_id: form.base_id,
        tamanho_id: form.tamanho_id,
        tabela_preco_id: form.tabela_preco_id,
        tributacao_id: form.tributacao_id,
        quantidade: quantidade,
      };
      adicionarConsulta(consultaHistorico);

    } catch (error) {
      console.error("Erro na consulta:", error);
      toast.error("Erro inesperado", { description: (error as Error).message });
    } finally {
      setIsConsultando(false);
    }
  };

  const cadastrarTinta = async () => {
    if (!resultado) return;
    setIsCadastrando(true);

    try {
      // Cálculo do volume em litros (ex: 3200ml -> 3.2)
      const volumeLitros = resultado.tamanho.volume_ml / 1000;

      // Montagem do payload conforme a nova especificação
      const payloadCadastro = {
        cor: {
          nome: resultado.cor.nome
        },
        base: {
          nome: resultado.base.nome,
          codigo: resultado.base.id
        },
        tamanho: {
          nome: `${volumeLitros}L`,       // Ex: "3.2L"
          codVol: resultado.tamanho.codigo, // Ex: "GL" (Vem de mockData/types)
          litros: volumeLitros            // Ex: 3.2 (Number)
        },
        pigmentos: resultado.pigmentos.map((p) => ({
          codigo: p.pigmento_id,
          quantidade: p.quantidade_ml,
        }))
      };

      // console.log("Payload enviado:", JSON.stringify(payloadCadastro, null, 2)); // Descomente para debug

      const responseApi = await fetch("/api/cadastrar-produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadCadastro),
      });

      if (!responseApi.ok) {
        const err = await responseApi.json();
        throw new Error(err.erro || "Falha ao cadastrar.");
      }

      const response: CadastroResponse = await responseApi.json();

      if (!response.sucesso) {
        throw new Error("Erro no retorno do cadastro.");
      }

      // Atualizar a interface com o sucesso
      const resultadoAtualizado: ResultadoConsulta = {
        ...resultado,
        cadastrada: true,
        codigoProduto: response.codigo,
        nomeProduto: response.nomeProduto,
      };

      setResultado(resultadoAtualizado);
      setDadosCadastro(response);
      setModalAberto(true);

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao cadastrar tinta", { description: (error as Error).message });
    } finally {
      setIsCadastrando(false);
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
    
    // Dispara uma nova consulta completa (sem cache)
    await realizarConsulta(formData);
    
    setTimeout(() => {
      resultadoRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-card rounded-lg shadow-card p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Realizar Consulta</h2>
            <ConsultaForm
              onSubmit={realizarConsulta}
              isLoading={isConsultando}
              isDataLoading={isFormulasLoading}
              cores={cores}
            />
          </div>

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

      <ModalCadastro
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        dados={dadosCadastro}
      />

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