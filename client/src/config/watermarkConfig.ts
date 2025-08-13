// Configurações Avançadas da Marca D'água - Hexágonos na Barra Lateral
export interface ConfiguracaoMarcaDagua {
  // === PARÂMETROS BÁSICOS ===
  opacidade: number; // 0.0 - 1.0 (Transparência geral - 0=invisível, 1=opaco)
  tamanho: string; // Tamanho do padrão (ex: "90px 90px", "100px 100px")
  posicao: string; // Posição inicial (ex: "20px 30px", "center")
  
  // === FILTROS VISUAIS AVANÇADOS ===
  brilho: number; // 0.0 - 3.0 (Luminosidade - 1.0=normal, >1=mais claro)
  contraste: number; // 0.0 - 3.0 (Definição - 1.0=normal, >1=mais definido)
  saturacao: number; // 0.0 - 3.0 (Intensidade das cores - 1.0=normal)
  rotacaoMatiz: number; // -360 a 360 graus (Mudança de cor)
  desfoque: number; // 0.0 - 10.0 pixels (Blur/borramento)
  
  // === TRANSFORMAÇÕES 2D ===
  rotacao: number; // -360 a 360 graus (Inclinação geral)
  escala: number; // 0.1 - 2.0 (Tamanho - 1.0=normal, >1=maior)
  
  // === EFEITOS DE MISTURA ===
  modoMistura: string; // Como combina com o fundo
  
  // === SISTEMA DE ANIMAÇÃO (OPCIONAL) ===
  animacao?: {
    ativa: boolean; // Ligar/desligar movimento
    duracao: string; // Velocidade (ex: "10s"=lento, "5s"=rápido)
    direcao: string; // Tipo de movimento
  };
}

// === CONFIGURAÇÃO ATUAL (EDITÁVEL) ===
export const configuracaoAtual: ConfiguracaoMarcaDagua = {
  opacidade: 0.30, // 30% de transparência
  tamanho: "90px 90px", // Hexágonos de 90x90 pixels
  posicao: "20px 30px", // Deslocado da origem
  brilho: 1.8, // 80% mais brilhante
  contraste: 1.4, // 40% mais contrastado
  saturacao: 1.2, // 20% mais saturado
  rotacaoMatiz: 5, // 5 graus de mudança de cor
  desfoque: 0.5, // Leve borramento
  rotacao: -5, // Inclinado -5 graus
  escala: 1.05, // 5% maior
  modoMistura: "soft-light", // Mistura suave com fundo
  animacao: {
    ativa: false, // Sem movimento
    duracao: "20s", // 20 segundos por ciclo
    direcao: "alternate" // Vai e volta
  }
};

// === PRESETS PRÉ-CONFIGURADOS ===
export const presetsDisponiveis = {
  // 🌫️ SUTIL - Quase imperceptível, muito discreto
  sutil: {
    opacidade: 0.08, // Quase transparente
    tamanho: "120px 120px", // Hexágonos grandes
    posicao: "center", // Centralizado
    brilho: 1.0, // Normal
    contraste: 1.0, // Normal
    saturacao: 1.0, // Normal
    rotacaoMatiz: 0, // Sem mudança de cor
    desfoque: 0, // Sem borramento
    rotacao: 0, // Sem inclinação
    escala: 1.0, // Tamanho normal
    modoMistura: "normal" // Mistura básica
  },
  
  // ⚖️ EQUILIBRADO - Visível mas não intrusivo
  equilibrado: {
    opacidade: 0.20, // 20% visível
    tamanho: "90px 90px", // Tamanho médio
    posicao: "10px 20px", // Ligeiramente deslocado
    brilho: 1.5, // Um pouco mais brilhante
    contraste: 1.2, // Levemente contrastado
    saturacao: 1.1, // Cores sutilmente intensas
    rotacaoMatiz: 3, // Leve mudança de cor
    desfoque: 0.3, // Borramento mínimo
    rotacao: -3, // Leve inclinação
    escala: 1.02, // Ligeiramente maior
    modoMistura: "soft-light" // Mistura suave
  },
  
  // 🎯 PROEMINENTE - Bem visível, forte presença
  proeminente: {
    opacidade: 0.35, // 35% visível
    tamanho: "70px 70px", // Hexágonos menores e mais densos
    posicao: "25px 35px", // Bem deslocado
    brilho: 2.0, // Muito brilhante
    contraste: 1.6, // Alto contraste
    saturacao: 1.4, // Cores intensas
    rotacaoMatiz: 8, // Mudança notável de cor
    desfoque: 0.8, // Borramento perceptível
    rotacao: -8, // Inclinação acentuada
    escala: 1.08, // Notavelmente maior
    modoMistura: "multiply" // Mistura multiplicativa
  },
  
  // 🎨 ARTÍSTICO - Com movimento e efeitos intensos
  artistico: {
    opacidade: 0.25, // 25% visível
    tamanho: "85px 85px", // Tamanho médio-grande
    posicao: "15px 25px", // Posição personalizada
    brilho: 1.7, // Bem brilhante
    contraste: 1.3, // Bom contraste
    saturacao: 1.5, // Cores bem saturadas
    rotacaoMatiz: 15, // Mudança significativa de cor
    desfoque: 1.0, // Borramento artístico
    rotacao: -10, // Inclinação artística
    escala: 1.1, // Maior que o normal
    modoMistura: "overlay", // Mistura sobreposta
    animacao: {
      ativa: true, // COM MOVIMENTO!
      duracao: "30s", // Animação lenta (30 segundos)
      direcao: "alternate" // Movimento de ida e volta
    }
  }
};

// === FUNÇÃO PARA APLICAR CONFIGURAÇÕES ===
export const gerarEstilosMarcaDagua = (config: ConfiguracaoMarcaDagua, urlImagem: string) => {
  // Combina todos os filtros visuais
  const filtrosCSS = [
    `brightness(${config.brilho})`, // Brilho
    `contrast(${config.contraste})`, // Contraste
    `saturate(${config.saturacao})`, // Saturação
    `hue-rotate(${config.rotacaoMatiz}deg)`, // Rotação de matiz
    config.desfoque > 0 ? `blur(${config.desfoque}px)` : '' // Desfoque (só se > 0)
  ].filter(Boolean).join(' ');
  
  return {
    backgroundImage: `url(${urlImagem})`, // Imagem dos hexágonos
    backgroundRepeat: 'repeat', // Repetir padrão
    backgroundSize: config.tamanho, // Tamanho de cada hexágono
    backgroundPosition: config.posicao, // Posição inicial
    filter: filtrosCSS, // Aplicar filtros
    transform: `rotate(${config.rotacao}deg) scale(${config.escala})`, // Rotação e escala
    mixBlendMode: config.modoMistura as any, // Modo de mistura
    // Animação (só se ativada)
    ...(config.animacao?.ativa && {
      animation: `flutuacaoHexagonos ${config.animacao.duracao} ${config.animacao.direcao} infinite`
    })
  };
};

// === CSS PARA ANIMAÇÃO ===
// (Adicionar ao arquivo CSS global se usar animação)
export const cssAnimacaoHexagonos = `
@keyframes flutuacaoHexagonos {
  0% { 
    transform: rotate(-5deg) scale(1.05) translateY(0px);
    opacity: 0.3;
  }
  50% { 
    transform: rotate(-3deg) scale(1.07) translateY(-2px);
    opacity: 0.25;
  }
  100% { 
    transform: rotate(-5deg) scale(1.05) translateY(0px);
    opacity: 0.3;
  }
}
`;

// === INSTRUÇÕES DE USO ===
/*
🔧 COMO PERSONALIZAR A MARCA D'ÁGUA:

1. MUDANÇA RÁPIDA - Use um preset:
   - Para sutil: substitua 'configuracaoAtual' por 'presetsDisponiveis.sutil'
   - Para equilibrado: use 'presetsDisponiveis.equilibrado'
   - Para proeminente: use 'presetsDisponiveis.proeminente' 
   - Para artístico: use 'presetsDisponiveis.artistico'

2. PERSONALIZAÇÃO FINA - Edite 'configuracaoAtual':
   - opacidade: 0.1=quase invisível, 0.5=bem visível
   - tamanho: "60px 60px"=pequeno denso, "120px 120px"=grande espaçado
   - brilho: 0.5=escuro, 2.0=muito claro
   - rotacao: número positivo=horário, negativo=anti-horário

3. ATIVAR ANIMAÇÃO:
   - Configure animacao.ativa = true
   - Adicione o CSS da animação ao arquivo global
   - Ajuste duracao ("10s"=rápido, "60s"=muito lento)

4. MODOS DE MISTURA RECOMENDADOS:
   - "normal": padrão, sem efeitos especiais
   - "soft-light": suave, recomendado
   - "multiply": escurece, para fundos claros
   - "overlay": intenso, para efeitos dramáticos
*/