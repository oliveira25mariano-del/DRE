// Configurações avançadas para marca d'água dos hexágonos na sidebar
export interface WatermarkConfig {
  // Parâmetros básicos
  opacity: number; // 0.0 - 1.0
  size: string; // CSS background-size (ex: "90px 90px")
  position: string; // CSS background-position (ex: "20px 30px")
  
  // Filtros CSS
  brightness: number; // 0.0 - 3.0
  contrast: number; // 0.0 - 3.0
  saturate: number; // 0.0 - 3.0
  hueRotate: number; // -360 - 360 (graus)
  blur: number; // 0.0 - 10.0 (px)
  
  // Transformações
  rotation: number; // -360 - 360 (graus)
  scale: number; // 0.1 - 2.0
  
  // Modo de mistura
  blendMode: string; // CSS mix-blend-mode
  
  // Animação (opcional)
  animation?: {
    enabled: boolean;
    duration: string; // CSS animation-duration (ex: "10s")
    direction: string; // "normal" | "reverse" | "alternate" | "alternate-reverse"
  };
}

// Configuração atual
export const currentWatermarkConfig: WatermarkConfig = {
  opacity: 0.30,
  size: "90px 90px",
  position: "20px 30px",
  brightness: 1.8,
  contrast: 1.4,
  saturate: 1.2,
  hueRotate: 5,
  blur: 0.5,
  rotation: -5,
  scale: 1.05,
  blendMode: "soft-light",
  animation: {
    enabled: false,
    duration: "20s",
    direction: "alternate"
  }
};

// Presets predefinidos
export const watermarkPresets = {
  subtle: {
    opacity: 0.08,
    size: "120px 120px",
    position: "center",
    brightness: 1.0,
    contrast: 1.0,
    saturate: 1.0,
    hueRotate: 0,
    blur: 0,
    rotation: 0,
    scale: 1.0,
    blendMode: "normal"
  },
  
  balanced: {
    opacity: 0.20,
    size: "90px 90px",
    position: "10px 20px",
    brightness: 1.5,
    contrast: 1.2,
    saturate: 1.1,
    hueRotate: 3,
    blur: 0.3,
    rotation: -3,
    scale: 1.02,
    blendMode: "soft-light"
  },
  
  prominent: {
    opacity: 0.35,
    size: "70px 70px",
    position: "25px 35px",
    brightness: 2.0,
    contrast: 1.6,
    saturate: 1.4,
    hueRotate: 8,
    blur: 0.8,
    rotation: -8,
    scale: 1.08,
    blendMode: "multiply"
  },
  
  artistic: {
    opacity: 0.25,
    size: "85px 85px",
    position: "15px 25px",
    brightness: 1.7,
    contrast: 1.3,
    saturate: 1.5,
    hueRotate: 15,
    blur: 1.0,
    rotation: -10,
    scale: 1.1,
    blendMode: "overlay",
    animation: {
      enabled: true,
      duration: "30s",
      direction: "alternate"
    }
  }
};

// Função para gerar estilos CSS
export const generateWatermarkStyles = (config: WatermarkConfig, imageUrl: string) => {
  const filterString = [
    `brightness(${config.brightness})`,
    `contrast(${config.contrast})`,
    `saturate(${config.saturate})`,
    `hue-rotate(${config.hueRotate}deg)`,
    config.blur > 0 ? `blur(${config.blur}px)` : ''
  ].filter(Boolean).join(' ');
  
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundRepeat: 'repeat',
    backgroundSize: config.size,
    backgroundPosition: config.position,
    filter: filterString,
    transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
    mixBlendMode: config.blendMode as any,
    ...(config.animation?.enabled && {
      animation: `watermarkFloat ${config.animation.duration} ${config.animation.direction} infinite`
    })
  };
};

// CSS para animação (deve ser adicionado ao arquivo CSS global)
export const watermarkAnimationCSS = `
@keyframes watermarkFloat {
  0% { transform: rotate(-5deg) scale(1.05) translateY(0px); }
  50% { transform: rotate(-3deg) scale(1.07) translateY(-2px); }
  100% { transform: rotate(-5deg) scale(1.05) translateY(0px); }
}
`;