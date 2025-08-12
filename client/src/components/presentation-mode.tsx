import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  Target,
  Users,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PresentationSlide {
  id: string;
  title: string;
  type: 'overview' | 'financial' | 'contracts' | 'costs' | 'performance' | 'alerts';
  duration: number; // em segundos
  component: React.ComponentType<any>;
}

interface PresentationSettings {
  autoAdvance: boolean;
  slideDuration: number;
  showProgress: boolean;
  fullscreen: boolean;
  transitionSpeed: 'slow' | 'medium' | 'fast';
}

const BLUE_COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

// Slide Components
const OverviewSlide: React.FC = () => {
  const { data: kpis } = useQuery({ queryKey: ['/api/analytics/kpis'] });
  const { data: metrics } = useQuery({ queryKey: ['/api/analytics/realtime-metrics'] });

  return (
    <div className="h-full flex flex-col justify-center space-y-8 p-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-4">Sistema DRE - Opus</h1>
        <p className="text-2xl text-blue-200">Resumo Executivo de Performance</p>
        <p className="text-lg text-blue-300 mt-2">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-400/30 bg-gradient-to-br from-blue-900/60 to-blue-800/40">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-sm text-blue-200 mb-2">Receita Total</p>
            <p className="text-3xl font-bold text-white">
              R$ {(((kpis as any)?.totalRevenue || 0) / 1000).toFixed(0)}K
            </p>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-300 text-sm">+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30 bg-gradient-to-br from-blue-900/60 to-blue-800/40">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-sm text-blue-200 mb-2">Custos Totais</p>
            <p className="text-3xl font-bold text-white">
              R$ {(((kpis as any)?.totalCosts || 0) / 1000).toFixed(0)}K
            </p>
            <div className="flex items-center justify-center mt-2">
              <TrendingDown className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-300 text-sm">-3.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30 bg-gradient-to-br from-blue-900/60 to-blue-800/40">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-sm text-blue-200 mb-2">Margem Líquida</p>
            <p className="text-3xl font-bold text-white">
              {(((kpis as any)?.profitMargin || 0) * 100).toFixed(1)}%
            </p>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-300 text-sm">+2.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30 bg-gradient-to-br from-blue-900/60 to-blue-800/40">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-sm text-blue-200 mb-2">Contratos Ativos</p>
            <p className="text-3xl font-bold text-white">24</p>
            <div className="flex items-center justify-center mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-300 text-sm">100% operacionais</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-8">
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Performance Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={[
                { month: 'Jun', receita: 450, custo: 320 },
                { month: 'Jul', receita: 480, custo: 340 },
                { month: 'Ago', receita: 520, custo: 350 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                <XAxis dataKey="month" stroke="#93C5FD" />
                <YAxis stroke="#93C5FD" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E3A8A', 
                    border: '1px solid #3B82F6',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="receita" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="custo" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Status dos Contratos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Contratos no Prazo</span>
              <div className="flex items-center">
                <span className="text-green-300 font-semibold mr-2">92%</span>
                <Progress value={92} className="w-20 h-2" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Faturamento Realizado</span>
              <div className="flex items-center">
                <span className="text-blue-300 font-semibold mr-2">87%</span>
                <Progress value={87} className="w-20 h-2" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Aproveitamento Médio</span>
              <div className="flex items-center">
                <span className="text-yellow-300 font-semibold mr-2">89%</span>
                <Progress value={89} className="w-20 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const FinancialSlide: React.FC = () => {
  const { data: chartData } = useQuery({ queryKey: ['/api/analytics/chart-data'] });

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">Análise Financeira</h2>
        <p className="text-xl text-blue-200">Receitas, Custos e Margem de Contribuição</p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={(chartData as any)?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                <XAxis dataKey="month" stroke="#93C5FD" />
                <YAxis stroke="#93C5FD" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E3A8A', 
                    border: '1px solid #3B82F6',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="revenue" fill="#10B981" name="Receita" />
                <Bar dataKey="cost" fill="#EF4444" name="Custo" />
                <Bar dataKey="profit" fill="#3B82F6" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Distribuição de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Folha de Pagamento', value: 65, color: '#1E40AF' },
                    { name: 'Insumos', value: 20, color: '#3B82F6' },
                    { name: 'Infraestrutura', value: 10, color: '#60A5FA' },
                    { name: 'Outros', value: 5, color: '#93C5FD' }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {[
                    { name: 'Folha de Pagamento', value: 65, color: '#1E40AF' },
                    { name: 'Insumos', value: 20, color: '#3B82F6' },
                    { name: 'Infraestrutura', value: 10, color: '#60A5FA' },
                    { name: 'Outros', value: 5, color: '#93C5FD' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E3A8A', 
                    border: '1px solid #3B82F6',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <Card className="glass-effect border-green-400/30 bg-gradient-to-br from-green-900/40 to-green-800/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-200 text-sm">Receita YTD</p>
            <p className="text-2xl font-bold text-white">R$ 2.85M</p>
            <p className="text-green-300 text-xs">+15.2% vs ano anterior</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-red-400/30 bg-gradient-to-br from-red-900/40 to-red-800/20">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-200 text-sm">Custos YTD</p>
            <p className="text-2xl font-bold text-white">R$ 1.92M</p>
            <p className="text-red-300 text-xs">+8.7% vs ano anterior</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30 bg-gradient-to-br from-blue-900/40 to-blue-800/20">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-200 text-sm">EBITDA</p>
            <p className="text-2xl font-bold text-white">R$ 930K</p>
            <p className="text-blue-300 text-xs">Margem: 32.6%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ContractsSlide: React.FC = () => {
  const { data: contracts } = useQuery({ queryKey: ['/api/contracts'] });

  const contractsData = (contracts as any[]) || [];

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">Performance por Contrato</h2>
        <p className="text-xl text-blue-200">Análise de Rentabilidade e Eficiência</p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Top 5 Contratos - Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Shopping Curitiba', valor: 485, margem: 28 },
                { name: 'Hospital Regional', valor: 342, margem: 32 },
                { name: 'Shopping Bauru', valor: 298, margem: 25 },
                { name: 'Projeto ABC', valor: 245, margem: 30 },
                { name: 'Centro Comercial', valor: 189, margem: 22 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                <XAxis dataKey="name" stroke="#93C5FD" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#93C5FD" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E3A8A', 
                    border: '1px solid #3B82F6',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="valor" fill="#3B82F6" name="Receita (K)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Status dos Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-900/30 rounded-lg border border-green-400/30">
                <div className="flex items-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <p className="text-green-300 font-medium">Contratos Ativos</p>
                    <p className="text-green-200 text-sm">Operação normal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">18</p>
                  <p className="text-green-300 text-sm">75%</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-900/30 rounded-lg border border-yellow-400/30">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-yellow-400 mr-3" />
                  <div>
                    <p className="text-yellow-300 font-medium">Em Negociação</p>
                    <p className="text-yellow-200 text-sm">Renovação pendente</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">4</p>
                  <p className="text-yellow-300 text-sm">17%</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-900/30 rounded-lg border border-blue-400/30">
                <div className="flex items-center">
                  <Briefcase className="w-6 h-6 text-blue-400 mr-3" />
                  <div>
                    <p className="text-blue-300 font-medium">Novos Contratos</p>
                    <p className="text-blue-200 text-sm">Iniciando operação</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">2</p>
                  <p className="text-blue-300 text-sm">8%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        {contractsData.slice(0, 4).map((contract, index) => (
          <Card key={contract.id || index} className="glass-effect border-blue-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <Badge variant="outline" className="border-green-400/30 text-green-300">
                  Ativo
                </Badge>
              </div>
              <p className="text-white font-medium text-sm mb-1">{contract.name}</p>
              <p className="text-blue-200 text-xs mb-2">{contract.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Margem</span>
                <span className="text-white font-semibold text-sm">
                  {(25 + Math.random() * 10).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AlertsSlide: React.FC = () => {
  return (
    <div className="h-full flex flex-col justify-center p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">Centro de Alertas</h2>
        <p className="text-xl text-blue-200">Monitoramento e Ações Requeridas</p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        <Card className="glass-effect border-red-400/30">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center">
              <AlertCircle className="w-6 h-6 text-red-400 mr-2" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Margem Crítica - Shopping Bauru</p>
                <p className="text-red-200 text-sm">Margem abaixo de 20% nos últimos 2 meses</p>
                <p className="text-red-400 text-xs mt-1">Ação requerida até: 15/08/2025</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Custo Elevado - Folha Hospital</p>
                <p className="text-red-200 text-sm">Aumento de 15% nos custos de pessoal</p>
                <p className="text-red-400 text-xs mt-1">Ação requerida até: 20/08/2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center">
              <Clock className="w-6 h-6 text-yellow-400 mr-2" />
              Atenção Requerida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">Renovação Contrato - Projeto ABC</p>
                <p className="text-yellow-200 text-sm">Contrato vence em 30 dias</p>
                <p className="text-yellow-400 text-xs mt-1">Revisar até: 25/08/2025</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">Aproveitamento Baixo</p>
                <p className="text-yellow-200 text-sm">Centro Comercial: 85% vs meta 90%</p>
                <p className="text-yellow-400 text-xs mt-1">Monitorar até: 30/08/2025</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">Faturamento Pendente</p>
                <p className="text-yellow-200 text-sm">5 notas fiscais aguardando aprovação</p>
                <p className="text-yellow-400 text-xs mt-1">Aprovar até: 18/08/2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <Card className="glass-effect border-green-400/30 bg-gradient-to-br from-green-900/40 to-green-800/20">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-200 text-sm mb-2">Indicadores OK</p>
            <p className="text-3xl font-bold text-white">87%</p>
            <p className="text-green-300 text-xs">Dentro das metas</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-yellow-400/30 bg-gradient-to-br from-yellow-900/40 to-yellow-800/20">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-yellow-200 text-sm mb-2">Atenção Requerida</p>
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-yellow-300 text-xs">Itens pendentes</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-red-400/30 bg-gradient-to-br from-red-900/40 to-red-800/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-200 text-sm mb-2">Alertas Críticos</p>
            <p className="text-3xl font-bold text-white">2</p>
            <p className="text-red-300 text-xs">Ação imediata</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PresentationMode: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [settings, setSettings] = useState<PresentationSettings>({
    autoAdvance: true,
    slideDuration: 15,
    showProgress: true,
    fullscreen: false,
    transitionSpeed: 'medium'
  });

  const slides: PresentationSlide[] = [
    {
      id: 'overview',
      title: 'Visão Geral Executiva',
      type: 'overview',
      duration: settings.slideDuration,
      component: OverviewSlide
    },
    {
      id: 'financial',
      title: 'Análise Financeira',
      type: 'financial',
      duration: settings.slideDuration,
      component: FinancialSlide
    },
    {
      id: 'contracts',
      title: 'Performance de Contratos',
      type: 'contracts',
      duration: settings.slideDuration,
      component: ContractsSlide
    },
    {
      id: 'alerts',
      title: 'Centro de Alertas',
      type: 'alerts',
      duration: settings.slideDuration,
      component: AlertsSlide
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeRemaining(settings.slideDuration);
  }, [slides.length, settings.slideDuration]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeRemaining(settings.slideDuration);
  }, [slides.length, settings.slideDuration]);

  const startPresentation = () => {
    setIsActive(true);
    setCurrentSlide(0);
    setTimeRemaining(settings.slideDuration);
    setIsPaused(false);
    if (settings.fullscreen) {
      setIsFullscreen(true);
    }
  };

  const stopPresentation = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsFullscreen(false);
    setTimeRemaining(0);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Timer para auto-advance
  useEffect(() => {
    if (!isActive || isPaused || !settings.autoAdvance) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          nextSlide();
          return settings.slideDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, settings.autoAdvance, nextSlide, settings.slideDuration]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          stopPresentation();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, nextSlide, prevSlide]);

  if (!isActive) {
    return (
      <Card className="glass-effect border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="w-5 h-5" />
            Modo de Apresentação Executiva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-blue-200 mb-4">
                Modo automático para apresentações executivas com slides de alta qualidade, 
                transições suaves e métricas em tempo real.
              </p>
              
              <div className="space-y-4">
                <h4 className="text-white font-medium">Slides Incluídos:</h4>
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span className="text-blue-200">{slide.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-medium">Configurações:</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200 text-sm mb-2 block">
                    Duração por slide (segundos)
                  </label>
                  <Select 
                    value={settings.slideDuration.toString()} 
                    onValueChange={(value) => setSettings({...settings, slideDuration: parseInt(value)})}
                  >
                    <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 segundos</SelectItem>
                      <SelectItem value="15">15 segundos</SelectItem>
                      <SelectItem value="20">20 segundos</SelectItem>
                      <SelectItem value="30">30 segundos</SelectItem>
                      <SelectItem value="45">45 segundos</SelectItem>
                      <SelectItem value="60">60 segundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoAdvance"
                    checked={settings.autoAdvance}
                    onChange={(e) => setSettings({...settings, autoAdvance: e.target.checked})}
                    className="rounded border-blue-400"
                  />
                  <label htmlFor="autoAdvance" className="text-blue-200 text-sm">
                    Avanço automático
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showProgress"
                    checked={settings.showProgress}
                    onChange={(e) => setSettings({...settings, showProgress: e.target.checked})}
                    className="rounded border-blue-400"
                  />
                  <label htmlFor="showProgress" className="text-blue-200 text-sm">
                    Mostrar progresso
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fullscreen"
                    checked={settings.fullscreen}
                    onChange={(e) => setSettings({...settings, fullscreen: e.target.checked})}
                    className="rounded border-blue-400"
                  />
                  <label htmlFor="fullscreen" className="text-blue-200 text-sm">
                    Iniciar em tela cheia
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={startPresentation}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Apresentação
            </Button>
          </div>

          <div className="text-xs text-blue-300 space-y-1">
            <p><strong>Controles durante a apresentação:</strong></p>
            <p>• Setas ← → ou Espaço: Navegar slides</p>
            <p>• P: Pausar/Continuar</p>
            <p>• F: Alternar tela cheia</p>
            <p>• ESC: Sair da apresentação</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900' : 'h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900'}`}>
      {/* Progress Bar */}
      {settings.showProgress && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="h-1 bg-blue-900/50">
            <div 
              className="h-full bg-blue-400 transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((settings.slideDuration - timeRemaining) / settings.slideDuration) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={prevSlide}
          className="bg-blue-900/80 border-blue-400/30 text-white hover:bg-blue-800/80"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={togglePause}
          className="bg-blue-900/80 border-blue-400/30 text-white hover:bg-blue-800/80"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={nextSlide}
          className="bg-blue-900/80 border-blue-400/30 text-white hover:bg-blue-800/80"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={toggleFullscreen}
          className="bg-blue-900/80 border-blue-400/30 text-white hover:bg-blue-800/80"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={stopPresentation}
          className="bg-red-900/80 border-red-400/30 text-white hover:bg-red-800/80"
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>

      {/* Slide Number and Timer */}
      <div className="absolute top-4 left-4 z-20 flex gap-4">
        <Badge variant="outline" className="bg-blue-900/80 border-blue-400/30 text-white">
          {currentSlide + 1} / {slides.length}
        </Badge>
        {settings.autoAdvance && !isPaused && (
          <Badge variant="outline" className="bg-blue-900/80 border-blue-400/30 text-white">
            <Clock className="w-3 h-3 mr-1" />
            {timeRemaining}s
          </Badge>
        )}
        {isPaused && (
          <Badge variant="outline" className="bg-yellow-900/80 border-yellow-400/30 text-yellow-200">
            PAUSADO
          </Badge>
        )}
      </div>

      {/* Current Slide */}
      <div className="h-full">
        <CurrentSlideComponent />
      </div>
    </div>
  );
};

export default PresentationMode;