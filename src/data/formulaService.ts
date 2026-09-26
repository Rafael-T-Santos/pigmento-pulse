import { Cor, Colecao, Base, Tamanho, Pigmento, PigmentoComNome } from "@/types/tinta";
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

// Sufixo que vai no fim do nome da cor, por coleção. É o que o backend recebe em
// `cor.nome` e concatena na descrição do produto (TINTA <base> <tam> <cor> IQUINE),
// então mudar aqui muda o nome cadastrado no Sankhya.
const SUFIXOS_COLECAO: Record<Colecao, string> = {
  IQUINE: "",
  SUVINIL: " SUV",
};

const COLECOES_ACEITAS = Object.keys(SUFIXOS_COLECAO) as Colecao[];

const isColecaoConhecida = (valor: string): valor is Colecao =>
  (COLECOES_ACEITAS as string[]).includes(valor);

export const montarNomeExibicao = (nome: string, colecao: Colecao): string =>
  `${nome}${SUFIXOS_COLECAO[colecao]}`;

// Chave única de cor. COD_COR sozinho basta para o arquivo de hoje (Iquine é
// numérico, Suvinil é "A 350"), mas a chave composta é o que impede um código
// repetido num arquivo futuro de sobrescrever a cor da outra coleção em silêncio.
const chaveCor = (colecao: string, codCor: string): string => `${colecao}|${codCor}`;

// Assinaturas de base que o app sabe cotar, derivadas do mockBases (que carrega os
// CODPROD do Sankhya). Uma linha do CSV cujo PRODUTO|BASE|volume não esteja aqui não
// tem produto correspondente no ERP e portanto não pode ser consultada.
const assinaturasCotaveis = new Set(
  mockBases.map((base) => `${base.nome}|${base.codigo}|${base.volume}`)
);

const volumePorEmbalagem = new Map(
  mockTamanhos.map((tamanho) => [tamanho.nome.toUpperCase(), tamanho.codigo])
);

// Mesma regra aplicada por getBasesDisponiveis, isolada para as duas não divergirem.
const linhaTemBaseCotavel = (row: CsvRow): boolean => {
  const volume = volumePorEmbalagem.get(row.EMBALAGEM.toUpperCase());
  return !!volume && assinaturasCotaveis.has(`${row.PRODUTO}|${row.BASE}|${volume}`);
};

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

    // Aceita todas as coleções conhecidas. Linha sem código ou sem nome é descartada:
    // o arquivo historicamente traz entradas de teste com NOME_COR vazio.
    loadedFormulas = data.filter(
      (row) => row.COLECAO && isColecaoConhecida(row.COLECAO) && row.COD_COR && row.NOME_COR
    );

    // [NOVA LÓGICA] Processar e de-duplicar as cores
    const coresMap = new Map<string, Cor>();
    const coresComBaseCotavel = new Set<string>();
    let corIdCounter = 1;

    loadedFormulas.forEach((row) => {
      const colecao = row.COLECAO as Colecao;
      const chave = chaveCor(colecao, row.COD_COR);

      if (!coresMap.has(chave)) {
        coresMap.set(chave, {
          id: corIdCounter++,
          nome: row.NOME_COR,
          nomeExibicao: montarNomeExibicao(row.NOME_COR, colecao),
          colecao,
          codigo: row.COD_COR,
          codigoDisplay: row.COD_COR, // Usando o próprio código como display
          ativa: true,
          // Sem hex conhecido, rgb fica ausente de propósito: os componentes têm
          // fallback neutro para isso. Forçar um cinza aqui mentiria uma cor.
          rgb: mapaDeCores[row.COD_COR],
        });
      }

      if (linhaTemBaseCotavel(row)) {
        coresComBaseCotavel.add(chave);
      }
    });

    // Cor que não tem nenhuma base cotável viraria beco sem saída no seletor: o
    // usuário escolhe e o campo Base fica vazio, sem explicação. Fora da lista.
    cores = Array.from(coresMap.entries())
      .filter(([chave]) => coresComBaseCotavel.has(chave))
      .map(([, cor]) => cor);

    isDataLoaded = true;

    const descartadas = coresMap.size - cores.length;
    const porColecao = COLECOES_ACEITAS
      .map((c) => `${c}: ${cores.filter((cor) => cor.colecao === c).length}`)
      .join(", ");
    console.log(`Fórmulas carregadas: ${loadedFormulas.length} linhas.`);
    console.log(`Cores no seletor: ${cores.length} (${porColecao}).`);
    // Se este número crescer muito, o arquivo trouxe produto/base que o mockData
    // ainda não conhece — as cores correspondentes estão sendo escondidas.
    console.log(`Cores descartadas por não ter base cotável: ${descartadas}.`);

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

  // 1. Filtra pela cor (coleção + código: o código só é único dentro da coleção)
  const formulaRows = loadedFormulas.filter(
    (row) => row.COLECAO === cor.colecao && row.COD_COR === cor.codigo
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
    (row) =>
      row.COLECAO === cor.colecao &&
      (row.COD_COR === cor.codigo || row.COD_COR === cor.codigoDisplay)
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
      // Mesma tradução embalagem -> volume usada por linhaTemBaseCotavel na carga.
      const volumeCodigo = volumePorEmbalagem.get(row.EMBALAGEM.toUpperCase());

      // DIAGNÓSTICO: Verifique se encontrou o tamanho
      if (!volumeCodigo && tamanho) {
         console.warn(`AVISO: Tamanho não encontrado no mock para a embalagem CSV: "${row.EMBALAGEM}". Esperado: "${tamanho.nome}"`);
      }

      return `${row.PRODUTO}|${row.BASE}|${volumeCodigo ?? ""}`;
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
    (row) =>
      row.COLECAO === cor.colecao &&
      (row.COD_COR === cor.codigo || row.COD_COR === cor.codigoDisplay)
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