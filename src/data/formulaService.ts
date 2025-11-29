import { Cor, Base, Tamanho, Pigmento, PigmentoComNome } from "@/types/tinta";
import { mapaDeCores } from "@/data/colorMap";
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
        const corHex = mapaDeCores[row.COD_COR] || "#CCCCCC";
        coresMap.set(row.COD_COR, {
          id: corIdCounter++,
          nome: row.NOME_COR,
          codigo: row.COD_COR,
          codigoDisplay: row.COD_COR, // Usando o próprio código como display
          ativa: true,
          rgb: corHex,
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
  if (!isDataLoaded) throw new Error("Dados não carregados.");

  // 1. Filtra pela cor
  const formulaRows = loadedFormulas.filter(
    (row) => row.COD_COR === cor.codigo
  );

  // 2. Filtra combinando:
  // - Nome do Produto
  // - Nome da Embalagem (Tamanho)
  // - [NOVO] Código da Base (O código da base do Mock deve conter o código da base do CSV)
const matchingRows = formulaRows.filter(
    (row) =>
      row.PRODUTO === base.nome &&
      row.EMBALAGEM === tamanho.nome &&
      base.codigo === row.BASE // <--- CORREÇÃO: Comparação estrita de string
  );

  if (!matchingRows.length) {
    console.warn(`Fórmula não encontrada.`);
    return [];
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
  if (!cor) return mockBases;

  // 1. Filtra linhas do CSV pela cor
  let linhasRelevantes = loadedFormulas.filter(
    (row) => row.COD_COR === cor.codigo || row.COD_COR === cor.codigoDisplay
  );

  // 2. Se tiver tamanho selecionado, filtra também pela embalagem
  if (tamanho) {
    linhasRelevantes = linhasRelevantes.filter(
      (row) => row.EMBALAGEM === tamanho.nome
    );
  }

  // 3. Identifica combinações
  const combinacoesValidas = new Set(
    linhasRelevantes.map((row) => {
      const tamanhoMock = mockTamanhos.find(t => t.nome.toUpperCase() === row.EMBALAGEM.toUpperCase());
      
      // DIAGNÓSTICO: Verifique se encontrou o tamanho
      if (!tamanhoMock && tamanho) {
         console.warn(`AVISO: Tamanho não encontrado no mock para a embalagem CSV: "${row.EMBALAGEM}". Esperado: "${tamanho.nome}"`);
      }

      const volumeCodigo = tamanhoMock ? tamanhoMock.codigo : ""; 
      return `${row.PRODUTO}|${row.BASE}|${volumeCodigo}`;
    })
  );

  // 4. Filtra o mockBases
  const resultado = mockBases.filter((base) => {
    return combinacoesValidas.has(`${base.nome}|${base.codigo}|${base.volume}`);
  });

  // DIAGNÓSTICO FINAL
  if (tamanho && resultado.length === 0) {
      console.log("Nenhuma base encontrada para:", {
          cor: cor.nome,
          tamanho: tamanho.nome,
          combinacoesGeradasPeloCSV: Array.from(combinacoesValidas)
      });
  }

  return resultado;
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