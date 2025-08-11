import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Palette, Settings, Layout, Monitor, Moon, Sun, 
  Grid3X3, LayoutDashboard, LayoutGrid, Sparkles,
  Check, RotateCcw, Save
} from "lucide-react";

interface ThemeConfig {
  colorScheme: 'default' | 'emerald' | 'purple' | 'orange' | 'red' | 'indigo';
  layout: 'grid' | 'list' | 'compact' | 'detailed';
  darkMode: boolean;
  animations: boolean;
  chartStyle: 'modern' | 'classic' | 'minimal';
  compactCards: boolean;
  showTrends: boolean;
  autoRefresh: boolean;
}

const COLOR_SCHEMES = {
  default: {
    name: 'Azul Padrão',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA',
    background: '#0F172A'
  },
  emerald: {
    name: 'Verde Esmeralda',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    background: '#064E3B'
  },
  purple: {
    name: 'Roxo Real',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#A78BFA',
    background: '#312E81'
  },
  orange: {
    name: 'Laranja Vibrante',
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#FB923C',
    background: '#7C2D12'
  },
  red: {
    name: 'Vermelho Energia',
    primary: '#EF4444',
    secondary: '#DC2626',
    accent: '#F87171',
    background: '#7F1D1D'
  },
  indigo: {
    name: 'Índigo Profundo',
    primary: '#6366F1',
    secondary: '#4F46E5',
    accent: '#818CF8',
    background: '#312E81'
  }
};

const LAYOUT_OPTIONS = {
  grid: {
    name: 'Grade',
    description: 'Layout em grade com cartões organizados',
    icon: Grid3X3
  },
  list: {
    name: 'Lista',
    description: 'Layout em lista vertical',
    icon: LayoutDashboard
  },
  compact: {
    name: 'Compacto',
    description: 'Layout compacto para mais informações',
    icon: LayoutGrid
  },
  detailed: {
    name: 'Detalhado',
    description: 'Layout expandido com mais detalhes',
    icon: Monitor
  }
};

export default function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('theme-config');
    return saved ? JSON.parse(saved) : {
      colorScheme: 'default',
      layout: 'grid',
      darkMode: true,
      animations: true,
      chartStyle: 'modern',
      compactCards: false,
      showTrends: true,
      autoRefresh: true
    };
  });

  const [tempConfig, setTempConfig] = useState<ThemeConfig>(config);

  // Aplicar configurações ao documento
  useEffect(() => {
    const root = document.documentElement;
    const scheme = COLOR_SCHEMES[config.colorScheme];
    
    // Aplicar cores customizadas
    root.style.setProperty('--primary-color', scheme.primary);
    root.style.setProperty('--secondary-color', scheme.secondary);
    root.style.setProperty('--accent-color', scheme.accent);
    root.style.setProperty('--bg-color', scheme.background);
    
    // Aplicar classe de modo escuro
    if (config.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Salvar no localStorage
    localStorage.setItem('theme-config', JSON.stringify(config));

    // Aplicar classe de layout
    document.body.setAttribute('data-layout', config.layout);
    
    // Aplicar outras configurações
    document.body.setAttribute('data-animations', config.animations.toString());
    document.body.setAttribute('data-compact-cards', config.compactCards.toString());
  }, [config]);

  const handleSave = () => {
    setConfig(tempConfig);
    setIsOpen(false);
  };

  const handleReset = () => {
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
    setTempConfig(defaultConfig);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-blue-600/20 border-blue-400/30 text-blue-200 hover:bg-blue-600/30"
        >
          <Palette className="w-4 h-4 mr-2" />
          Personalizar
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96 bg-blue-bg border-blue-400/30 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Personalização da Interface
          </SheetTitle>
          <SheetDescription className="text-blue-300">
            Configure cores, layout e comportamento do dashboard
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-600/30">
              <TabsTrigger value="colors" className="data-[state=active]:bg-blue-600">
                <Palette className="w-4 h-4 mr-1" />
                Cores
              </TabsTrigger>
              <TabsTrigger value="layout" className="data-[state=active]:bg-blue-600">
                <Layout className="w-4 h-4 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="behavior" className="data-[state=active]:bg-blue-600">
                <Sparkles className="w-4 h-4 mr-1" />
                Opções
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium">Esquema de Cores</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all border-2 ${
                        tempConfig.colorScheme === key
                          ? 'border-white bg-blue-600/30'
                          : 'border-blue-600/30 bg-blue-800/20 hover:bg-blue-700/30'
                      }`}
                      onClick={() => setTempConfig({ ...tempConfig, colorScheme: key as any })}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white font-medium">
                            {scheme.name}
                          </span>
                          {tempConfig.colorScheme === key && (
                            <Check className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: scheme.primary }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: scheme.secondary }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: scheme.accent }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {tempConfig.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <Label className="text-white">Modo Escuro</Label>
                </div>
                <Switch
                  checked={tempConfig.darkMode}
                  onCheckedChange={(checked) => 
                    setTempConfig({ ...tempConfig, darkMode: checked })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium">Tipo de Layout</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(LAYOUT_OPTIONS).map(([key, layout]) => {
                    const IconComponent = layout.icon;
                    return (
                      <Card
                        key={key}
                        className={`cursor-pointer transition-all border ${
                          tempConfig.layout === key
                            ? 'border-white bg-blue-600/30'
                            : 'border-blue-600/30 bg-blue-800/20 hover:bg-blue-700/30'
                        }`}
                        onClick={() => setTempConfig({ ...tempConfig, layout: key as any })}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4 text-blue-300" />
                              <div>
                                <div className="text-sm text-white font-medium">
                                  {layout.name}
                                </div>
                                <div className="text-xs text-blue-300">
                                  {layout.description}
                                </div>
                              </div>
                            </div>
                            {tempConfig.layout === key && (
                              <Check className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Cartões Compactos</Label>
                  <Switch
                    checked={tempConfig.compactCards}
                    onCheckedChange={(checked) => 
                      setTempConfig({ ...tempConfig, compactCards: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Animações</Label>
                    <div className="text-xs text-blue-300">Transições e efeitos visuais</div>
                  </div>
                  <Switch
                    checked={tempConfig.animations}
                    onCheckedChange={(checked) => 
                      setTempConfig({ ...tempConfig, animations: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Mostrar Tendências</Label>
                    <div className="text-xs text-blue-300">Indicadores de crescimento/queda</div>
                  </div>
                  <Switch
                    checked={tempConfig.showTrends}
                    onCheckedChange={(checked) => 
                      setTempConfig({ ...tempConfig, showTrends: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Atualização Automática</Label>
                    <div className="text-xs text-blue-300">Refresh automático dos dados</div>
                  </div>
                  <Switch
                    checked={tempConfig.autoRefresh}
                    onCheckedChange={(checked) => 
                      setTempConfig({ ...tempConfig, autoRefresh: checked })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-white text-sm font-medium">Estilo dos Gráficos</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {['modern', 'classic', 'minimal'].map((style) => (
                    <Button
                      key={style}
                      variant={tempConfig.chartStyle === style ? "default" : "outline"}
                      size="sm"
                      className={`justify-start ${
                        tempConfig.chartStyle === style 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-800/20 border-blue-600/30 text-blue-200 hover:bg-blue-700/30'
                      }`}
                      onClick={() => setTempConfig({ ...tempConfig, chartStyle: style as any })}
                    >
                      {style === 'modern' && 'Moderno'}
                      {style === 'classic' && 'Clássico'}
                      {style === 'minimal' && 'Minimalista'}
                      {tempConfig.chartStyle === style && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4 border-t border-blue-600/30">
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-blue-600/30 text-blue-200 hover:bg-blue-700/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="text-blue-300 hover:bg-blue-700/30"
            >
              Cancelar
            </Button>
          </div>

          {/* Preview */}
          <Card className="bg-blue-800/20 border-blue-600/30">
            <CardHeader>
              <CardTitle className="text-white text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-300">Esquema:</span>
                  <Badge className="text-xs">
                    {COLOR_SCHEMES[tempConfig.colorScheme].name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-300">Layout:</span>
                  <Badge className="text-xs">
                    {LAYOUT_OPTIONS[tempConfig.layout].name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-300">Gráficos:</span>
                  <Badge className="text-xs">
                    {tempConfig.chartStyle === 'modern' && 'Moderno'}
                    {tempConfig.chartStyle === 'classic' && 'Clássico'}
                    {tempConfig.chartStyle === 'minimal' && 'Minimalista'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}