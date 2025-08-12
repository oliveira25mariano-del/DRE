import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Palette,
  Layout,
  Moon,
  Sun,
  Monitor,
  Check,
  X,
  RotateCcw,
  Save
} from 'lucide-react';

interface ThemeConfig {
  colorScheme: 'azul-padrao' | 'verde-esmeralda' | 'roxo-real' | 'laranja-vibrante' | 'vermelho-energia' | 'indigo-profundo';
  layout: 'grid' | 'list' | 'compact';
  darkMode: boolean;
  animations: boolean;
  autoRefresh: boolean;
  compactMode: boolean;
}

const COLOR_SCHEMES = {
  'azul-padrao': {
    name: 'Azul Padrão',
    colors: ['#3B82F6', '#1E40AF', '#60A5FA'],
    css: {
      '--primary': '220 91% 50%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '220 91% 60%'
    }
  },
  'verde-esmeralda': {
    name: 'Verde Esmeralda',
    colors: ['#10B981', '#059669', '#34D399'],
    css: {
      '--primary': '160 84% 39%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '158 64% 52%'
    }
  },
  'roxo-real': {
    name: 'Roxo Real',
    colors: ['#8B5CF6', '#7C3AED', '#A78BFA'],
    css: {
      '--primary': '262 83% 58%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '262 69% 74%'
    }
  },
  'laranja-vibrante': {
    name: 'Laranja Vibrante',
    colors: ['#F97316', '#EA580C', '#FB923C'],
    css: {
      '--primary': '24 95% 53%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '27 87% 61%'
    }
  },
  'vermelho-energia': {
    name: 'Vermelho Energia',
    colors: ['#EF4444', '#DC2626', '#F87171'],
    css: {
      '--primary': '0 84% 60%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '0 85% 70%'
    }
  },
  'indigo-profundo': {
    name: 'Índigo Profundo',
    colors: ['#6366F1', '#4F46E5', '#818CF8'],
    css: {
      '--primary': '239 84% 67%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '238 69% 77%'
    }
  }
};

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ThemeConfig>({
    colorScheme: 'azul-padrao',
    layout: 'grid',
    darkMode: true,
    animations: true,
    autoRefresh: true,
    compactMode: false
  });
  
  const { toast } = useToast();

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem('theme-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        applyTheme(parsedConfig);
      } catch (e) {
        console.warn('Erro ao carregar configuração do tema:', e);
      }
    }
  }, []);

  const applyTheme = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;
    const scheme = COLOR_SCHEMES[themeConfig.colorScheme];
    
    // Aplicar cores CSS
    Object.entries(scheme.css).forEach(([property, value]) => {
      root.style.setProperty(property, `hsl(${value})`);
    });

    // Aplicar modo escuro
    if (themeConfig.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Aplicar animações
    if (!themeConfig.animations) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  };

  const handleConfigChange = (key: keyof ThemeConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    applyTheme(newConfig);
  };

  const handleSave = () => {
    localStorage.setItem('theme-config', JSON.stringify(config));
    toast({
      title: "Configurações Salvas",
      description: "Suas preferências de tema foram salvas com sucesso!",
    });
    onClose();
  };

  const handleReset = () => {
    const defaultConfig: ThemeConfig = {
      colorScheme: 'azul-padrao',
      layout: 'grid',
      darkMode: true,
      animations: true,
      autoRefresh: true,
      compactMode: false
    };
    setConfig(defaultConfig);
    applyTheme(defaultConfig);
    toast({
      title: "Configurações Restauradas",
      description: "As configurações padrão foram restauradas.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-effect border-blue-400/30 m-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-white">Personalização da Interface</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-blue-200 hover:text-white hover:bg-blue-600/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-blue-200 text-sm mb-6">
            Configure cores, layout e comportamento do dashboard
          </p>

          <Tabs defaultValue="cores" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-600/20">
              <TabsTrigger value="cores" className="text-blue-200">
                <Palette className="w-4 h-4 mr-2" />
                Cores
              </TabsTrigger>
              <TabsTrigger value="layout" className="text-blue-200">
                <Layout className="w-4 h-4 mr-2" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="opcoes" className="text-blue-200">
                <Settings className="w-4 h-4 mr-2" />
                Opções
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cores" className="space-y-4">
              <div>
                <Label className="text-white font-medium mb-3 block">Esquema de Cores</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        config.colorScheme === key
                          ? 'border-blue-400 bg-blue-600/20'
                          : 'border-blue-400/30 hover:border-blue-400/50 hover:bg-blue-600/10'
                      }`}
                      onClick={() => handleConfigChange('colorScheme', key as ThemeConfig['colorScheme'])}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{scheme.name}</span>
                        {config.colorScheme === key && (
                          <Check className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex gap-1">
                        {scheme.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border border-white/20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <div>
                <Label className="text-white font-medium mb-3 block">Tipo de Layout</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'grid', name: 'Grade', icon: '⊞' },
                    { key: 'list', name: 'Lista', icon: '≡' },
                    { key: 'compact', name: 'Compacto', icon: '▦' }
                  ].map((layout) => (
                    <div
                      key={layout.key}
                      className={`p-4 rounded-lg border cursor-pointer transition-all text-center ${
                        config.layout === layout.key
                          ? 'border-blue-400 bg-blue-600/20'
                          : 'border-blue-400/30 hover:border-blue-400/50 hover:bg-blue-600/10'
                      }`}
                      onClick={() => handleConfigChange('layout', layout.key)}
                    >
                      <div className="text-2xl mb-2">{layout.icon}</div>
                      <div className="text-white text-sm">{layout.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="opcoes" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-400" />
                    <Label className="text-white">Modo Escuro</Label>
                  </div>
                  <Switch
                    checked={config.darkMode}
                    onCheckedChange={(checked) => handleConfigChange('darkMode', checked)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-400" />
                    <Label className="text-white">Animações</Label>
                  </div>
                  <Switch
                    checked={config.animations}
                    onCheckedChange={(checked) => handleConfigChange('animations', checked)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                    <Label className="text-white">Atualização Automática</Label>
                  </div>
                  <Switch
                    checked={config.autoRefresh}
                    onCheckedChange={(checked) => handleConfigChange('autoRefresh', checked)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-blue-400" />
                    <Label className="text-white">Modo Compacto</Label>
                  </div>
                  <Switch
                    checked={config.compactMode}
                    onCheckedChange={(checked) => handleConfigChange('compactMode', checked)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botões de Ação */}
          <div className="flex justify-between mt-8 pt-4 border-t border-blue-400/30">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeCustomizer;