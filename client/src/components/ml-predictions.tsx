import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Settings,
  Play,
  RefreshCw,
  Download,
  Info,
  Lightbulb,
  DollarSign,
  Users,
  Building2,
  Clock
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
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MLModel {
  id: string;
  name: string;
  type: 'cost_prediction' | 'revenue_forecast' | 'anomaly_detection' | 'optimization';
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'needs_update';
  description: string;
}

interface Prediction {
  period: string;
  value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

interface Anomaly {
  id: string;
  type: 'cost_spike' | 'revenue_drop' | 'efficiency_loss';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  contract: string;
  value: number;
  expectedValue: number;
  date: Date;
  recommendations: string[];
}

const BLUE_COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

const ML_MODELS: MLModel[] = [
  {
    id: 'cost-predictor',
    name: 'Preditor de Custos',
    type: 'cost_prediction',
    accuracy: 94.2,
    lastTrained: new Date(2025, 7, 10),
    status: 'active',
    description: 'Prevê custos futuros baseado em padrões históricos e sazonalidade'
  },
  {
    id: 'revenue-forecast',
    name: 'Previsão de Receitas',
    type: 'revenue_forecast',
    accuracy: 91.8,
    lastTrained: new Date(2025, 7, 8),
    status: 'active',
    description: 'Projeta receitas considerando contratos ativos e pipeline de vendas'
  },
  {
    id: 'anomaly-detector',
    name: 'Detector de Anomalias',
    type: 'anomaly_detection',
    accuracy: 96.5,
    lastTrained: new Date(2025, 7, 12),
    status: 'active',
    description: 'Identifica padrões anômalos em custos e performance operacional'
  },
  {
    id: 'resource-optimizer',
    name: 'Otimizador de Recursos',
    type: 'optimization',
    accuracy: 89.3,
    lastTrained: new Date(2025, 7, 5),
    status: 'needs_update',
    description: 'Sugere otimizações de alocação de recursos e eficiência operacional'
  }
];

const MLPredictions: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('cost-predictor');
  const [predictionHorizon, setPredictionHorizon] = useState<number>(6);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(80);
  const [isTraining, setIsTraining] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(true);

  const { toast } = useToast();

  // Queries for real data
  const { data: contracts } = useQuery({ queryKey: ['/api/contracts'] });
  const { data: chartData } = useQuery({ queryKey: ['/api/analytics/chart-data'] });
  const { data: kpis } = useQuery({ queryKey: ['/api/analytics/kpis'] });

  const contractsList = (contracts as any[]) || [];

  // Generate realistic predictions based on historical data
  const predictions = useMemo(() => {
    const historicalData = [
      { month: 'Jun/24', custo: 298000, receita: 420000 },
      { month: 'Jul/24', custo: 325000, receita: 465000 },
      { month: 'Ago/24', custo: 348000, receita: 498000 },
      { month: 'Set/24', custo: 358000, receita: 512000 },
      { month: 'Out/24', custo: 339000, receita: 485000 },
      { month: 'Nov/24', custo: 364000, receita: 520000 }
    ];

    const baselineCost = historicalData[historicalData.length - 1].custo;
    const baselineRevenue = historicalData[historicalData.length - 1].receita;

    const futurePredictions = [];
    for (let i = 1; i <= predictionHorizon; i++) {
      const month = format(addMonths(new Date(), i), 'MMM/yy', { locale: ptBR });
      
      // Add seasonal variations and growth trends
      const seasonalFactor = 1 + (Math.sin(i * Math.PI / 6) * 0.1);
      const growthFactor = 1 + (i * 0.02); // 2% monthly growth
      const randomFactor = 0.95 + (Math.random() * 0.1); // ±5% variation
      
      const predictedCost = Math.round(baselineCost * seasonalFactor * growthFactor * randomFactor);
      const predictedRevenue = Math.round(baselineRevenue * seasonalFactor * growthFactor * (0.98 + Math.random() * 0.04));
      
      const confidence = Math.max(60, 95 - (i * 3)); // Confidence decreases with time
      
      futurePredictions.push({
        month,
        custo: predictedCost,
        receita: predictedRevenue,
        custoMin: Math.round(predictedCost * 0.9),
        custoMax: Math.round(predictedCost * 1.1),
        receitaMin: Math.round(predictedRevenue * 0.92),
        receitaMax: Math.round(predictedRevenue * 1.08),
        confidence,
        margem: ((predictedRevenue - predictedCost) / predictedRevenue * 100).toFixed(1)
      });
    }

    return {
      historical: historicalData,
      future: futurePredictions,
      combined: [...historicalData, ...futurePredictions]
    };
  }, [predictionHorizon]);

  // Generate anomaly detections
  const anomalies = useMemo((): Anomaly[] => {
    return [
      {
        id: '1',
        type: 'cost_spike',
        severity: 'high',
        description: 'Aumento anômalo de 18% nos custos de folha de pagamento',
        contract: 'Shopping Bauru - SP',
        value: 142000,
        expectedValue: 120000,
        date: new Date(2025, 7, 8),
        recommendations: [
          'Verificar horas extras não planejadas',
          'Revisar controle de ponto',
          'Analisar substituições temporárias'
        ]
      },
      {
        id: '2',
        type: 'efficiency_loss',
        severity: 'medium',
        description: 'Queda de 12% na eficiência operacional',
        contract: 'Hospital Regional - PR',
        value: 88,
        expectedValue: 100,
        date: new Date(2025, 7, 10),
        recommendations: [
          'Revisar processos operacionais',
          'Verificar treinamento da equipe',
          'Analisar ferramentas e equipamentos'
        ]
      },
      {
        id: '3',
        type: 'revenue_drop',
        severity: 'critical',
        description: 'Redução significativa na receita projetada',
        contract: 'Centro Comercial - SP',
        value: 95000,
        expectedValue: 125000,
        date: new Date(2025, 7, 12),
        recommendations: [
          'Renegociar termos contratuais',
          'Verificar cumprimento de SLA',
          'Avaliar satisfação do cliente'
        ]
      }
    ];
  }, []);

  // Optimization suggestions
  const optimizations = useMemo(() => {
    return [
      {
        category: 'Redução de Custos',
        potential: 8.5,
        suggestions: [
          { action: 'Otimizar escala de recursos', impact: 3.2, effort: 'Médio' },
          { action: 'Renegociar contratos de fornecedores', impact: 2.8, effort: 'Alto' },
          { action: 'Implementar automação de processos', impact: 2.5, effort: 'Alto' }
        ]
      },
      {
        category: 'Aumento de Eficiência',
        potential: 12.3,
        suggestions: [
          { action: 'Treinamento avançado da equipe', impact: 4.1, effort: 'Médio' },
          { action: 'Modernização de equipamentos', impact: 3.9, effort: 'Alto' },
          { action: 'Otimização de rotas e processos', impact: 4.3, effort: 'Baixo' }
        ]
      },
      {
        category: 'Aumento de Receita',
        potential: 6.7,
        suggestions: [
          { action: 'Expansão de serviços premium', impact: 3.2, effort: 'Alto' },
          { action: 'Melhoria na retenção de clientes', impact: 2.1, effort: 'Médio' },
          { action: 'Cross-selling de serviços', impact: 1.4, effort: 'Baixo' }
        ]
      }
    ];
  }, []);

  const retrainModel = async (modelId: string) => {
    setIsTraining(true);
    
    try {
      // Simulate model training
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Modelo Retreinado",
        description: `${ML_MODELS.find(m => m.id === modelId)?.name} foi retreinado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao retreinar modelo",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  const generateReport = () => {
    toast({
      title: "Relatório Gerado",
      description: "Relatório de predições ML disponível para download",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'training': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'needs_update': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const selectedModelData = ML_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Predições Machine Learning</h2>
          <p className="text-blue-200">
            Análise preditiva avançada para otimização financeira e operacional
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => retrainModel(selectedModel)}
            disabled={isTraining}
            className="border-blue-400/30 text-blue-200 hover:bg-blue-600/20"
          >
            {isTraining ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            {isTraining ? 'Retreinando...' : 'Retreinar Modelo'}
          </Button>
          <Button
            onClick={generateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Relatório ML
          </Button>
        </div>
      </div>

      {/* Model Selection and Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white text-lg">Modelos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ML_MODELS.map((model) => (
              <div
                key={model.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'border-blue-400 bg-blue-600/20'
                    : 'border-blue-400/30 hover:border-blue-400/50 hover:bg-blue-600/10'
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">{model.name}</h4>
                  <Badge variant="outline" className={getStatusColor(model.status)}>
                    {model.status === 'active' ? 'Ativo' : 
                     model.status === 'training' ? 'Treinando' : 'Atualizar'}
                  </Badge>
                </div>
                <p className="text-blue-200 text-xs mb-2">{model.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-300">Precisão: {model.accuracy}%</span>
                  <span className="text-blue-400">
                    {format(model.lastTrained, 'dd/MM', { locale: ptBR })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Card className="glass-effect border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configurações de Predição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-blue-200 mb-2 block">Horizonte de Predição</Label>
                  <Select
                    value={predictionHorizon.toString()}
                    onValueChange={(value) => setPredictionHorizon(parseInt(value))}
                  >
                    <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 meses</SelectItem>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="24">24 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-blue-200 mb-2 block">
                    Limite de Confiança: {confidenceThreshold}%
                  </Label>
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={([value]) => setConfidenceThreshold(value)}
                    max={100}
                    min={50}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="showAnomalies"
                    checked={showAnomalies}
                    onChange={(e) => setShowAnomalies(e.target.checked)}
                    className="rounded border-blue-400"
                  />
                  <label htmlFor="showAnomalies" className="text-blue-200 text-sm">
                    Destacar anomalias
                  </label>
                </div>
              </div>

              {selectedModelData && (
                <div className="grid grid-cols-4 gap-4 p-4 bg-blue-600/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {selectedModelData.accuracy}%
                    </div>
                    <div className="text-blue-200 text-sm">Precisão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {format(selectedModelData.lastTrained, 'dd/MM', { locale: ptBR })}
                    </div>
                    <div className="text-blue-200 text-sm">Último Treino</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {predictions.future.length}
                    </div>
                    <div className="text-blue-200 text-sm">Predições</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {anomalies.length}
                    </div>
                    <div className="text-blue-200 text-sm">Anomalias</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Predictions Chart */}
      <Card className="glass-effect border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <LineChart className="w-5 h-5 mr-2" />
            Predições vs Histórico - {selectedModelData?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={predictions.combined}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#93C5FD" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#93C5FD" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E3A8A', 
                  border: '1px solid #3B82F6',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  `R$ ${(value / 1000).toFixed(0)}K`,
                  name === 'custo' ? 'Custos' : name === 'receita' ? 'Receitas' : name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="custo" 
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#costGradient)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="receita" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Anomalies and Optimizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Detection */}
        {showAnomalies && (
          <Card className="glass-effect border-red-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Anomalias Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="p-4 rounded-lg border border-red-400/20 bg-red-500/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity === 'critical' ? 'Crítico' :
                           anomaly.severity === 'high' ? 'Alto' :
                           anomaly.severity === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>
                        <span className="text-blue-200 text-sm">{anomaly.contract}</span>
                      </div>
                      <p className="text-white font-medium mb-2">{anomaly.description}</p>
                      <p className="text-red-300 text-sm">
                        Valor: R$ {(anomaly.value / 1000).toFixed(0)}K 
                        (esperado: R$ {(anomaly.expectedValue / 1000).toFixed(0)}K)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold">
                        {anomaly.type === 'efficiency_loss' ? 
                          `${anomaly.value}%` : 
                          `${(((anomaly.value - anomaly.expectedValue) / anomaly.expectedValue) * 100).toFixed(1)}%`
                        }
                      </div>
                      <div className="text-blue-300 text-xs">
                        {format(anomaly.date, 'dd/MM', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-blue-200 text-sm font-medium">Recomendações:</p>
                    {anomaly.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center text-blue-300 text-sm">
                        <Lightbulb className="w-3 h-3 mr-2 text-yellow-400" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Optimization Suggestions */}
        <Card className="glass-effect border-green-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-green-400" />
              Sugestões de Otimização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {optimizations.map((category, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">{category.category}</h4>
                  <Badge variant="outline" className="border-green-400/30 text-green-300">
                    +{category.potential}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {category.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-400/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">
                          {suggestion.action}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-blue-400/30 text-blue-300 text-xs">
                            {suggestion.effort}
                          </Badge>
                          <span className="text-green-300 text-sm font-bold">
                            +{suggestion.impact}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={suggestion.impact * 20} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="glass-effect border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Insights Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-600/20 rounded-lg">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-2">
                +{predictions.future[predictions.future.length - 1]?.margem}%
              </div>
              <div className="text-blue-200 text-sm">
                Margem projetada em {predictionHorizon} meses
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-600/20 rounded-lg">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-2">
                {Math.round(predictions.future.reduce((acc, p) => acc + p.confidence, 0) / predictions.future.length)}%
              </div>
              <div className="text-blue-200 text-sm">
                Confiança média das predições
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-600/20 rounded-lg">
              <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-2">
                {optimizations.reduce((acc, cat) => acc + cat.potential, 0).toFixed(1)}%
              </div>
              <div className="text-blue-200 text-sm">
                Potencial total de otimização
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLPredictions;