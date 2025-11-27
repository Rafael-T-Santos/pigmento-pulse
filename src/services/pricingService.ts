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

// Função auxiliar para chamar a API para um único item
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
      throw new Error(`Erro na API: ${response.statusText}`);
    }

    const data: PrecoResponse = await response.json();

    if (!data.sucesso) {
      console.warn(`A API retornou sucesso: false para o produto ${codProd}`);
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
  // 1. Criar array de promessas para os pigmentos
  // Filtramos pigmentos com quantidade > 0 para evitar chamadas desnecessárias
  const pigmentosPromises = pigmentos
    .filter((p) => p.quantidade_ml > 0)
    .map(async (pigmento) => {
      const precoUnitario = await fetchPrecoItem(pigmento.pigmento_id, codTabela, cobraST);
      // Preço do pigmento = Quantidade (ml) * Preço Unitário (por ml, presumivelmente)
      return precoUnitario * pigmento.quantidade_ml;
    });

  // 2. Chamar preço da Base
  const basePromise = fetchPrecoItem(base.id, codTabela, cobraST);

  // 3. Executar todas as consultas em paralelo para ser mais rápido
  const [custoBase, ...custosPigmentos] = await Promise.all([
    basePromise,
    ...pigmentosPromises,
  ]);

  // 4. Somar tudo
  const totalPigmentos = custosPigmentos.reduce((acc, curr) => acc + curr, 0);
  const precoFinal = custoBase + totalPigmentos;

  return precoFinal;
};