import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Building2,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
  Settings,
  Mail,
  Printer
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
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'contracts' | 'performance';
  sections: string[];
  defaultFilters: any;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface ReportFilter {
  dateRange: {
    start: string;
    end: string;
  };
  contracts: string[];
  categories: string[];
  departments: string[];
  includeProjections: boolean;
  includeBenchmarks: boolean;
  detailLevel: 'summary' | 'detailed' | 'comprehensive';
}

const BLUE_COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

const REPORT_TEMPLATES: ReportConfig[] = [
  {
    id: 'dre-complete',
    name: 'DRE Completo',
    description: 'Demonstrativo do Resultado do Exercício detalhado com análise de margem',
    type: 'financial',
    sections: ['receitas', 'custos-diretos', 'custos-indiretos', 'margem-contribuicao', 'ebitda'],
    defaultFilters: {},
    frequency: 'monthly'
  },
  {
    id: 'contratos-performance',
    name: 'Performance de Contratos',
    description: 'Análise detalhada do desempenho por contrato com métricas de rentabilidade',
    type: 'contracts',
    sections: ['receita-contrato', 'custos-contrato', 'margem-contrato', 'aproveitamento'],
    defaultFilters: {},
    frequency: 'monthly'
  },
  {
    id: 'custos-analise',
    name: 'Análise de Custos',
    description: 'Breakdown detalhado de custos por categoria, centro de custo e projeto',
    type: 'operational',
    sections: ['custos-categoria', 'tendencias', 'variações', 'otimizacao'],
    defaultFilters: {},
    frequency: 'weekly'
  },
  {
    id: 'dashboard-executivo',
    name: 'Dashboard Executivo',
    description: 'Visão consolidada para alta gestão com KPIs principais e alertas',
    type: 'performance',
    sections: ['kpis-principais', 'tendencias', 'alertas', 'projecoes'],
    defaultFilters: {},
    frequency: 'weekly'
  },
  {
    id: 'fluxo-caixa',
    name: 'Fluxo de Caixa',
    description: 'Projeção e análise do fluxo de caixa por período',
    type: 'financial',
    sections: ['entradas', 'saidas', 'saldo-projetado', 'analise-risco'],
    defaultFilters: {},
    frequency: 'weekly'
  }
];

const AdvancedReports: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      start: format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    },
    contracts: [],
    categories: [],
    departments: [],
    includeProjections: true,
    includeBenchmarks: false,
    detailLevel: 'detailed'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const { toast } = useToast();

  // Queries for filter options
  const { data: contracts } = useQuery({ queryKey: ['/api/contracts'] });
  const { data: directCosts } = useQuery({ queryKey: ['/api/direct-costs'] });
  const { data: kpis } = useQuery({ queryKey: ['/api/analytics/kpis'] });
  const { data: chartData } = useQuery({ queryKey: ['/api/analytics/chart-data'] });

  const contractsList = (contracts as any[]) || [];
  const costsList = (directCosts as any[]) || [];

  // Dados processados para relatórios
  const reportData = useMemo(() => {
    const monthlyData = [
      { month: 'Jun/24', receita: 420000, custos: 298000, margem: 29.0, contratos: 18 },
      { month: 'Jul/24', receita: 465000, custos: 325000, margem: 30.1, contratos: 19 },
      { month: 'Ago/24', receita: 498000, custos: 348000, margem: 30.1, contratos: 22 },
      { month: 'Set/24', receita: 512000, custos: 358000, margem: 30.1, contratos: 23 },
      { month: 'Out/24', receita: 485000, custos: 339000, margem: 30.1, contratos: 22 },
      { month: 'Nov/24', receita: 520000, custos: 364000, margem: 30.0, contratos: 24 }
    ];

    const contractPerformance = contractsList.map((contract, index) => ({
      name: contract.name,
      receita: 80000 + Math.random() * 200000,
      custos: 50000 + Math.random() * 140000,
      margem: 25 + Math.random() * 15,
      aproveitamento: 85 + Math.random() * 15,
      status: Math.random() > 0.8 ? 'attention' : 'normal'
    }));

    const costBreakdown = [
      { categoria: 'Folha de Pagamento', valor: 1850000, percentual: 62, variacao: -2.3 },
      { categoria: 'Insumos Operacionais', valor: 580000, percentual: 19, variacao: 5.1 },
      { categoria: 'Infraestrutura', valor: 295000, percentual: 10, variacao: -1.2 },
      { categoria: 'Terceirizados', valor: 180000, percentual: 6, variacao: 8.4 },
      { categoria: 'Outros', valor: 95000, percentual: 3, variacao: -0.8 }
    ];

    return {
      monthly: monthlyData,
      contracts: contractPerformance,
      costs: costBreakdown,
      kpis: {
        receitaTotal: 2950000,
        custosTotal: 2032000,
        margemLiquida: 31.1,
        ebitda: 918000,
        contratosMes: 24,
        aproveitamentoMedio: 89.2
      }
    };
  }, [contractsList]);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simular geração do relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);
      
      setGeneratedReport({
        template,
        filters,
        data: reportData,
        generatedAt: new Date(),
        pages: Math.ceil(Math.random() * 15) + 5
      });
      
      setShowPreview(true);
      
      toast({
        title: "Relatório Gerado",
        description: `${template?.name} gerado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: "Exportando",
      description: `Preparando arquivo ${format.toUpperCase()}...`,
    });
    
    // Simular export
    setTimeout(() => {
      toast({
        title: "Download Iniciado",
        description: `Relatório ${generatedReport?.template?.name}.${format} baixado`,
      });
    }, 1500);
  };

  const scheduleReport = () => {
    toast({
      title: "Relatório Agendado",
      description: "Relatório será enviado automaticamente conforme configuração",
    });
  };

  if (showPreview && generatedReport) {
    return (
      <div className="space-y-6">
        {/* Header do Preview */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{generatedReport.template.name}</h2>
            <p className="text-blue-200">
              Gerado em {format(generatedReport.generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              onClick={() => exportReport('pdf')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={() => exportReport('excel')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="grid gap-6">
          {/* Executive Summary */}
          <Card className="glass-effect border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    R$ {(reportData.kpis.receitaTotal / 1000).toFixed(0)}K
                  </div>
                  <div className="text-blue-200 text-sm">Receita Total</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-300 text-xs">+12.5%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    R$ {(reportData.kpis.custosTotal / 1000).toFixed(0)}K
                  </div>
                  <div className="text-blue-200 text-sm">Custos Total</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingDown className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-300 text-xs">-3.2%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {reportData.kpis.margemLiquida.toFixed(1)}%
                  </div>
                  <div className="text-blue-200 text-sm">Margem Líquida</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-300 text-xs">+2.8%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="glass-effect border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-white text-lg">Evolução Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.monthly}>
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
                    <Area type="monotone" dataKey="custos" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-effect border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-white text-lg">Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reportData.costs}
                      dataKey="percentual"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({categoria, percentual}) => `${categoria}: ${percentual}%`}
                    >
                      {reportData.costs.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BLUE_COLORS[index % BLUE_COLORS.length]} />
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

          {/* Detailed Tables */}
          <Card className="glass-effect border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-white">Performance por Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-400/20">
                      <th className="text-left py-3 px-4 text-blue-200 font-medium">Contrato</th>
                      <th className="text-right py-3 px-4 text-blue-200 font-medium">Receita</th>
                      <th className="text-right py-3 px-4 text-blue-200 font-medium">Custos</th>
                      <th className="text-right py-3 px-4 text-blue-200 font-medium">Margem</th>
                      <th className="text-right py-3 px-4 text-blue-200 font-medium">Aproveitamento</th>
                      <th className="text-center py-3 px-4 text-blue-200 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.contracts.slice(0, 8).map((contract, index) => (
                      <tr key={index} className="border-b border-blue-400/10 hover:bg-blue-600/10">
                        <td className="py-3 px-4 text-white font-medium">{contract.name}</td>
                        <td className="py-3 px-4 text-blue-200 text-right">
                          R$ {(contract.receita / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4 text-blue-200 text-right">
                          R$ {(contract.custos / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${contract.margem > 25 ? 'text-green-300' : contract.margem > 15 ? 'text-yellow-300' : 'text-red-300'}`}>
                            {contract.margem.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${contract.aproveitamento > 90 ? 'text-green-300' : contract.aproveitamento > 80 ? 'text-yellow-300' : 'text-red-300'}`}>
                            {contract.aproveitamento.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={contract.status === 'attention' ? 'destructive' : 'default'}>
                            {contract.status === 'attention' ? 'Atenção' : 'Normal'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-blue-200 text-sm">
              Relatório de {generatedReport.pages} páginas • {filters.detailLevel === 'comprehensive' ? 'Detalhado' : 'Resumido'}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={scheduleReport}
                className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
              >
                <Mail className="w-4 h-4 mr-2" />
                Agendar Envio
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Relatórios Avançados</h2>
        <p className="text-blue-200">
          Gere relatórios personalizados com análises detalhadas e opções de exportação
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card className="glass-effect border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-white">Modelos de Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {REPORT_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-400 bg-blue-600/20'
                      : 'border-blue-400/30 hover:border-blue-400/50 hover:bg-blue-600/10'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{template.name}</h4>
                    <Badge variant="outline" className="border-blue-400/30 text-blue-300 text-xs">
                      {template.frequency}
                    </Badge>
                  </div>
                  <p className="text-blue-200 text-sm">{template.description}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="w-3 h-3 text-blue-400 mr-1" />
                    <span className="text-blue-300 text-xs">
                      {template.sections.length} seções
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-2">
          <Card className="glass-effect border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Configuração do Relatório
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-200">Data Inicial</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="bg-blue-600/30 border-blue-400/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">Data Final</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="bg-blue-600/30 border-blue-400/30 text-white"
                  />
                </div>
              </div>

              {/* Contract Selection */}
              <div>
                <Label className="text-blue-200 mb-2 block">Contratos</Label>
                <Select>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Selecionar contratos..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os contratos</SelectItem>
                    {contractsList.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Detail Level */}
              <div>
                <Label className="text-blue-200 mb-2 block">Nível de Detalhamento</Label>
                <Select
                  value={filters.detailLevel}
                  onValueChange={(value: any) => setFilters({...filters, detailLevel: value})}
                >
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Resumido</SelectItem>
                    <SelectItem value="detailed">Detalhado</SelectItem>
                    <SelectItem value="comprehensive">Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-blue-200">Opções Adicionais</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="projections"
                      checked={filters.includeProjections}
                      onCheckedChange={(checked) => setFilters({
                        ...filters,
                        includeProjections: checked as boolean
                      })}
                    />
                    <label htmlFor="projections" className="text-blue-200 text-sm">
                      Incluir projeções futuras
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="benchmarks"
                      checked={filters.includeBenchmarks}
                      onCheckedChange={(checked) => setFilters({
                        ...filters,
                        includeBenchmarks: checked as boolean
                      })}
                    />
                    <label htmlFor="benchmarks" className="text-blue-200 text-sm">
                      Incluir benchmarks do setor
                    </label>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button
                  onClick={generateReport}
                  disabled={!selectedTemplate || isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Gerando Relatório...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;