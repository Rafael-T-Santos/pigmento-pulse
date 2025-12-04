import { Pigmento, Base, Tamanho, TabelaPreco, Tributacao } from "@/types/tinta";

export const pigmentos: Pigmento[] = [
  { id: 11592, nome: "Branco", codigo: "P-0451" },
  { id: 11593, nome: "Laranja", codigo: "P-0501" },
  { id: 11594, nome: "Vermelho", codigo: "P-0491" },
  { id: 11595, nome: "Azul", codigo: "P-0431" },
  { id: 11596, nome: "Vermelho Óxido", codigo: "P-0511" },
  { id: 11597, nome: "Preto", codigo: "P-0461" },
  { id: 11598, nome: "Amarelo Óxido", codigo: "P-0421" },
  { id: 11599, nome: "Azul Intenso", codigo: "P-0441" },
  { id: 11600, nome: "Amarelo", codigo: "P-0411" },
  { id: 11601, nome: "Rosa", codigo: "P-0471" },
  { id: 11602, nome: "Verde", codigo: "P-0481" },
];

export const bases: Base[] = [
  // Bases de GALÃO (Mantém "GL")
  { id: 11585, nome: "Decoratto Mármore", codigo: "P/M", volume: "GL" },
  { id: 11583, nome: "Decoratto Multiefeitos Estrelado", codigo: "P/M", volume: "GL" },
  { id: 11591, nome: "Diatex Pinta Mais", codigo: "M", volume: "GL" },
  { id: 11590, nome: "Diatex Pinta Mais", codigo: "P", volume: "GL" },
  { id: 11563, nome: "Limpa Fácil", codigo: "C", volume: "GL" },
  { id: 11561, nome: "Limpa Fácil", codigo: "M", volume: "GL" },
  { id: 11559, nome: "Limpa Fácil", codigo: "P", volume: "GL" },
  { id: 11569, nome: "Seda Super Lavavel", codigo: "C", volume: "GL" },
  { id: 11567, nome: "Seda Super Lavavel", codigo: "M", volume: "GL" },
  { id: 11566, nome: "Seda Super Lavavel", codigo: "P", volume: "GL" },
  { id: 11556, nome: "Sela e Pinta", codigo: "C", volume: "GL" },
  { id: 11554, nome: "Sela e Pinta", codigo: "M", volume: "GL" },
  { id: 11552, nome: "Sela e Pinta", codigo: "P", volume: "GL" },
  { id: 11575, nome: "Super Premium", codigo: "C", volume: "GL" },
  { id: 11573, nome: "Super Premium", codigo: "M", volume: "GL" },
  { id: 11571, nome: "Super Premium", codigo: "P", volume: "GL" },

  // Bases de LATA (Alteradas para "BD")
  { id: 11586, nome: "Decoratto Mármore", codigo: "P/M", volume: "BD" },
  { id: 11584, nome: "Decoratto Multiefeitos Estrelado", codigo: "P/M", volume: "BD" },
  { id: 11588, nome: "Diatex Pinta Mais", codigo: "M", volume: "BD" },
  { id: 11589, nome: "Diatex Pinta Mais", codigo: "P", volume: "BD" },
  { id: 11564, nome: "Limpa Fácil", codigo: "C", volume: "BD" },
  { id: 11562, nome: "Limpa Fácil", codigo: "M", volume: "BD" },
  { id: 11560, nome: "Limpa Fácil", codigo: "P", volume: "BD" },
  { id: 11570, nome: "Seda Super Lavavel", codigo: "C", volume: "BD" },
  { id: 11568, nome: "Seda Super Lavavel", codigo: "M", volume: "BD" },
  { id: 11565, nome: "Seda Super Lavavel", codigo: "P", volume: "BD" },
  { id: 11557, nome: "Sela e Pinta", codigo: "C", volume: "BD" },
  { id: 11555, nome: "Sela e Pinta", codigo: "M", volume: "BD" },
  { id: 11553, nome: "Sela e Pinta", codigo: "P", volume: "BD" },
  { id: 11576, nome: "Super Premium", codigo: "C", volume: "BD" },
  { id: 11574, nome: "Super Premium", codigo: "M", volume: "BD" },
  { id: 11572, nome: "Super Premium", codigo: "P", volume: "BD" },
];

export const tamanhos: Tamanho[] = [
  { id: 1, nome: "GALÃO", volume_ml: 3200, codigo: "GL" },
  // Código alterado para BD conforme Sankhya
  { id: 2, nome: "LATA", volume_ml: 16000, codigo: "BD" } 
];

export const tabelasPreco: TabelaPreco[] = [
  { id: 1, nome: "Atacado" },
  { id: 2, nome: "Varejo" },
];

export const tributacoes: Tributacao[] = [
  { id: 1, nome: "Contribuinte" },
  { id: 2, nome: "Não contribuinte" },
];