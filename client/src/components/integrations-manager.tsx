import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Plug,
  Settings,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  CreditCard,
  Users,
  FileText,
  Activity,
  Shield,
  Clock,
  Webhook,
  Key,
  Globe,
  Zap,
  Download,
  Upload,
  RotateCcw,
  Monitor,
  Bell,
  Filter
} from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Integration {
  id: string;
  name: string;
  type: 'accounting' | 'banking' | 'hr' | 'erp' | 'webhook';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  lastSync: Date;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  dataPoints: number;
  errorCount: number;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'contabilizei',
    name: 'Contabilizei',
    type: 'accounting',
    provider: 'contabilizei.com.br',
    status: 'connected',
    description: 'Integração com sistema contábil para sincronização automática de receitas e despesas',
    icon: FileText,
    features: ['Importar lançamentos contábeis', 'Exportar DRE', 'Conciliação bancária', 'Relatórios fiscais'],
    lastSync: subHours(new Date(), 2),
    syncFrequency: 'daily',
    dataPoints: 1247,
    errorCount: 0
  },
  {
    id: 'banco-brasil',
    name: 'Banco do Brasil',
    type: 'banking',
    provider: 'bb.com.br',
    status: 'connected',
    description: 'Acesso às movimentações bancárias para conciliação automática',
    icon: CreditCard,
    features: ['Extrato bancário', 'Conciliação automática', 'Saldos em tempo real', 'Histórico de transações'],
    lastSync: subHours(new Date(), 1),
    syncFrequency: 'hourly',
    dataPoints: 892,
    errorCount: 2
  },
  {
    id: 'senior-rh',
    name: 'Senior RH',
    type: 'hr',
    provider: 'senior.com.br',
    status: 'error',
    description: 'Integração com sistema de RH para custos de folha de pagamento',
    icon: Users,
    features: ['Folha de pagamento', 'Custos por funcionário', 'Horas trabalhadas', 'Benefícios'],
    lastSync: subDays(new Date(), 1),
    syncFrequency: 'daily',
    dataPoints: 0,
    errorCount: 5
  },
  {
    id: 'sap-erp',
    name: 'SAP ERP',
    type: 'erp',
    provider: 'sap.com',
    status: 'disconnected',
    description: 'Conexão com sistema ERP corporativo para dados financeiros e operacionais',
    icon: Database,
    features: ['Centros de custo', 'Orçamentos', 'Contratos', 'Análise financeira'],
    lastSync: subDays(new Date(), 7),
    syncFrequency: 'daily',
    dataPoints: 0,
    errorCount: 0
  },
  {
    id: 'webhook-custom',
    name: 'Webhook Personalizado',
    type: 'webhook',
    provider: 'custom',
    status: 'syncing',
    description: 'Recebe dados de sistemas externos via webhooks personalizados',
    icon: Webhook,
    features: ['Recepção de dados', 'Processamento automático', 'Validação', 'Notificações'],
    lastSync: subHours(new Date(), 0.5),
    syncFrequency: 'realtime',
    dataPoints: 156,
    errorCount: 1
  }
];

const IntegrationsManager: React.FC = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('contabilizei');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showLogs, setShowLogs] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const { toast } = useToast();

  const selectedIntegrationData = AVAILABLE_INTEGRATIONS.find(i => i.id === selectedIntegration);

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'syncing': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'disconnected': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'disconnected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Integration['type']) => {
    switch (type) {
      case 'accounting': return 'bg-purple-500/20 text-purple-300';
      case 'banking': return 'bg-green-500/20 text-green-300';
      case 'hr': return 'bg-blue-500/20 text-blue-300';
      case 'erp': return 'bg-orange-500/20 text-orange-300';
      case 'webhook': return 'bg-pink-500/20 text-pink-300';
      default: return 'bg-blue-500/20 text-blue-300';
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3;
      
      toast({
        title: success ? "Conexão Testada" : "Erro de Conexão",
        description: success ? 
          "Conexão estabelecida com sucesso" : 
          "Falha na autenticação ou endpoint indisponível",
        variant: success ? "default" : "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const syncNow = async () => {
    toast({
      title: "Sincronização Iniciada",
      description: "Os dados estão sendo sincronizados em segundo plano",
    });
  };

  const toggleIntegration = async (enable: boolean) => {
    toast({
      title: enable ? "Integração Ativada" : "Integração Desativada",
      description: `${selectedIntegrationData?.name} foi ${enable ? 'conectada' : 'desconectada'}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Integrações Externas</h2>
          <p className="text-blue-200">
            Conecte com sistemas contábeis, bancários, RH e ERPs para automação completa
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowLogs(!showLogs)}
            className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
          >
            <Monitor className="w-4 h-4 mr-2" />
            {showLogs ? 'Ocultar Logs' : 'Ver Logs'}
          </Button>
          <Button
            onClick={() => toast({ title: "Sincronização Geral", description: "Todas as integrações estão sendo sincronizadas" })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Sincronizar Tudo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Integrações Ativas</p>
                <p className="text-2xl font-bold text-white">
                  {AVAILABLE_INTEGRATIONS.filter(i => i.status === 'connected').length}
                </p>
                <p className="text-xs text-green-400 mt-1">
                  de {AVAILABLE_INTEGRATIONS.length} disponíveis
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Plug className="text-blue-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Dados Sincronizados</p>
                <p className="text-2xl font-bold text-white">
                  {AVAILABLE_INTEGRATIONS.reduce((sum, i) => sum + i.dataPoints, 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-400 mt-1">registros processados</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <Database className="text-green-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Última Sincronização</p>
                <p className="text-2xl font-bold text-white">
                  {format(new Date(Math.max(...AVAILABLE_INTEGRATIONS.map(i => i.lastSync.getTime()))), 'HH:mm')}
                </p>
                <p className="text-xs text-green-400 mt-1">há poucos minutos</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <Clock className="text-yellow-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Erros Detectados</p>
                <p className="text-2xl font-bold text-white">
                  {AVAILABLE_INTEGRATIONS.reduce((sum, i) => sum + i.errorCount, 0)}
                </p>
                <p className="text-xs text-red-400 mt-1">requer atenção</p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-full">
                <AlertTriangle className="text-red-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Integrations List */}
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white">Sistemas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AVAILABLE_INTEGRATIONS.map((integration) => (
              <div
                key={integration.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedIntegration === integration.id
                    ? 'border-blue-400 bg-blue-600/20'
                    : 'border-blue-400/30 hover:border-blue-400/50 hover:bg-blue-600/10'
                }`}
                onClick={() => setSelectedIntegration(integration.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <integration.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium text-sm truncate">
                        {integration.name}
                      </h4>
                      {getStatusIcon(integration.status)}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getTypeColor(integration.type)}>
                        {integration.type === 'accounting' ? 'Contábil' :
                         integration.type === 'banking' ? 'Bancário' :
                         integration.type === 'hr' ? 'RH' :
                         integration.type === 'erp' ? 'ERP' : 'Webhook'}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        {integration.status === 'connected' ? 'Conectado' :
                         integration.status === 'syncing' ? 'Sincronizando' :
                         integration.status === 'error' ? 'Erro' : 'Desconectado'}
                      </Badge>
                    </div>
                    <p className="text-blue-300 text-xs">
                      {integration.dataPoints.toLocaleString()} registros
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Integration Details */}
        <div className="lg:col-span-3">
          {selectedIntegrationData && (
            <Card className="glass-effect border-blue-400/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <selectedIntegrationData.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{selectedIntegrationData.name}</CardTitle>
                      <p className="text-blue-200 text-sm">{selectedIntegrationData.provider}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testConnection}
                      disabled={isTesting}
                      className="border-blue-400/30 text-blue-200"
                    >
                      {isTesting ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4 mr-2" />
                      )}
                      {isTesting ? 'Testando...' : 'Testar'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={syncNow}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Sincronizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="config">Configuração</TabsTrigger>
                    <TabsTrigger value="data">Dados</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-600/20 rounded-lg">
                          <div className="text-2xl font-bold text-white">
                            {selectedIntegrationData.dataPoints.toLocaleString()}
                          </div>
                          <div className="text-blue-200 text-sm">Registros Sincronizados</div>
                        </div>
                        <div className="text-center p-4 bg-blue-600/20 rounded-lg">
                          <div className="text-2xl font-bold text-white">
                            {format(selectedIntegrationData.lastSync, 'dd/MM HH:mm', { locale: ptBR })}
                          </div>
                          <div className="text-blue-200 text-sm">Última Sincronização</div>
                        </div>
                        <div className="text-center p-4 bg-blue-600/20 rounded-lg">
                          <div className={`text-2xl font-bold ${selectedIntegrationData.errorCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {selectedIntegrationData.errorCount}
                          </div>
                          <div className="text-blue-200 text-sm">Erros Detectados</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-3">Funcionalidades</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedIntegrationData.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-blue-200 text-sm">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-blue-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Descrição</h4>
                        <p className="text-blue-200 text-sm">{selectedIntegrationData.description}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="config" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Status da Integração</h4>
                        <Switch
                          checked={selectedIntegrationData.status === 'connected'}
                          onCheckedChange={toggleIntegration}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-blue-200">Frequência de Sincronização</Label>
                          <Select defaultValue={selectedIntegrationData.syncFrequency}>
                            <SelectTrigger className="mt-2 bg-blue-600/30 border-blue-400/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="realtime">Tempo Real</SelectItem>
                              <SelectItem value="hourly">A cada hora</SelectItem>
                              <SelectItem value="daily">Diariamente</SelectItem>
                              <SelectItem value="weekly">Semanalmente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-blue-200">Endpoint da API</Label>
                          <Input
                            className="mt-2 bg-blue-600/30 border-blue-400/30 text-white"
                            placeholder="https://api.exemplo.com/v1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-blue-200">Chave da API</Label>
                        <Input
                          className="mt-2 bg-blue-600/30 border-blue-400/30 text-white"
                          type="password"
                          placeholder="Insira sua chave da API"
                        />
                      </div>

                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Settings className="w-4 h-4 mr-2" />
                        Salvar Configurações
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="mt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-white font-medium mb-3">Últimas Importações</h4>
                          <div className="space-y-2">
                            {[
                              { type: 'Lançamentos contábeis', count: 45, time: '2h atrás' },
                              { type: 'Movimentações bancárias', count: 23, time: '4h atrás' },
                              { type: 'Custos de folha', count: 12, time: '1d atrás' },
                            ].map((item, index) => (
                              <div key={index} className="flex justify-between p-3 bg-blue-600/20 rounded-lg">
                                <div>
                                  <p className="text-white text-sm">{item.type}</p>
                                  <p className="text-blue-300 text-xs">{item.time}</p>
                                </div>
                                <Badge variant="outline" className="border-green-400/30 text-green-300">
                                  {item.count} registros
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-3">Mapeamento de Campos</h4>
                          <div className="space-y-2">
                            {[
                              { from: 'cost_center', to: 'centro_custo' },
                              { from: 'employee_id', to: 'id_funcionario' },
                              { from: 'amount', to: 'valor' },
                            ].map((mapping, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-blue-600/20 rounded-lg">
                                <span className="text-blue-200 text-sm">{mapping.from}</span>
                                <span className="text-blue-400">→</span>
                                <span className="text-white text-sm">{mapping.to}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="border-blue-400/30 text-blue-200">
                          <Download className="w-4 h-4 mr-2" />
                          Exportar Dados
                        </Button>
                        <Button variant="outline" className="border-blue-400/30 text-blue-200">
                          <Upload className="w-4 h-4 mr-2" />
                          Importar Dados
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsManager;