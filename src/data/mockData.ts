import { Pigmento, Base, Tamanho, TabelaPreco, Tributacao } from "@/types/tinta";

export const pigmentos: Pigmento[] = [
  { id: 1, nome: "Preto", codigo: "P-0411" },
  { id: 2, nome: "Branco", codigo: "P-0421" },
  { id: 3, nome: "Vermelho", codigo: "P-0431" },
  { id: 4, nome: "Amarelo", codigo: "P-0441" },
  { id: 5, nome: "Azul", codigo: "P-0451" },
  { id: 6, nome: "Verde", codigo: "P-0461" },
  { id: 7, nome: "Laranja", codigo: "P-0471" },
  { id: 8, nome: "Marrom", codigo: "P-0481" },
  { id: 9, nome: "Violeta", codigo: "P-0491" },
  { id: 10, nome: "Magenta", codigo: "P-0501" },
  { id: 11, nome: "Ciano", codigo: "P-0511" },
];

export const bases: Base[] = [
  { id: 1, nome: "2 em 1 Fosco", codigo: "2F" },
  { id: 2, nome: "Acaba com o Mofo", codigo: "AM" },
  { id: 3, nome: "Brilho da Seda", codigo: "BS" },
  { id: 4, nome: "Decoratto Cimento Queimado", codigo: "DCQ" },
  { id: 5, nome: "Decoratto Classico", codigo: "DC" },
  { id: 6, nome: "Decoratto Mármore", codigo: "DM" },
  { id: 7, nome: "Decoratto Multiefeitos Estrelado", codigo: "DME" },
  { id: 8, nome: "Decoratto Multiefeitos Naturalle", codigo: "DMN" },
  { id: 9, nome: "Decoratto Rustico", codigo: "DR" },
  { id: 10, nome: "Delanil Rende Muito", codigo: "DRM" },
  { id: 11, nome: "Dialine Topa Tudo A B", codigo: "DTAB" },
  { id: 12, nome: "Dialine Topa Tudo A C", codigo: "DTAC" },
  { id: 13, nome: "Diapiso Super Resistente", codigo: "DSR" },
  { id: 14, nome: "Diatex Pinta Mais", codigo: "DPM" },
  { id: 15, nome: "Diepóxi Base Água A B", codigo: "DBAB" },
  { id: 16, nome: "Fachada Emborrachada", codigo: "FE" },
  { id: 17, nome: "Fosco Durável", codigo: "FD" },
  { id: 18, nome: "Limpa Fácil", codigo: "LF" },
  { id: 19, nome: "Pro-Saude Higiene e Limpeza", codigo: "PSHL" },
  { id: 20, nome: "Proteção Antibactéria", codigo: "PA" },
  { id: 21, nome: "Seda Super Lavavel", codigo: "SSLV" },
  { id: 22, nome: "Sela e Pinta", codigo: "SP" },
  { id: 23, nome: "Sela e Pinta Gesso", codigo: "SPG" },
  { id: 24, nome: "Semibrilho Super Lavavel", codigo: "SBSL" },
  { id: 25, nome: "Super Premium", codigo: "SPR" },
  { id: 26, nome: "Uma Demão", codigo: "UD" },
];

export const tamanhos: Tamanho[] = [
  { id: 1, nome: "GALÃO", volume_ml: 3200, codigo: "T3200" },
  { id: 2, nome: "LATA", volume_ml: 16000, codigo: "T16000" },
  { id: 3, nome: "0,8 LTS", volume_ml: 800, codigo: "T800" },
  { id: 4, nome: "LATA DE 25 KG", volume_ml: 14815, codigo: "T14815" },
  { id: 5, nome: "LATA DE 27 KG", volume_ml: 16000, codigo: "T16000" },
  { id: 6, nome: "GALÃO DE 5 KG", volume_ml: 2963, codigo: "T2963" },
  { id: 7, nome: "GALÃO DE 5,4 KG", volume_ml: 3200, codigo: "T3200" },
];

export const tabelasPreco: TabelaPreco[] = [
  { id: 1, nome: "Atacado" },
  { id: 2, nome: "Varejo" },
];

export const tributacoes: Tributacao[] = [
  { id: 1, nome: "Contribuinte" },
  { id: 2, nome: "Não contribuinte" },
];

// Função auxiliar para calcular preço (baseado em volume e tabela)
export const calcularPreco = (
  tamanho: Tamanho,
  tabelaPreco: TabelaPreco
): number => {
  const precoBasePorML = tabelaPreco.id === 1 ? 0.05 : 0.045; // Padrão vs Promocional
  return tamanho.volume_ml * precoBasePorML;
};
