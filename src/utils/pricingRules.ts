import { tabelasPreco } from "@/data/mockData";

/**
 * Aplica a regra de preço psicológico (Trigger TRG_TGFEXC_99_FELIPE)
 * Regra: Arredondar para finais ,99 respeitando travas de margem.
 * * @param precoOriginal O preço calculado (unitário)
 * @param tabelaId O ID da tabela de preço selecionada
 * @returns O preço ajustado ou o original se a regra não se aplicar
 */
export const aplicarRegraPrecoPsicologico = (precoOriginal: number, tabelaId: number): number => {
  // 1. Filtros Iniciais
  // Preço deve ser >= 10
  if (!precoOriginal || precoOriginal < 10) return precoOriginal;

  // Apenas tabela Varejo (ID 2 no mockData)
  // Se quiser garantir pelo nome: 
  // const isVarejo = tabelasPreco.find(t => t.id === tabelaId)?.nome === "Varejo";
  if (tabelaId !== 2) return precoOriginal;

  const v_int = Math.trunc(precoOriginal);
  let v_target = 0;

  // 2. Cálculo do Alvo (v_target)
  if (v_int >= 100 && v_int <= 999) {
    // Faixa 100 - 999: Arredonda pra dezena inferior e tira 1 centavo
    // Ex: 161 -> 160 -> 159.99
    v_target = (Math.floor(v_int / 10) * 10) - 0.01;
  } else if (v_int >= 1000) {
    // Faixa >= 1000: Apenas múltiplos exatos de 1000
    if (v_int % 1000 !== 0) return precoOriginal;
    v_target = v_int - 0.01;
  } else {
    // Faixa < 100 (mas >= 10): Apenas múltiplos de 10 (20, 30, 90...)
    if (v_int % 10 !== 0) return precoOriginal;
    v_target = v_int - 0.01;
  }

  // 3. Travas de Segurança
  
  // Não pode aumentar o preço
  if (v_target >= precoOriginal) return precoOriginal;

  // Desconto não pode ser maior que 2% (0.02)
  const v_disc = (precoOriginal - v_target) / precoOriginal;
  if (v_disc > 0.02) return precoOriginal;

  // Retorna com 2 casas decimais
  return Number(v_target.toFixed(2));
};