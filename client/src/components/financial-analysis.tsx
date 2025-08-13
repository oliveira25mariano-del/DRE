import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  Building2,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Percent,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
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
  Cell
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContractFinancialData {
  contractId: string;
  contractName: string;
  month: string;
  year: number;
  budgetedRevenue: number;
  actualRevenue: number;
  budgetedCosts: number;
  actualCosts: number;
  margin: number;
  marginPercentage: number;
  variance: number;
  variancePercentage: number;
  status: 'above_budget' | 'on_budget' | 'below_budget' | 'at_risk';
}

interface FinancialSummary {
  period: string;
  totalBudgetedRevenue: number;
  totalActualRevenue: number;
  totalBudgetedCosts: number;
  totalActualCosts: number;
  overallMargin: number;
  contractsCount: number;
  performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
}

// Dados de exemplo para demonstração
const generateContractData = (): ContractFinancialData[] => {
  const contracts = [
    { id: 'CTR001', name: 'Contrato Opus Digital' },
    { id: 'CTR002', name: 'Contrato TechSolutions' },
    { id: 'CTR003', name: 'Contrato DataCorp' },
    { id: 'CTR004', name: 'Contrato CloudServices' },
    { id: 'CTR005', name: 'Contrato FinTech Pro' }
  ];

  const months: Array<{month: string, year: number, fullDate: Date}> = [];
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    months.push({
      month: format(date, 'MMM', { locale: ptBR }),
      year: date.getFullYear(),
      fullDate: date
    });
  }

  const data: ContractFinancialData[] = [];
  
  contracts.forEach(contract => {
    months.forEach(monthData => {
      const baseRevenue = 80000 + Math.random() * 40000;
      const baseCosts = baseRevenue * (0.6 + Math.random() * 0.2);
      
      const budgetedRevenue = baseRevenue;
      const actualRevenue = baseRevenue * (0.85 + Math.random() * 0.3);
      const budgetedCosts = baseCosts;
      const actualCosts = baseCosts * (0.9 + Math.random() * 0.2);
      
      const margin = actualRevenue - actualCosts;
      const marginPercentage = (margin / actualRevenue) * 100;
      const variance = actualRevenue - budgetedRevenue;
      const variancePercentage = (variance / budgetedRevenue) * 100;
      
      let status: 'above_budget' | 'on_budget' | 'below_budget' | 'at_risk';
      if (variancePercentage > 5) status = 'above_budget';
      else if (variancePercentage >= -5) status = 'on_budget';
      else if (variancePercentage >= -15) status = 'below_budget';
      else status = 'at_risk';

      data.push({
        contractId: contract.id,
        contractName: contract.name,
        month: monthData.month,
        year: monthData.year,
        budgetedRevenue,
        actualRevenue,
        budgetedCosts,
        actualCosts,
        margin,
        marginPercentage,
        variance,
        variancePercentage,
        status
      });
    });
  });

  return data;
};

const CHART_COLORS = {
  budgeted: '#1E40AF',     // Azul escuro
  actual: '#3B82F6',       // Azul médio
  margin: '#60A5FA',       // Azul claro
  variance: '#93C5FD',     // Azul muito claro
  negative: '#1E3A8A'      // Azul navy
};

export default function FinancialAnalysis() {
  const [selectedContract, setSelectedContract] = useState<string>('all');
  const [viewPeriod, setViewPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [analysisType, setAnalysisType] = useState<'revenue' | 'costs' | 'margin' | 'variance'>('revenue');
  const { toast } = useToast();

  // Dados simulados - em produção viria da API
  const contractData = useMemo(() => generateContractData(), []);
  
  const contracts = useMemo(() => {
    const uniqueContracts = Array.from(new Set(contractData.map(d => d.contractId)))
      .map(id => contractData.find(d => d.contractId === id)!)
      .map(d => ({ id: d.contractId, name: d.contractName }));
    return uniqueContracts;
  }, [contractData]);

  const filteredData = useMemo(() => {
    if (selectedContract === 'all') return contractData;
    return contractData.filter(d => d.contractId === selectedContract);
  }, [contractData, selectedContract]);

  const monthlyAggregated = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      const key = `${item.month}-${item.year}`;
      if (!acc[key]) {
        acc[key] = {
          period: key,
          month: item.month,
          year: item.year,
          totalBudgetedRevenue: 0,
          totalActualRevenue: 0,
          totalBudgetedCosts: 0,
          totalActualCosts: 0,
          overallMargin: 0,
          contractsCount: 0,
          items: []
        };
      }
      acc[key].totalBudgetedRevenue += item.budgetedRevenue;
      acc[key].totalActualRevenue += item.actualRevenue;
      acc[key].totalBudgetedCosts += item.budgetedCosts;
      acc[key].totalActualCosts += item.actualCosts;
      acc[key].contractsCount += 1;
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      overallMargin: item.totalActualRevenue - item.totalActualCosts,
      marginPercentage: ((item.totalActualRevenue - item.totalActualCosts) / item.totalActualRevenue) * 100,
      variance: item.totalActualRevenue - item.totalBudgetedRevenue,
      variancePercentage: ((item.totalActualRevenue - item.totalBudgetedRevenue) / item.totalBudgetedRevenue) * 100
    }));
  }, [filteredData]);

  const cumulativeData = useMemo(() => {
    let cumulativeBudgeted = 0;
    let cumulativeActual = 0;
    let cumulativeCosts = 0;

    return monthlyAggregated.map(item => {
      cumulativeBudgeted += item.totalBudgetedRevenue;
      cumulativeActual += item.totalActualRevenue;
      cumulativeCosts += item.totalActualCosts;

      return {
        ...item,
        cumulativeBudgetedRevenue: cumulativeBudgeted,
        cumulativeActualRevenue: cumulativeActual,
        cumulativeCosts: cumulativeCosts,
        cumulativeMargin: cumulativeActual - cumulativeCosts,
        cumulativeMarginPercentage: ((cumulativeActual - cumulativeCosts) / cumulativeActual) * 100
      };
    });
  }, [monthlyAggregated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'above_budget': return 'bg-green-500';
      case 'on_budget': return 'bg-blue-500';
      case 'below_budget': return 'bg-yellow-500';
      case 'at_risk': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'above_budget': return 'Acima do Orçamento';
      case 'on_budget': return 'No Orçamento';
      case 'below_budget': return 'Abaixo do Orçamento';
      case 'at_risk': return 'Em Risco';
      default: return 'Indefinido';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Análise Financeira por Contrato</h1>
          <p className="text-blue-200">Visão mensal, acumulada e anual com comparativo orçado vs. realizado</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={selectedContract} onValueChange={setSelectedContract}>
            <SelectTrigger className="w-48 bg-blue-600/20 border-blue-400/30 text-white">
              <SelectValue placeholder="Selecionar Contrato" />
            </SelectTrigger>
            <SelectContent className="bg-blue-900 border-blue-600">
              <SelectItem value="all">Todos os Contratos</SelectItem>
              {contracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={viewPeriod} onValueChange={(value: any) => setViewPeriod(value)}>
            <SelectTrigger className="w-40 bg-blue-600/20 border-blue-400/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-blue-900 border-blue-600">
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
            <SelectTrigger className="w-40 bg-blue-600/20 border-blue-400/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-blue-900 border-blue-600">
              <SelectItem value="revenue">Receita</SelectItem>
              <SelectItem value="costs">Custos</SelectItem>
              <SelectItem value="margin">Margem</SelectItem>
              <SelectItem value="variance">Variação</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cumulativeData.length > 0 && (() => {
          const latest = cumulativeData[cumulativeData.length - 1];
          const previous = cumulativeData[cumulativeData.length - 2];
          
          return [
            {
              title: 'Receita Acumulada',
              value: formatCurrency(latest.cumulativeActualRevenue),
              change: previous ? ((latest.cumulativeActualRevenue - previous.cumulativeActualRevenue) / previous.cumulativeActualRevenue * 100) : 0,
              icon: DollarSign,
              color: 'text-green-400'
            },
            {
              title: 'Margem Acumulada',
              value: formatCurrency(latest.cumulativeMargin),
              change: latest.cumulativeMarginPercentage,
              icon: Target,
              color: 'text-blue-400'
            },
            {
              title: 'Variação vs Orçamento',
              value: formatPercentage((latest.cumulativeActualRevenue - latest.cumulativeBudgetedRevenue) / latest.cumulativeBudgetedRevenue * 100),
              change: 0,
              icon: TrendingUp,
              color: 'text-purple-400'
            },
            {
              title: 'Contratos Ativos',
              value: contracts.length.toString(),
              change: 0,
              icon: Building2,
              color: 'text-orange-400'
            }
          ].map((kpi, index) => (
            <Card key={index} className="glass-effect border-blue-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">{kpi.title}</p>
                    <p className="text-white text-xl font-semibold mt-1">{kpi.value}</p>
                    {kpi.change !== 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {kpi.change > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-xs ${kpi.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(Math.abs(kpi.change))}
                        </span>
                      </div>
                    )}
                  </div>
                  <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          ));
        })()}
      </div>

      {/* Análise Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Comparativo Mensal */}
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Comparativo Mensal: Orçado vs Realizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyAggregated}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="period" 
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#8B5CF6"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Margem (%)') {
                      return [`${value.toFixed(1)}%`, name];
                    }
                    return [formatCurrency(value), name];
                  }}
                />
                <Bar yAxisId="left" dataKey="totalBudgetedRevenue" fill={CHART_COLORS.budgeted} name="Orçado" opacity={0.7} />
                <Bar yAxisId="left" dataKey="totalActualRevenue" fill={CHART_COLORS.actual} name="Realizado" />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="marginPercentage" 
                  stroke={CHART_COLORS.margin} 
                  strokeWidth={2}
                  name="Margem (%)"
                  dot={{ fill: CHART_COLORS.margin, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico Acumulado */}
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-400" />
              Evolução Acumulada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="period" 
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#94A3B8"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeActualRevenue" 
                  stackId="1"
                  stroke={CHART_COLORS.actual} 
                  fill={CHART_COLORS.actual}
                  fillOpacity={0.6}
                  name="Receita Acumulada"
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeCosts" 
                  stackId="2"
                  stroke={CHART_COLORS.budgeted} 
                  fill={CHART_COLORS.budgeted}
                  fillOpacity={0.6}
                  name="Custos Acumulados"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada por Contrato */}
      <Card className="glass-effect border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Desempenho Detalhado por Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-600/20">
              <TabsTrigger value="current" className="text-blue-200">Mês Atual</TabsTrigger>
              <TabsTrigger value="accumulated" className="text-blue-200">Acumulado</TabsTrigger>
              <TabsTrigger value="trends" className="text-blue-200">Tendências</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-400/30">
                      <th className="text-left p-3 text-blue-200 font-medium">Contrato</th>
                      <th className="text-right p-3 text-blue-200 font-medium">Orçado</th>
                      <th className="text-right p-3 text-blue-200 font-medium">Realizado</th>
                      <th className="text-right p-3 text-blue-200 font-medium">Margem</th>
                      <th className="text-right p-3 text-blue-200 font-medium">Variação</th>
                      <th className="text-center p-3 text-blue-200 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData
                      .filter(item => {
                        const currentMonth = format(new Date(), 'MMM', { locale: ptBR });
                        return item.month === currentMonth;
                      })
                      .slice(0, 5)
                      .map((item, index) => (
                      <tr key={index} className="border-b border-blue-400/10 hover:bg-blue-600/10">
                        <td className="p-3 text-white font-medium">{item.contractName}</td>
                        <td className="p-3 text-right text-blue-200">{formatCurrency(item.budgetedRevenue)}</td>
                        <td className="p-3 text-right text-white">{formatCurrency(item.actualRevenue)}</td>
                        <td className="p-3 text-right">
                          <div className="text-white">{formatCurrency(item.margin)}</div>
                          <div className={`text-xs ${item.marginPercentage > 20 ? 'text-green-400' : item.marginPercentage > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {formatPercentage(item.marginPercentage)}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className={`${item.variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(item.variance)}
                          </div>
                          <div className={`text-xs ${item.variancePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercentage(item.variancePercentage)}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={`${getStatusColor(item.status)} text-white`}>
                            {getStatusLabel(item.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="accumulated" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cumulativeData.slice(-3).map((period, index) => (
                  <Card key={index} className="bg-blue-600/10 border-blue-400/20">
                    <CardContent className="p-4">
                      <div className="text-blue-200 text-sm mb-2">{period.period}</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white text-sm">Receita:</span>
                          <span className="text-green-400 font-medium">
                            {formatCurrency(period.cumulativeActualRevenue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white text-sm">Margem:</span>
                          <span className="text-blue-400 font-medium">
                            {formatPercentage(period.cumulativeMarginPercentage)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.max(0, Math.min(100, period.cumulativeMarginPercentage))} 
                          className="h-2 bg-blue-600/20" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-blue-600/10 border-blue-400/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Indicadores de Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Eficiência Orçamentária', value: 87, color: 'bg-green-500' },
                        { name: 'Consistência de Margem', value: 73, color: 'bg-blue-500' },
                        { name: 'Previsibilidade', value: 91, color: 'bg-purple-500' },
                        { name: 'Risco Financeiro', value: 23, color: 'bg-red-500' }
                      ].map((indicator) => (
                        <div key={indicator.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm">{indicator.name}</span>
                            <span className="text-blue-200 text-sm">{indicator.value}%</span>
                          </div>
                          <Progress 
                            value={indicator.value} 
                            className={`h-2 bg-blue-600/20`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-600/10 border-blue-400/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Alertas e Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          type: 'warning',
                          message: 'Contrato DataCorp está 15% abaixo do orçado este mês',
                          action: 'Revisar estratégia de execução'
                        },
                        {
                          type: 'success',
                          message: 'Contrato Opus Digital superou meta em 23%',
                          action: 'Analisar fatores de sucesso'
                        },
                        {
                          type: 'info',
                          message: 'Margem média melhorou 5% no trimestre',
                          action: 'Manter estratégias atuais'
                        }
                      ].map((alert, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-600/10">
                          {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />}
                          {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />}
                          {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-400 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-white text-sm">{alert.message}</p>
                            <p className="text-blue-200 text-xs mt-1">{alert.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}