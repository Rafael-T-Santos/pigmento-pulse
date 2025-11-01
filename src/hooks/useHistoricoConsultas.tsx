import { useState, useEffect } from "react";
import { ConsultaHistorico } from "@/types/tinta";

const HISTORICO_KEY = "historico_consultas";
const MAX_HISTORICO = 10;

export const useHistoricoConsultas = () => {
  const [historico, setHistorico] = useState<ConsultaHistorico[]>([]);

  // Carregar histórico ao iniciar
  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = () => {
    try {
      const historicoStr = localStorage.getItem(HISTORICO_KEY);
      if (historicoStr) {
        const historicoData = JSON.parse(historicoStr);
        setHistorico(historicoData);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const adicionarConsulta = (consulta: ConsultaHistorico) => {
    try {
      setHistorico((prev) => {
        // Evitar duplicatas consecutivas
        if (
          prev.length > 0 &&
          prev[0].cor === consulta.cor &&
          prev[0].base === consulta.base &&
          prev[0].tamanho === consulta.tamanho
        ) {
          return prev;
        }

        // Adicionar no início e limitar a MAX_HISTORICO
        const novoHistorico = [consulta, ...prev].slice(0, MAX_HISTORICO);
        localStorage.setItem(HISTORICO_KEY, JSON.stringify(novoHistorico));
        return novoHistorico;
      });
    } catch (error) {
      console.error("Erro ao adicionar consulta ao histórico:", error);
    }
  };

  const limparHistorico = () => {
    try {
      localStorage.removeItem(HISTORICO_KEY);
      setHistorico([]);
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
    }
  };

  return { historico, adicionarConsulta, limparHistorico };
};
