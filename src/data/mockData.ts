import { Pigmento, Base, Tamanho, TabelaPreco, Cor } from "@/types/tinta";

export const pigmentos: Pigmento[] = [
  { id: 1, nome: "Preto", codigo: "PIG001" },
  { id: 2, nome: "Branco", codigo: "PIG002" },
  { id: 3, nome: "Vermelho", codigo: "PIG003" },
  { id: 4, nome: "Amarelo", codigo: "PIG004" },
  { id: 5, nome: "Azul", codigo: "PIG005" },
  { id: 6, nome: "Verde", codigo: "PIG006" },
  { id: 7, nome: "Laranja", codigo: "PIG007" },
  { id: 8, nome: "Marrom", codigo: "PIG008" },
  { id: 9, nome: "Violeta", codigo: "PIG009" },
  { id: 10, nome: "Magenta", codigo: "PIG010" },
  { id: 11, nome: "Ciano", codigo: "PIG011" },
];

export const bases: Base[] = [
  { id: 1, nome: "Base A", codigo: "BA" },
  { id: 2, nome: "Base B", codigo: "BB" },
  { id: 3, nome: "Base C", codigo: "BC" },
];

export const tamanhos: Tamanho[] = [
  { id: 1, nome: "900ml", volume_ml: 900, codigo: "T900" },
  { id: 2, nome: "3.6L", volume_ml: 3600, codigo: "T3600" },
  { id: 3, nome: "18L", volume_ml: 18000, codigo: "T18L" },
  { id: 4, nome: "20L", volume_ml: 20000, codigo: "T20L" },
];

export const tabelasPreco: TabelaPreco[] = [
  { id: 1, nome: "Tabela Padrão" },
  { id: 2, nome: "Tabela Promocional" },
];

export const cores: Cor[] = [
  {
    id: 1,
    nome: "Branco Neve",
    codigo: "COR-0025",
    codigoDisplay: "0025",
    rgb: "#FFFFFF",
    pigmentos: [
      { pigmento_id: 2, quantidade_ml: 150 },
      { pigmento_id: 5, quantidade_ml: 5 },
    ],
  },
  {
    id: 2,
    nome: "Azul Celeste",
    codigo: "COR-0450",
    codigoDisplay: "0450",
    rgb: "#87CEEB",
    pigmentos: [
      { pigmento_id: 2, quantidade_ml: 100 },
      { pigmento_id: 5, quantidade_ml: 45 },
      { pigmento_id: 11, quantidade_ml: 10 },
    ],
  },
  {
    id: 3,
    nome: "Vermelho Cereja",
    codigo: "COR-0089",
    codigoDisplay: "0089",
    rgb: "#DC143C",
    pigmentos: [
      { pigmento_id: 3, quantidade_ml: 80 },
      { pigmento_id: 10, quantidade_ml: 15 },
      { pigmento_id: 2, quantidade_ml: 60 },
    ],
  },
  {
    id: 4,
    nome: "Amarelo Girassol",
    codigo: "COR-0128",
    codigoDisplay: "0128",
    rgb: "#FFEF00",
    pigmentos: [
      { pigmento_id: 4, quantidade_ml: 90 },
      { pigmento_id: 7, quantidade_ml: 10 },
      { pigmento_id: 2, quantidade_ml: 55 },
    ],
  },
  {
    id: 5,
    nome: "Verde Primavera",
    codigo: "COR-0312",
    codigoDisplay: "0312",
    rgb: "#00FF7F",
    pigmentos: [
      { pigmento_id: 6, quantidade_ml: 70 },
      { pigmento_id: 4, quantidade_ml: 25 },
      { pigmento_id: 2, quantidade_ml: 60 },
    ],
  },
  {
    id: 6,
    nome: "Cinza Pérola",
    codigo: "COR-0567",
    codigoDisplay: "0567",
    rgb: "#C0C0C0",
    pigmentos: [
      { pigmento_id: 2, quantidade_ml: 120 },
      { pigmento_id: 1, quantidade_ml: 15 },
      { pigmento_id: 5, quantidade_ml: 8 },
    ],
  },
  {
    id: 7,
    nome: "Laranja Sunset",
    codigo: "COR-0789",
    codigoDisplay: "0789",
    rgb: "#FF6347",
    pigmentos: [
      { pigmento_id: 7, quantidade_ml: 75 },
      { pigmento_id: 4, quantidade_ml: 30 },
      { pigmento_id: 3, quantidade_ml: 10 },
      { pigmento_id: 2, quantidade_ml: 40 },
    ],
  },
  {
    id: 8,
    nome: "Marrom Chocolate",
    codigo: "COR-0234",
    codigoDisplay: "0234",
    rgb: "#8B4513",
    pigmentos: [
      { pigmento_id: 8, quantidade_ml: 85 },
      { pigmento_id: 1, quantidade_ml: 20 },
      { pigmento_id: 3, quantidade_ml: 15 },
      { pigmento_id: 2, quantidade_ml: 35 },
    ],
  },
  {
    id: 9,
    nome: "Violeta Imperial",
    codigo: "COR-0901",
    codigoDisplay: "0901",
    rgb: "#8B00FF",
    pigmentos: [
      { pigmento_id: 9, quantidade_ml: 65 },
      { pigmento_id: 10, quantidade_ml: 25 },
      { pigmento_id: 5, quantidade_ml: 15 },
      { pigmento_id: 2, quantidade_ml: 50 },
    ],
  },
  {
    id: 10,
    nome: "Rosa Quartzo",
    codigo: "COR-0156",
    codigoDisplay: "0156",
    rgb: "#FFB6C1",
    pigmentos: [
      { pigmento_id: 2, quantidade_ml: 110 },
      { pigmento_id: 10, quantidade_ml: 30 },
      { pigmento_id: 3, quantidade_ml: 8 },
    ],
  },
];

// Função auxiliar para calcular preço (baseado em volume e tabela)
export const calcularPreco = (
  tamanho: Tamanho,
  tabelaPreco: TabelaPreco
): number => {
  const precoBasePorML = tabelaPreco.id === 1 ? 0.05 : 0.045; // Padrão vs Promocional
  return tamanho.volume_ml * precoBasePorML;
};
