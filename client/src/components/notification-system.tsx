import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, Settings, User, Shield, AlertTriangle, CheckCircle, 
  Info, TrendingUp, TrendingDown, DollarSign, Target, 
  Mail, MessageSquare, Smartphone, Monitor, Save, Trash2,
  Plus, Edit, Eye, Volume2, VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface NotificationPreference {
  id?: string;
  userId: string;
  type: 'financial' | 'system' | 'contract' | 'budget' | 'alert';
  category: string;
  enabled: boolean;
  channels: ('email' | 'push' | 'sms' | 'dashboard')[];
  threshold?: number;
  conditions: Record<string, any>;
  customMessage?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: Date;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'system' | 'contract' | 'budget' | 'alert';
  category: string;
  defaultChannels: ('email' | 'push' | 'sms' | 'dashboard')[];
  userRole: 'admin' | 'user' | 'both';
  icon: typeof Bell;
  color: string;
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Notificações Financeiras
  {
    id: 'revenue-high',
    name: 'Receita Acima da Meta',
    description: 'Alertar quando a receita ultrapassar o limite configurado',
    type: 'financial',
    category: 'receita',
    defaultChannels: ['dashboard', 'email'],
    userRole: 'both',
    icon: TrendingUp,
    color: 'text-green-500'
  },
  {
    id: 'cost-exceeded',
    name: 'Custos Excedidos',
    description: 'Alertar quando os custos ultrapassarem o orçamento',
    type: 'financial',
    category: 'custos',
    defaultChannels: ['dashboard', 'email', 'push'],
    userRole: 'both',
    icon: AlertTriangle,
    color: 'text-red-500'
  },
  {
    id: 'margin-low',
    name: 'Margem Baixa',
    description: 'Alertar quando a margem de lucro estiver abaixo do esperado',
    type: 'financial',
    category: 'margem',
    defaultChannels: ['dashboard', 'email'],
    userRole: 'admin',
    icon: TrendingDown,
    color: 'text-orange-500'
  },
  
  // Notificações de Sistema
  {
    id: 'user-login',
    name: 'Novos Logins',
    description: 'Notificar sobre novos acessos ao sistema',
    type: 'system',
    category: 'seguranca',
    defaultChannels: ['dashboard'],
    userRole: 'admin',
    icon: Shield,
    color: 'text-blue-500'
  },
  {
    id: 'system-maintenance',
    name: 'Manutenção do Sistema',
    description: 'Alertas sobre manutenções programadas',
    type: 'system',
    category: 'manutencao',
    defaultChannels: ['dashboard', 'email'],
    userRole: 'both',
    icon: Settings,
    color: 'text-purple-500'
  },
  
  // Notificações de Contratos
  {
    id: 'contract-expiry',
    name: 'Vencimento de Contratos',
    description: 'Alertar sobre contratos próximos ao vencimento',
    type: 'contract',
    category: 'vencimento',
    defaultChannels: ['dashboard', 'email'],
    userRole: 'both',
    icon: Target,
    color: 'text-yellow-500'
  },
  {
    id: 'contract-renewal',
    name: 'Renovação de Contratos',
    description: 'Lembrar sobre renovações necessárias',
    type: 'contract',
    category: 'renovacao',
    defaultChannels: ['dashboard', 'email', 'push'],
    userRole: 'admin',
    icon: CheckCircle,
    color: 'text-emerald-500'
  },

  // Notificações de Orçamento
  {
    id: 'budget-variance',
    name: 'Variação Orçamentária',
    description: 'Alertar sobre grandes variações no orçamento',
    type: 'budget',
    category: 'variacao',
    defaultChannels: ['dashboard', 'email'],
    userRole: 'both',
    icon: DollarSign,
    color: 'text-indigo-500'
  }
];

const CHANNEL_ICONS = {
  email: Mail,
  push: Smartphone,
  sms: MessageSquare,
  dashboard: Monitor
};

const CHANNEL_LABELS = {
  email: 'E-mail',
  push: 'Push',
  sms: 'SMS',
  dashboard: 'Dashboard'
};

export default function NotificationSystem({ userRole = 'user' }: { userRole?: 'admin' | 'user' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => 
    localStorage.getItem('notifications-sound') !== 'false'
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar preferências existentes (mock data por enquanto)
  const preferences: NotificationPreference[] = [
    {
      id: '1',
      userId: 'current-user',
      type: 'financial',
      category: 'receita',
      enabled: true,
      channels: ['dashboard', 'email'],
      conditions: {},
      priority: 'medium'
    }
  ];
  const isLoading = false;

  // Mutation para salvar preferências
  const savePreferenceMutation = useMutation({
    mutationFn: async (preference: NotificationPreference) => {
      if (preference.id) {
        return apiRequest(`/api/notifications/preferences/${preference.id}`, {
          method: 'PUT',
          body: preference
        });
      } else {
        return apiRequest('/api/notifications/preferences', {
          method: 'POST',
          body: preference
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar as configurações de notificação.",
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar preferência
  const deletePreferenceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/notifications/preferences/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: "Configuração removida",
        description: "A preferência de notificação foi removida."
      });
    }
  });

  // Filtrar templates baseado no papel do usuário
  const availableTemplates = NOTIFICATION_TEMPLATES.filter(
    template => template.userRole === 'both' || template.userRole === userRole
  );

  // Encontrar preferência existente para um template
  const findPreferenceForTemplate = (templateId: string) => {
    return preferences.find(pref => 
      pref.type === NOTIFICATION_TEMPLATES.find(t => t.id === templateId)?.type &&
      pref.category === NOTIFICATION_TEMPLATES.find(t => t.id === templateId)?.category
    );
  };

  const handleToggleNotification = (template: NotificationTemplate, enabled: boolean) => {
    const existingPreference = findPreferenceForTemplate(template.id);
    
    const preference: NotificationPreference = {
      id: existingPreference?.id,
      userId: 'current-user', // This would come from auth context
      type: template.type,
      category: template.category,
      enabled,
      channels: enabled ? template.defaultChannels : [],
      conditions: {},
      priority: 'medium'
    };

    savePreferenceMutation.mutate(preference);
  };

  const handleChannelChange = (template: NotificationTemplate, channels: string[]) => {
    const existingPreference = findPreferenceForTemplate(template.id);
    
    const preference: NotificationPreference = {
      id: existingPreference?.id,
      userId: 'current-user',
      type: template.type,
      category: template.category,
      enabled: channels.length > 0,
      channels: channels as ('email' | 'push' | 'sms' | 'dashboard')[],
      conditions: existingPreference?.conditions || {},
      priority: existingPreference?.priority || 'medium'
    };

    savePreferenceMutation.mutate(preference);
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notifications-sound', enabled.toString());
    
    toast({
      title: enabled ? "Som habilitado" : "Som desabilitado",
      description: `Notificações ${enabled ? 'tocarão' : 'não tocarão'} som.`
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-blue-600/20 border-blue-400/30 text-blue-200 hover:bg-blue-600/30 relative"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notificações
          {preferences.filter(p => p.enabled).length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
              {preferences.filter(p => p.enabled).length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[500px] bg-blue-bg border-blue-400/30 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Sistema de Notificações
          </SheetTitle>
          <SheetDescription className="text-blue-300">
            Configure suas preferências de notificação por perfil
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-blue-600/30">
              <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-600">
                <Settings className="w-4 h-4 mr-1" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
                <Eye className="w-4 h-4 mr-1" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-4">
              {/* Configurações globais */}
              <Card className="bg-blue-800/20 border-blue-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-blue-300" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-blue-300" />
                      )}
                      <Label className="text-white text-sm">Som das Notificações</Label>
                    </div>
                    <Switch
                      checked={soundEnabled}
                      onCheckedChange={handleSoundToggle}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Templates de notificação por categoria */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">Tipos de Notificação</h3>
                
                {['financial', 'system', 'contract', 'budget'].map(type => {
                  const typeTemplates = availableTemplates.filter(t => t.type === type);
                  if (typeTemplates.length === 0) return null;

                  const typeLabels = {
                    financial: 'Financeiras',
                    system: 'Sistema',
                    contract: 'Contratos',
                    budget: 'Orçamento'
                  };

                  return (
                    <Card key={type} className="bg-blue-800/20 border-blue-600/30">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">
                          {typeLabels[type as keyof typeof typeLabels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {typeTemplates.map(template => {
                          const IconComponent = template.icon;
                          const preference = findPreferenceForTemplate(template.id);
                          const isEnabled = preference?.enabled || false;

                          return (
                            <div key={template.id} className="space-y-3 p-3 bg-blue-900/20 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <IconComponent className={`w-5 h-5 ${template.color}`} />
                                  <div>
                                    <div className="text-white text-sm font-medium">
                                      {template.name}
                                    </div>
                                    <div className="text-blue-300 text-xs">
                                      {template.description}
                                    </div>
                                  </div>
                                </div>
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={(checked) => 
                                    handleToggleNotification(template, checked)
                                  }
                                />
                              </div>

                              {isEnabled && (
                                <div className="space-y-3 pl-8">
                                  <div>
                                    <Label className="text-blue-200 text-xs">Canais de Notificação:</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {Object.entries(CHANNEL_ICONS).map(([channel, ChannelIcon]) => {
                                        const isSelected = preference?.channels.includes(channel as any) || false;
                                        
                                        return (
                                          <Button
                                            key={channel}
                                            variant={isSelected ? "default" : "outline"}
                                            size="sm"
                                            className={`h-7 text-xs ${
                                              isSelected 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-transparent border-blue-600/30 text-blue-200 hover:bg-blue-600/30'
                                            }`}
                                            onClick={() => {
                                              const currentChannels = preference?.channels || [];
                                              const newChannels = isSelected
                                                ? currentChannels.filter(c => c !== channel)
                                                : [...currentChannels, channel];
                                              handleChannelChange(template, newChannels);
                                            }}
                                          >
                                            <ChannelIcon className="w-3 h-3 mr-1" />
                                            {CHANNEL_LABELS[channel as keyof typeof CHANNEL_LABELS]}
                                          </Button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {preference && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-red-300 hover:text-red-200 hover:bg-red-600/20"
                                      onClick={() => preference.id && deletePreferenceMutation.mutate(preference.id)}
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Remover
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="bg-blue-800/20 border-blue-600/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Histórico de Notificações</CardTitle>
                  <CardDescription className="text-blue-300 text-xs">
                    Últimas notificações recebidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center space-x-3 p-2 bg-blue-900/20 rounded">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-white text-sm">
                            Receita ultrapassou R$ 500.000
                          </div>
                          <div className="text-blue-300 text-xs">
                            Há {i} hora{i > 1 ? 's' : ''}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {i % 2 === 0 ? 'Email' : 'Dashboard'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Estatísticas */}
          <Card className="bg-blue-800/20 border-blue-600/30">
            <CardHeader>
              <CardTitle className="text-white text-sm">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {preferences.filter(p => p.enabled).length}
                  </div>
                  <div className="text-xs text-blue-300">Ativas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {preferences.length}
                  </div>
                  <div className="text-xs text-blue-300">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}