import { useState, useEffect, useCallback } from 'react';

export interface ThemeConfig {
  colorScheme: 'default' | 'emerald' | 'purple' | 'orange' | 'red' | 'indigo';
  layout: 'grid' | 'list' | 'compact' | 'detailed';
  darkMode: boolean;
  animations: boolean;
  chartStyle: 'modern' | 'classic' | 'minimal';
  compactCards: boolean;
  showTrends: boolean;
  autoRefresh: boolean;
}

const defaultConfig: ThemeConfig = {
  colorScheme: 'default',
  layout: 'grid',
  darkMode: true,
  animations: true,
  chartStyle: 'modern',
  compactCards: false,
  showTrends: true,
  autoRefresh: true
};

export function useTheme() {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('theme-config');
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  // Salvar configuração no localStorage
  const saveConfig = useCallback((newConfig: ThemeConfig) => {
    setConfig(newConfig);
    localStorage.setItem('theme-config', JSON.stringify(newConfig));
  }, []);

  // Resetar para configurações padrão
  const resetConfig = useCallback(() => {
    saveConfig(defaultConfig);
  }, [saveConfig]);

  // Atualizar uma configuração específica
  const updateConfig = useCallback((updates: Partial<ThemeConfig>) => {
    const newConfig = { ...config, ...updates };
    saveConfig(newConfig);
  }, [config, saveConfig]);

  return {
    config,
    saveConfig,
    resetConfig,
    updateConfig,
    // Helpers para componentes
    isDarkMode: config.darkMode,
    isAnimationsEnabled: config.animations,
    shouldShowTrends: config.showTrends,
    shouldAutoRefresh: config.autoRefresh,
    isCompactLayout: config.compactCards
  };
}

// Hook específico para aplicar classes CSS baseadas na configuração
export function useThemeClasses() {
  const { config } = useTheme();

  const getLayoutClasses = useCallback(() => {
    switch (config.layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
      case 'list':
        return 'flex flex-col space-y-4';
      case 'compact':
        return 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4';
      case 'detailed':
        return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
    }
  }, [config.layout]);

  const getCardClasses = useCallback(() => {
    const baseClasses = 'glass-effect border-blue-200/20';
    const compactClasses = config.compactCards ? 'p-4' : 'p-6';
    const animationClasses = config.animations ? 'transition-all duration-300 hover:scale-105' : '';
    
    return `${baseClasses} ${compactClasses} ${animationClasses}`;
  }, [config.compactCards, config.animations]);

  const getChartTheme = useCallback(() => {
    switch (config.chartStyle) {
      case 'modern':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 12,
          gridOpacity: 0.3
        };
      case 'classic':
        return {
          backgroundColor: 'rgba(30, 64, 175, 0.2)',
          borderRadius: 8,
          gridOpacity: 0.5
        };
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          borderRadius: 0,
          gridOpacity: 0.1
        };
      default:
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 12,
          gridOpacity: 0.3
        };
    }
  }, [config.chartStyle]);

  return {
    getLayoutClasses,
    getCardClasses,
    getChartTheme,
    config
  };
}