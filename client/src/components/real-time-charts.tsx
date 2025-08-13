import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Target, 
  BarChart3, PieChart as PieChartIcon, Activity, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConnectivityStatus from "@/components/connectivity-status";
import ThemeCustomizer from "@/components/theme-customizer";
import NotificationSystem from "@/components/notification-system";
import { useTheme, useThemeClasses } from "@/hooks/useTheme";

// Cores do tema - Tonalidades de Azul
const CHART_COLORS = {
  primary: "#1E40AF",    // Azul escuro
  secondary: "#3B82F6",  // Azul médio
  accent: "#60A5FA",     // Azul claro
  danger: "#1E3A8A",     // Azul navy
  warning: "#2563EB",    // Azul intenso
  info: "#3B82F6"       // Azul médio
};

interface RealtimeMetrics {
  revenue: { current: number; previous: number; change: number };
  costs: { current: number; previous: number; change: number };
  profit: { current: number; previous: number; change: number };
  margin: { current: number; previous: number; change: number };
}

interface ChartData {
  monthlyTrend: Array<{ month: string; receita: number; custos: number; lucro: number }>;
  contractDistribution: Array<{ name: string; value: number; percentage: number }>;
  categoryPerformance: Array<{ category: string; budget: number; actual: number; variance: number }>;
  kpiTrend: Array<{ date: string; margem: number; roi: number; eficiencia: number }>;
}

export default function RealtimeCharts() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRealtime, setIsRealtime] = useState(true);
  
  const { config, shouldAutoRefresh, shouldShowTrends } = useTheme();
  const { getLayoutClasses, getCardClasses, getChartTheme } = useThemeClasses();

  // Query para métricas em tempo real
  const { data: metrics, refetch: refetchMetrics } = useQuery<RealtimeMetrics>({
    queryKey: ['/api/analytics/realtime-metrics'],
    refetchInterval: (isRealtime && shouldAutoRefresh) ? 30000 : false,
  });

  // Query para dados dos gráficos
  const { data: chartData, refetch: refetchCharts } = useQuery<ChartData>({
    queryKey: ['/api/analytics/chart-data'],
    refetchInterval: (isRealtime && shouldAutoRefresh) ? 60000 : false,
  });

  // Atualizar timestamp quando dados chegarem
  useEffect(() => {
    if (metrics || chartData) {
      setLastUpdate(new Date());
    }
  }, [metrics, chartData]);

  // Função para atualizar todos os dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchMetrics(), refetchCharts()]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  // Formatação de valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatação de percentuais
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Paleta de azuis para gráfico de pizza
  const bluesPalette = [
    "#1E40AF", // Azul escuro
    "#3B82F6", // Azul médio  
    "#60A5FA", // Azul claro
    "#2563EB", // Azul intenso
    "#1D4ED8", // Azul royal
    "#93C5FD", // Azul muito claro
  ];

  // Dados para o gráfico de pizza (distribuição de contratos)
  const pieData = chartData?.contractDistribution.map((item, index) => ({
    ...item,
    fill: bluesPalette[index % bluesPalette.length]
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Métricas</h2>
          <div className="mt-2">
            <ConnectivityStatus 
              lastUpdate={lastUpdate}
              isRealtime={isRealtime}
              onToggleRealtime={() => setIsRealtime(!isRealtime)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <NotificationSystem userRole="admin" />
          {/* ThemeCustomizer integrado no header */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* KPIs em Tempo Real */}
      <div className={getLayoutClasses()}>
        <Card className={getCardClasses()}>
          <CardContent className={`${config.compactCards ? "p-4" : "p-6"} relative`}>
            <div className="absolute top-4 right-4">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Receita Total</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(metrics?.revenue.current || 0)}
              </p>
              {shouldShowTrends && (
                <div className="flex items-center mt-2">
                  {(metrics?.revenue.change || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-blue-600 mr-1" />
                  )}
                  <span className={`text-sm ${(metrics?.revenue.change || 0) >= 0 ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatPercent(Math.abs(metrics?.revenue.change || 0))}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Custos Totais</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(metrics?.costs.current || 0)}
              </p>
              <div className="flex items-center mt-2">
                {(metrics?.costs.change || 0) <= 0 ? (
                  <TrendingDown className="w-4 h-4 text-blue-400 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                )}
                <span className={`text-sm ${(metrics?.costs.change || 0) <= 0 ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatPercent(Math.abs(metrics?.costs.change || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Lucro Líquido</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(metrics?.profit.current || 0)}
              </p>
              <div className="flex items-center mt-2">
                {(metrics?.profit.change || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-blue-600 mr-1" />
                )}
                <span className={`text-sm ${(metrics?.profit.change || 0) >= 0 ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatPercent(Math.abs(metrics?.profit.change || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <PieChartIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Margem (%)</p>
              <p className="text-2xl font-bold text-white">
                {formatPercent(metrics?.margin.current || 0)}
              </p>
              <div className="flex items-center mt-2">
                {(metrics?.margin.change || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-blue-600 mr-1" />
                )}
                <span className={`text-sm ${(metrics?.margin.change || 0) >= 0 ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatPercent(Math.abs(metrics?.margin.change || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tendência Mensal */}
        <Card className="glass-effect border-blue-200/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Tendência Mensal
            </CardTitle>
            <CardDescription className="text-blue-300">
              Comparação de receitas, custos e lucro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#93c5fd" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#93c5fd" 
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #64748b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#e2e8f0',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stackId="1"
                  stroke={CHART_COLORS.secondary}
                  fill={CHART_COLORS.secondary}
                  fillOpacity={0.6}
                  name="Receita"
                />
                <Area
                  type="monotone"
                  dataKey="custos"
                  stackId="2"
                  stroke={CHART_COLORS.danger}
                  fill={CHART_COLORS.danger}
                  fillOpacity={0.6}
                  name="Custos"
                />
                <Area
                  type="monotone"
                  dataKey="lucro"
                  stackId="3"
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.8}
                  name="Lucro"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição de Contratos */}
        <Card className="glass-effect border-blue-200/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center text-lg">
              <PieChartIcon className="w-5 h-5 mr-2" />
              Distribuição de Contratos
            </CardTitle>
            <CardDescription className="text-blue-300 text-sm">
              Participação por valor de receita
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #64748b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#e2e8f0',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                  formatter={(value: number, name) => [formatCurrency(value), name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={50}
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Performance por Categoria */}
        <Card className="glass-effect border-blue-200/20">
          <CardHeader>
            <CardTitle className="text-white">Performance por Categoria</CardTitle>
            <CardDescription className="text-blue-300">
              Orçado vs Realizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.categoryPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.3} />
                <XAxis 
                  dataKey="category" 
                  stroke="#93c5fd" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#93c5fd" 
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #64748b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#e2e8f0',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
                <Legend />
                <Bar 
                  dataKey="budget" 
                  fill={CHART_COLORS.accent} 
                  name="Orçado"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="actual" 
                  fill={CHART_COLORS.primary} 
                  name="Realizado"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução de KPIs */}
        <Card className="glass-effect border-blue-200/20">
          <CardHeader>
            <CardTitle className="text-white">Evolução de KPIs</CardTitle>
            <CardDescription className="text-blue-300">
              Indicadores de performance ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData?.kpiTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#93c5fd" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#93c5fd" 
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e3a8a',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="margem" 
                  stroke={CHART_COLORS.secondary} 
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
                  name="Margem"
                />
                <Line 
                  type="monotone" 
                  dataKey="roi" 
                  stroke={CHART_COLORS.accent} 
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.accent, strokeWidth: 2, r: 4 }}
                  name="ROI"
                />
                <Line 
                  type="monotone" 
                  dataKey="eficiencia" 
                  stroke={CHART_COLORS.info} 
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.info, strokeWidth: 2, r: 4 }}
                  name="Eficiência"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}