// src/services/pricingService.ts
import { Base, PigmentoComNome } from "@/types/tinta";

interface PrecoResponse {
  codProd: number;
  codTabela: number;
  preco: number;
  sucesso: boolean;
}

interface ConsultarPrecoParams {
  base: Base;
  pigmentos: PigmentoComNome[];
  codTabela: number;
  cobraST: "S" | "N";
}

// Função para consultar um único item (Base ou Pigmento)
const fetchPrecoItem = async (
  codProd: number,
  codTabela: number,
  cobraST: "S" | "N"
): Promise<number> => {
  try {
    const response = await fetch("/api/consultar-preco", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codProd,
        codTabela,
        cobraST,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API de preço: ${response.statusText}`);
    }

    const data: PrecoResponse = await response.json();

    if (!data.sucesso) {
      console.warn(`API retornou sucesso: false para o produto ${codProd}. Assumindo preço 0.`);
      return 0;
    }

    return data.preco;
  } catch (error) {
    console.error(`Erro ao consultar preço do produto ${codProd}:`, error);
    throw error;
  }
};

export const calcularPrecoTotalViaApi = async ({
  base,
  pigmentos,
  codTabela,
  cobraST,
}: ConsultarPrecoParams): Promise<number> => {
  // 1. Consultar preço da Base
  // Nota: Assumimos que o preço retornado para a base já é unitário para o tamanho escolhido (Galão/Lata)
  // baseada no ID único da base (ex: 11586 é Lata, 11585 é Galão).
  const basePromise = fetchPrecoItem(base.id, codTabela, cobraST);

  // 2. Consultar preço de cada Pigmento (somente se quantidade > 0)
  const pigmentosPromises = pigmentos
    .filter((p) => p.quantidade_ml > 0)
    .map(async (pigmento) => {
      const precoUnitario = await fetchPrecoItem(pigmento.pigmento_id, codTabela, cobraST);
      // O preço da API é por unidade (provavelmente ML ou Litro, ajuste conforme sua regra de negócio).
      // Se o preço for por ML, a conta é direta:
      return precoUnitario * pigmento.quantidade_ml;
    });

  // 3. Executar todas as requisições em paralelo para performance
  const [custoBase, ...custosPigmentos] = await Promise.all([
    basePromise,
    ...pigmentosPromises,
  ]);

  // 4. Somar Base + Total dos Pigmentos
  const totalPigmentos = custosPigmentos.reduce((acc, curr) => acc + curr, 0);
  const precoFinal = custoBase + totalPigmentos;

  return precoFinal;
};