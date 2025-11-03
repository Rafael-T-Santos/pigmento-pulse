export interface Pigmento {
  id: number;
  nome: string;
  codigo: string;
}

export interface Base {
  id: number;
  nome: string;
  codigo: string;
}

export interface Tamanho {
  id: number;
  nome: string;
  volume_ml: number;
  codigo: string;
}

export interface TabelaPreco {
  id: number;
  nome: string;
}

export interface PigmentoFormula {
  pigmento_id: number;
  quantidade_ml: number;
}

export interface Cor {
  id: number;
  nome: string;
  codigo: string;
  codigoDisplay?: string;
  rgb?: string;
  ativa?: boolean;
  pigmentos: PigmentoFormula[];
}

export interface PigmentoComNome extends PigmentoFormula {
  nome: string;
  percentual: number;
}

export interface ResultadoConsulta {
  cor: Cor;
  base: Base;
  tamanho: Tamanho;
  tabelaPreco: TabelaPreco;
  pigmentos: PigmentoComNome[];
  precoVenda: number;
  cadastrada: boolean;
  codigoProduto?: string;
  nomeProduto?: string;
  quantidade: number;
}

export interface ConsultaForm {
  cor_id: number;
  base_id: number;
  tamanho_id: number;
  tabela_preco_id: number;
  quantidade: number;
}

export interface CadastroResponse {
  sucesso: boolean;
  codigo: string;
  nomeProduto: string;
}

export interface ConsultaHistorico {
  id: string;
  cor: string;
  corRgb?: string;
  base: string;
  tamanho: string;
  tabelaPreco: string;
  precoVenda: number;
  cadastrada: boolean;
  codigoProduto?: string;
  timestamp: number;
  dataFormatada: string;
  cor_id: number;
  base_id: number;
  tamanho_id: number;
  tabela_preco_id: number;
  quantidade: number;
}
