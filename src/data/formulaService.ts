import { Cor, Base, Tamanho, Pigmento, PigmentoComNome } from "@/types/tinta";
import Papa from "papaparse";
import {
  pigmentos as pigmentosMock,
  bases as mockBases,
  tamanhos as mockTamanhos,
} from "@/data/mockData";

// Interface para a linha do CSV
interface CsvRow {
  COLECAO: string;
  COD_COR: string;
  NOME_COR: string;
  PRODUTO: string; // Base
  BASE: string;
  EMBALAGEM: string; // Tamanho
  CAPACIDADE: string;
  CORANTE: string; // Código do Pigmento
  MLS: string;
}

// Armazenamento em cache
let loadedFormulas: CsvRow[] = [];
let cores: Cor[] = []; // [NOVO] Array para cores dinâmicas
let isDataLoaded = false;

// Função auxiliar para parsear MLS
const parseMLS = (mls: string): number => {
  return parseFloat(mls.replace(",", ".")) || 0;
};

// 1. Função de Carregamento
export const carregarDadosFormulas = async (): Promise<void> => {
  if (isDataLoaded) return;

  try {
    const response = await fetch("/formulas_iquine.csv"); // Busca da pasta /public
    const csvText = await response.text();

    const { data } = Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    loadedFormulas = data.filter(row => row.COLECAO === "IQUINE" && row.COD_COR);
    
    // [NOVA LÓGICA] Processar e de-duplicar as cores
    const coresMap = new Map<string, Cor>();
    let corIdCounter = 1;

    loadedFormulas.forEach((row) => {
      if (!coresMap.has(row.COD_COR)) {
        coresMap.set(row.COD_COR, {
          id: corIdCounter++,
          nome: row.NOME_COR,
          codigo: row.COD_COR,
          codigoDisplay: row.COD_COR, // Usando o próprio código como display
          ativa: true,
          rgb: undefined, // RGB não existe no CSV
        });
      }
    });

    cores = Array.from(coresMap.values()); // Salva a lista de cores
    isDataLoaded = true;
    console.log(`Fórmulas carregadas: ${loadedFormulas.length} linhas.`);
    console.log(`Cores carregadas: ${cores.length} cores únicas.`);

  } catch (error) {
    console.error("Erro ao carregar ou processar 'formulas_iquine.csv':", error);
    throw new Error("Não foi possível carregar os dados das fórmulas.");
  }
};

// 2. [NOVO] Getter para as cores carregadas
export const getCores = (): Cor[] => {
  if (!isDataLoaded) console.warn("Dados não carregados. Chame carregarDadosFormulas() primeiro.");
  return cores;
};

// 3. Função de Busca (está como na etapa anterior, o que está correto)
export const buscarFormula = (
  cor: Cor,
  base: Base,
  tamanho: Tamanho
): PigmentoComNome[] => {
  if (!isDataLoaded) {
    throw new Error("Os dados da fórmula ainda não foram carregados.");
  }

  // Encontra as linhas no CSV que correspondem à seleção
  const formulaRows = loadedFormulas.filter(
    (row) =>
      row.COD_COR === cor.codigo
  );

  // Filtra pelo produto (Base) e embalagem (Tamanho)
  const matchingRows = formulaRows.filter(
    (row) =>
      row.PRODUTO === base.nome &&
      row.EMBALAGEM === tamanho.nome
  );
  
  if (!matchingRows.length) {
    console.warn(`Nenhuma fórmula encontrada para: ${cor.nome}, ${base.nome}, ${tamanho.nome}`);
    return []; // Retorna array vazio
  }

  // Mapeia as linhas encontradas para o formato PigmentoComNome
  const pigmentosComNome: PigmentoComNome[] = matchingRows.map((row) => {
    // Encontra o pigmento correspondente na lista estática
    const pigmentoInfo = pigmentosMock.find(
      (p) => p.codigo === row.CORANTE
    );

    return {
      pigmento_id: pigmentoInfo?.id || 0, // Usa o ID do mock
      quantidade_ml: parseMLS(row.MLS),
      nome: pigmentoInfo?.nome || row.CORANTE, // Usa o Nome do mock, ou o código como fallback
      percentual: 0, // Será calculado abaixo
    };
  });

  // Recalcular percentuais
  const totalPigmentos = pigmentosComNome.reduce(
    (sum, p) => sum + p.quantidade_ml,
    0
  );

  if (totalPigmentos > 0) {
    return pigmentosComNome.map(p => ({
      ...p,
      percentual: (p.quantidade_ml / totalPigmentos) * 100,
    }));
  }

  return pigmentosComNome;
};

export const getBasesDisponiveis = (
  cor: Cor | null,
  tamanho: Tamanho | null
): Base[] => {
  // Se nenhuma cor for selecionada, retorna a lista estática completa
  if (!cor) {
    return mockBases;
  }

  // Filtra as linhas do CSV pela cor
  let linhasRelevantes = loadedFormulas.filter(
    (row) => row.COD_COR === cor.codigo || row.COD_COR === cor.codigoDisplay
  );

  // Se um tamanho também foi selecionado, filtra por ele
  if (tamanho) {
    linhasRelevantes = linhasRelevantes.filter(
      (row) => row.EMBALAGEM === tamanho.nome
    );
  }

  // Pega os nomes únicos de PRODUTO (Base) das linhas filtradas
  const nomesDeBasesDisponiveis = new Set(
    linhasRelevantes.map((row) => row.PRODUTO)
  );

  // Filtra a lista estática de bases (mockBases)
  // para retornar apenas aquelas que existem nas fórmulas
  return mockBases.filter((base) => nomesDeBasesDisponiveis.has(base.nome));
};

export const getTamanhosDisponiveis = (
  cor: Cor | null,
  base: Base | null
): Tamanho[] => {
  // Se nenhuma cor for selecionada, retorna a lista estática completa
  if (!cor) {
    return mockTamanhos;
  }

  // Filtra as linhas do CSV pela cor
  let linhasRelevantes = loadedFormulas.filter(
    (row) => row.COD_COR === cor.codigo || row.COD_COR === cor.codigoDisplay
  );

  // Se uma base também foi selecionada, filtra por ela
  if (base) {
    linhasRelevantes = linhasRelevantes.filter(
      (row) => row.PRODUTO === base.nome
    );
  }

  // Pega os nomes únicos de EMBALAGEM (Tamanho) das linhas filtradas
  const nomesDeTamanhosDisponiveis = new Set(
    linhasRelevantes.map((row) => row.EMBALAGEM)
  );

  // Filtra a lista estática de tamanhos (mockTamanhos)
  // para retornar apenas aqueles que existem nas fórmulas
  return mockTamanhos.filter((tamanho) =>
    nomesDeTamanhosDisponiveis.has(tamanho.nome)
  );
};