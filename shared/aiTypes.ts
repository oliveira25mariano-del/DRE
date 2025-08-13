// Tipos TypeScript para o sistema de IA de categorização

export interface DespesaParaCategorizacao {
  id?: string;
  descricao: string;
  valor?: number;
  fornecedor?: string;
  data?: Date;
  categoria?: string; // categoria atual (se houver)
}

export interface ResultadoCategorizacaoIA {
  categoria: string;
  confianca: number; // 0-100
  justificativa: string;
  sugestaoMelhoria?: string;
  processadoEm: Date;
}

export interface AnaliseCategorizacao {
  totalProcessadas: number;
  categorizacoesAutomaticas: number;
  categorizacoesManuais: number;
  confiancaMedia: number;
  categoriasMaisUsadas: { categoria: string; quantidade: number }[];
  sugestoesGerais: string[];
}

export interface PadraoCategorizacao {
  palavrasChave: string[];
  categoria: string;
  confianca: number;
  exemplos: string[];
}

export interface ConfiguracaoIA {
  categorizacaoAutomaticaAtiva: boolean;
  confiancaMinima: number; // Mínimo para aceitar categorização automática
  aprenderComHistorico: boolean;
  notificarInconsistencias: boolean;
}

export const categoriasDisponiveis = [
  'Pessoal', 'Material', 'Serviços', 'Equipamentos', 'Infraestrutura',
  'Marketing', 'Viagens', 'Telecomunicações', 'Jurídico', 'Contabilidade',
  'Treinamento', 'Software', 'Manutenção', 'Seguros', 'Impostos',
  'Financeiro', 'Alimentação', 'Transporte', 'Utilidades', 'Outros'
] as const;

export type CategoriaValida = typeof categoriasDisponiveis[number];