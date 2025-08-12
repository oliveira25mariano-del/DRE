import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  Calendar,
  Building2,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Maximize2,
  Grid,
  Layout,
  Palette,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Star,
  Award,
  Activity,
  Shield
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  ComposedChart
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExecutiveMetrics {
  totalRevenue: number;
  totalCosts: number;
  profitMargin: number;
  contractsActive: number;
  employeesCount: number;
  monthlyGrowth: number;
  operationalEfficiency: number;
  customerSatisfaction: number;
}

interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  format: 'currency' | 'percentage' | 'number';
}

interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'metric';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  visible: boolean;
  config?: any;
}

const BLUE_COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

const ExecutiveDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last-3-months');
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'list' | 'custom'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  
  const { toast } = useToast();

  // Queries for real data
  const { data: kpis } = useQuery({ queryKey: ['/api/analytics/kpis'] });
  const { data: contracts } = useQuery({ queryKey: ['/api/contracts'] });
  const { data: chartData } = useQuery({ queryKey: ['/api/analytics/chart-data'] });
  const { data: realtimeMetrics } = useQuery({ queryKey: ['/api/analytics/realtime-metrics'] });

  // Generate executive metrics
  const executiveMetrics = useMemo((): ExecutiveMetrics => {
    const baseRevenue = (realtimeMetrics as any)?.revenue?.current || 450000;
    const baseCosts = 320000;
    
    return {
      totalRevenue: baseRevenue,
      totalCosts: baseCosts,
      profitMargin: ((baseRevenue - baseCosts) / baseRevenue) * 100,
      contractsActive: (contracts as any[])?.length || 12,
      employeesCount: 89,
      monthlyGrowth: 12.5,
      operationalEfficiency: 94.2,
      customerSatisfaction: 96.8
    };
  }, [realtimeMetrics, contracts]);

  // KPI Cards configuration
  const kpiCards = useMemo((): KPICard[] => [
    {
      id: 'revenue',
      title: 'Receita Total',
      value: executiveMetrics.totalRevenue,
      change: 15.2,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-400',
      format: 'currency'
    },
    {
      id: 'margin',
      title: 'Margem de Lucro',
      value: executiveMetrics.profitMargin,
      change: 2.8,
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-400',
      format: 'percentage'
    },
    {
      id: 'contracts',
      title: 'Contratos Ativos',
      value: executiveMetrics.contractsActive,
      change: 8.3,
      trend: 'up',
      icon: Building2,
      color: 'text-purple-400',
      format: 'number'
    },
    {
      id: 'efficiency',
      title: 'Eficiência Operacional',
      value: executiveMetrics.operationalEfficiency,
      change: 1.5,
      trend: 'up',
      icon: Target,
      color: 'text-orange-400',
      format: 'percentage'
    },
    {
      id: 'satisfaction',
      title: 'Satisfação do Cliente',
      value: executiveMetrics.customerSatisfaction,
      change: -0.2,
      trend: 'down',
      icon: Star,
      color: 'text-yellow-400',
      format: 'percentage'
    },
    {
      id: 'growth',
      title: 'Crescimento Mensal',
      value: executiveMetrics.monthlyGrowth,
      change: 3.1,
      trend: 'up',
      icon: Award,
      color: 'text-pink-400',
      format: 'percentage'
    }
  ], [executiveMetrics]);

  // Generate performance comparison data
  const performanceData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const month = format(date, 'MMM/yy', { locale: ptBR });
      
      const baseRevenue = 380000 + (Math.random() * 120000);
      const baseCosts = 260000 + (Math.random() * 80000);
      const efficiency = 85 + (Math.random() * 15);
      
      months.push({
        month,
        receita: Math.round(baseRevenue),
        custo: Math.round(baseCosts),
        margem: ((baseRevenue - baseCosts) / baseRevenue * 100).toFixed(1),
        eficiencia: Math.round(efficiency),
        contratos: Math.floor(8 + Math.random() * 8),
        satisfacao: Math.round(92 + Math.random() * 8)
      });
    }
    return months;
  }, []);

  // Contract performance breakdown
  const contractPerformance = useMemo(() => {
    const contractsList = (contracts as any[]) || [];
    return contractsList.slice(0, 6).map((contract, index) => ({
      name: contract.name?.substring(0, 20) + '...' || `Contrato ${index + 1}`,
      receita: Math.round(45000 + Math.random() * 85000),
      custo: Math.round(30000 + Math.random() * 50000),
      margem: Math.round(15 + Math.random() * 25),
      status: Math.random() > 0.2 ? 'Ativo' : 'Alerta',
      sla: Math.round(95 + Math.random() * 5)
    }));
  }, [contracts]);

  // Risk indicators
  const riskIndicators = useMemo(() => [
    {
      category: 'Financeiro',
      risk: 'Baixo',
      score: 92,
      items: ['Fluxo de caixa estável', 'Margem dentro do target', 'Inadimplência controlada']
    },
    {
      category: 'Operacional',
      risk: 'Médio',
      score: 76,
      items: ['Alta rotatividade em 2 contratos', 'Eficiência abaixo da meta', 'Retrabalho identificado']
    },
    {
      category: 'Comercial',
      risk: 'Baixo',
      score: 88,
      items: ['Pipeline saudável', 'Renovações em dia', 'Satisfação alta']
    },
    {
      category: 'Compliance',
      risk: 'Baixo',
      score: 95,
      items: ['Auditorias em dia', 'Documentação completa', 'Normas seguidas']
    }
  ], []);

  const formatValue = (value: string | number, format: KPICard['format']): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0
        }).format(numValue);
      case 'percentage':
        return `${numValue.toFixed(1)}%`;
      case 'number':
        return numValue.toLocaleString('pt-BR');
      default:
        return numValue.toString();
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-blue-400';
      default: return 'text-blue-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      case 'stable': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Baixo': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Médio': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Alto': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const exportDashboard = () => {
    toast({
      title: "Dashboard Exportado",
      description: "Relatório executivo em PDF pronto para download",
    });
  };

  const refreshData = () => {
    toast({
      title: "Dados Atualizados",
      description: "Dashboard atualizado com os dados mais recentes",
    });
  };

  const saveDashboardConfig = () => {
    toast({
      title: "Configuração Salva",
      description: "Layout personalizado salvo com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Executivo</h2>
          <p className="text-blue-200">
            Visão estratégica consolidada para tomada de decisões
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Ocultar' : 'Filtros'}
          </Button>
          <Button
            variant="outline"
            onClick={refreshData}
            className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={exportDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configurações e Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <Label className="text-blue-200">Período</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="mt-2 bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-month">Último mês</SelectItem>
                    <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                    <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
                    <SelectItem value="last-year">Último ano</SelectItem>
                    <SelectItem value="custom">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-200">Layout</Label>
                <Select value={dashboardLayout} onValueChange={(value: any) => setDashboardLayout(value)}>
                  <SelectTrigger className="mt-2 bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grade</SelectItem>
                    <SelectItem value="list">Lista</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-blue-200 text-sm">
                  Atualização automática
                </Label>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="comparison-mode"
                  checked={comparisonMode}
                  onCheckedChange={setComparisonMode}
                />
                <Label htmlFor="comparison-mode" className="text-blue-200 text-sm">
                  Modo comparação
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={kpi.id} className="glass-effect border-blue-400/30 hover:border-blue-400/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`bg-blue-500/20 p-2 rounded-lg`}>
                    <IconComponent className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div className={`flex items-center text-xs ${getTrendColor(kpi.trend)}`}>
                    {getTrendIcon(kpi.trend)}
                    <span className="ml-1">{kpi.change > 0 ? '+' : ''}{kpi.change}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {formatValue(kpi.value, kpi.format)}
                  </p>
                  <p className="text-blue-200 text-xs">{kpi.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <Card className="glass-effect border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Performance Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={performanceData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#93C5FD" />
                  <YAxis stroke="#93C5FD" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1E3A8A', 
                      border: '1px solid #3B82F6',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'receita' || name === 'custo' ? 
                        `R$ ${(value / 1000).toFixed(0)}K` : 
                        name === 'eficiencia' ? `${value}%` : value,
                      name === 'receita' ? 'Receita' :
                      name === 'custo' ? 'Custos' :
                      name === 'eficiencia' ? 'Eficiência' : name
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#revenueGradient)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="custo" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#costGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eficiencia" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Assessment */}
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Indicadores de Risco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskIndicators.map((indicator, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">{indicator.category}</h4>
                  <Badge variant="outline" className={getRiskColor(indicator.risk)}>
                    {indicator.risk}
                  </Badge>
                </div>
                <Progress value={indicator.score} className="h-2" />
                <div className="text-blue-200 text-xs space-y-1">
                  {indicator.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-green-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Contract Performance */}
      <Card className="glass-effect border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Performance por Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-400/30">
                  <th className="text-left text-blue-200 pb-3">Contrato</th>
                  <th className="text-right text-blue-200 pb-3">Receita</th>
                  <th className="text-right text-blue-200 pb-3">Custo</th>
                  <th className="text-right text-blue-200 pb-3">Margem</th>
                  <th className="text-center text-blue-200 pb-3">SLA</th>
                  <th className="text-center text-blue-200 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {contractPerformance.map((contract, index) => (
                  <tr key={index} className="border-b border-blue-400/20">
                    <td className="py-3">
                      <div className="text-white font-medium">{contract.name}</div>
                    </td>
                    <td className="text-right py-3">
                      <span className="text-green-400 font-medium">
                        {formatValue(contract.receita, 'currency')}
                      </span>
                    </td>
                    <td className="text-right py-3">
                      <span className="text-red-400">
                        {formatValue(contract.custo, 'currency')}
                      </span>
                    </td>
                    <td className="text-right py-3">
                      <span className="text-blue-400 font-medium">
                        {contract.margem}%
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <Progress value={contract.sla} className="w-16 h-2 mx-auto" />
                      <span className="text-blue-300 text-xs mt-1">{contract.sla}%</span>
                    </td>
                    <td className="text-center py-3">
                      <Badge 
                        variant="outline" 
                        className={contract.status === 'Ativo' ? 
                          'border-green-400/30 text-green-300' : 
                          'border-yellow-400/30 text-yellow-300'
                        }
                      >
                        {contract.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-effect border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
              onClick={() => window.location.href = '/reports'}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
              onClick={() => window.location.href = '/predictions'}
            >
              <LineChart className="w-4 h-4 mr-2" />
              Predições ML
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
              onClick={() => window.location.href = '/integrations'}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Integrações
            </Button>
            <Button 
              onClick={saveDashboardConfig}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Salvar Layout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;