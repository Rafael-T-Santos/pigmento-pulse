import { ResultadoConsulta } from "@/types/tinta";

const CACHE_KEY = "tintas_consultadas";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms

interface CacheItem {
  chave: string;
  dados: ResultadoConsulta;
  timestamp: number;
}

// Gerar chave única para consulta
export const gerarChaveConsulta = (
  cor_id: number,
  base_id: number,
  tamanho_id: number
): string => {
  return `${cor_id}_${base_id}_${tamanho_id}`;
};

// Salvar no cache
export const salvarNoCache = (resultado: ResultadoConsulta): void => {
  try {
    const cache = obterCache();
    const chave = gerarChaveConsulta(
      resultado.cor.id,
      resultado.base.id,
      resultado.tamanho.id
    );

    const novoItem: CacheItem = {
      chave,
      dados: resultado,
      timestamp: Date.now(),
    };

    cache[chave] = novoItem;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Erro ao salvar no cache:", error);
  }
};

// Buscar no cache
export const buscarNoCache = (
  cor_id: number,
  base_id: number,
  tamanho_id: number
): ResultadoConsulta | null => {
  try {
    const cache = obterCache();
    const chave = gerarChaveConsulta(cor_id, base_id, tamanho_id);
    const item = cache[chave];

    if (!item) return null;

    // Verificar se está expirado
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      delete cache[chave];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return item.dados;
  } catch (error) {
    console.error("Erro ao buscar no cache:", error);
    return null;
  }
};

// Obter todo o cache
const obterCache = (): Record<string, CacheItem> => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    return cacheStr ? JSON.parse(cacheStr) : {};
  } catch (error) {
    console.error("Erro ao ler cache:", error);
    return {};
  }
};

// Limpar cache expirado
export const limparCacheExpirado = (): void => {
  try {
    const cache = obterCache();
    const agora = Date.now();
    let modificado = false;

    Object.keys(cache).forEach((chave) => {
      if (agora - cache[chave].timestamp > CACHE_DURATION) {
        delete cache[chave];
        modificado = true;
      }
    });

    if (modificado) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error("Erro ao limpar cache:", error);
  }
};
