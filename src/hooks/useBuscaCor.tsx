import { useState, useEffect } from "react";
import { Cor } from "@/types/tinta";
import { cores } from "@/data/mockData";

const HISTORICO_KEY = "historico_codigos_cores";

interface HistoricoCodigo {
  codigo: string;
  cor: string;
  timestamp: number;
}

export const useBuscaCor = () => {
  const [codigoInput, setCodigoInput] = useState("");
  const [corEncontrada, setCorEncontrada] = useState<Cor | null>(null);
  const [corSelecionada, setCorSelecionada] = useState<Cor | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [historico, setHistorico] = useState<HistoricoCodigo[]>([]);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = () => {
    try {
      const stored = localStorage.getItem(HISTORICO_KEY);
      if (stored) {
        setHistorico(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const salvarNoHistorico = (cor: Cor) => {
    const novo: HistoricoCodigo = {
      codigo: cor.codigo,
      cor: cor.nome,
      timestamp: Date.now(),
    };

    const novoHistorico = [
      novo,
      ...historico.filter((h) => h.codigo !== cor.codigo),
    ].slice(0, 5);

    setHistorico(novoHistorico);
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(novoHistorico));
  };

  const normalizarCodigo = (input: string): string => {
    return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  };

  const buscarCor = (codigo: string) => {
    if (!codigo.trim()) {
      setCorEncontrada(null);
      return;
    }

    setBuscando(true);

    setTimeout(() => {
      const codigoNormalizado = normalizarCodigo(codigo);

      const corEncontradaResult = cores.find((c) => {
        const codigoLimpo = c.codigo.replace(/[^A-Z0-9]/g, "");
        const codigoDisplay = c.codigoDisplay?.replace(/[^0-9]/g, "");

        return (
          codigoLimpo === codigoNormalizado ||
          codigoLimpo.endsWith(codigoNormalizado) ||
          codigoDisplay === codigoNormalizado ||
          c.codigo === codigo.trim().toUpperCase()
        );
      });

      setCorEncontrada(corEncontradaResult || null);
      setBuscando(false);
    }, 200);
  };

  const confirmarSelecao = () => {
    if (corEncontrada) {
      setCorSelecionada(corEncontrada);
      salvarNoHistorico(corEncontrada);
    }
  };

  const limparSelecao = () => {
    setCorSelecionada(null);
    setCorEncontrada(null);
    setCodigoInput("");
  };

  const selecionarDoHistorico = (codigo: string) => {
    const cor = cores.find((c) => c.codigo === codigo);
    if (cor) {
      setCorSelecionada(cor);
      setCodigoInput(cor.codigoDisplay || cor.codigo);
    }
  };

  return {
    codigoInput,
    setCodigoInput,
    corEncontrada,
    corSelecionada,
    buscando,
    historico,
    buscarCor,
    confirmarSelecao,
    limparSelecao,
    selecionarDoHistorico,
  };
};
