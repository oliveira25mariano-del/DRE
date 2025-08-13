import Anthropic from '@anthropic-ai/sdk';

// Configuração do Claude para categorização de despesas
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Categorias padrão do sistema DRE
export const categoriasDisponiveis = [
  'Pessoal', 'Material', 'Serviços', 'Equipamentos', 'Infraestrutura',
  'Marketing', 'Viagens', 'Telecomunicações', 'Jurídico', 'Contabilidade',
  'Treinamento', 'Software', 'Manutenção', 'Seguros', 'Impostos',
  'Financeiro', 'Alimentação', 'Transporte', 'Utilidades', 'Outros'
];

// Interface para resultado da categorização
export interface ResultadoCategorizacao {
  categoria: string;
  confianca: number; // 0-100
  justificativa: string;
  sugestaoMelhoria?: string;
}

// Sistema de IA para categorização automática
export class CategorizadorIA {
  
  // Categoriza uma despesa com base na descrição
  async categorizarDespesa(
    descricao: string,
    valor?: number,
    fornecedor?: string,
    historico?: any[]
  ): Promise<ResultadoCategorizacao> {
    
    const prompt = this.construirPromptCategorizacao(descricao, valor, fornecedor, historico);
    
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Você é um especialista em categorização de despesas empresariais brasileiras.
        
        REGRAS:
        1. Sempre responda em português brasileiro
        2. Use APENAS as categorias fornecidas na lista
        3. Considere o contexto empresarial brasileiro
        4. Seja preciso na justificativa
        5. Confiança: 90-100=muito certa, 70-89=provável, 50-69=incerta, <50=duvidosa
        
        FORMATO DE RESPOSTA (JSON):
        {
          "categoria": "uma das categorias válidas",
          "confianca": número de 0 a 100,
          "justificativa": "explicação clara e concisa",
          "sugestaoMelhoria": "opcional - como melhorar a descrição"
        }`,
        messages: [{ role: 'user', content: prompt }],
      });
      
      const resultado = JSON.parse((response.content[0] as any).text);
      
      // Validação da categoria retornada
      if (!categoriasDisponiveis.includes(resultado.categoria)) {
        resultado.categoria = 'Outros';
        resultado.confianca = Math.min(resultado.confianca, 40);
        resultado.justificativa += ' (Categoria ajustada automaticamente)';
      }
      
      return resultado;
      
    } catch (error) {
      console.error('Erro na categorização IA:', error);
      return {
        categoria: 'Outros',
        confianca: 0,
        justificativa: 'Erro na análise automática - categorização manual necessária'
      };
    }
  }
  
  // Categoriza múltiplas despesas em lote
  async categorizarLote(despesas: any[]): Promise<Map<string, ResultadoCategorizacao>> {
    const resultados = new Map<string, ResultadoCategorizacao>();
    
    // Processa em grupos de 5 para não sobrecarregar a API
    for (let i = 0; i < despesas.length; i += 5) {
      const lote = despesas.slice(i, i + 5);
      
      const promessas = lote.map(async (despesa, index) => {
        const resultado = await this.categorizarDespesa(
          despesa.descricao,
          despesa.valor,
          despesa.fornecedor,
          despesa.historico
        );
        return { id: despesa.id || `${i + index}`, resultado };
      });
      
      const resultadosLote = await Promise.all(promessas);
      resultadosLote.forEach(({ id, resultado }) => {
        resultados.set(id, resultado);
      });
      
      // Pausa pequena entre lotes
      if (i + 5 < despesas.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return resultados;
  }
  
  // Analisa padrões de categorização para aprendizado
  async analisarPadroes(historico: any[]): Promise<any> {
    if (historico.length < 10) {
      return { erro: 'Histórico insuficiente para análise de padrões' };
    }
    
    const prompt = `
    ANÁLISE DE PADRÕES DE CATEGORIZAÇÃO:
    
    Analise o histórico de ${historico.length} categorizações e identifique:
    1. Padrões consistentes de categorização
    2. Possíveis inconsistências
    3. Sugestões para melhorar descrições
    4. Fornecedores que precisam de categoria fixa
    
    Histórico (últimas 20 entradas):
    ${historico.slice(-20).map((h, i) => 
      `${i+1}. "${h.descricao}" → ${h.categoria} (${h.fornecedor || 'N/A'})`
    ).join('\n')}
    
    Responda em formato JSON estruturado.
    `;
    
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: `Você é um analista de padrões financeiros. 
        Forneça insights acionáveis em português brasileiro.`,
        messages: [{ role: 'user', content: prompt }],
      });
      
      return JSON.parse((response.content[0] as any).text);
    } catch (error) {
      console.error('Erro na análise de padrões:', error);
      return { erro: 'Falha na análise de padrões' };
    }
  }
  
  // Constrói o prompt para categorização
  private construirPromptCategorizacao(
    descricao: string,
    valor?: number,
    fornecedor?: string,
    historico?: any[]
  ): string {
    let prompt = `CATEGORIZE ESTA DESPESA EMPRESARIAL:

Descrição: "${descricao}"`;
    
    if (valor) {
      prompt += `\nValor: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    
    if (fornecedor) {
      prompt += `\nFornecedor: "${fornecedor}"`;
    }
    
    prompt += `\n\nCATEGORIAS DISPONÍVEIS:
${categoriasDisponiveis.join(', ')}`;
    
    if (historico && historico.length > 0) {
      prompt += `\n\nHISTÓRICO SIMILAR (para contexto):`;
      historico.slice(-5).forEach((h, i) => {
        prompt += `\n${i+1}. "${h.descricao}" → ${h.categoria}`;
      });
    }
    
    prompt += `\n\nANALISE E CATEGORIZE considerando:
- Natureza da despesa no contexto empresarial brasileiro
- Padrões do histórico (se disponível)
- Especificidade da descrição
- Fornecedor (se conhecido)

Retorne APENAS o JSON no formato especificado.`;
    
    return prompt;
  }
}

// Instância singleton do categorizador
export const categorizadorIA = new CategorizadorIA();