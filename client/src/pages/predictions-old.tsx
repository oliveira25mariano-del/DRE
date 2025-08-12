import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, BarChart3, AlertTriangle, Settings, RefreshCw } from "lucide-react";

export default function Predictions() {
  const [selectedContract, setSelectedContract] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [selectedPeriod, setSelectedPeriod] = useState("6");

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ["/api/predictions"],
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const filteredPredictions = predictions.filter((prediction: any) => {
    const matchesContract = !selectedContract || prediction.contractId === selectedContract;
    const matchesMetric = prediction.metric === selectedMetric;
    
    return matchesContract && matchesMetric;
  });

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(numValue);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500/20 text-green-300";
    if (confidence >= 70) return "bg-yellow-500/20 text-yellow-300";
    return "bg-red-500/20 text-red-300";
  };

  const mockMLMetrics = {
    totalPredictedRevenue: 3200000,
    totalPredictedCosts: 2100000,
    predictedMargin: 34.8,
    accuracyRate: 92.5,
    modelsCount: 4,
    lastTraining: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Receita Prevista</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(mockMLMetrics.totalPredictedRevenue)}
                </p>
                <p className="text-xs text-emerald-400 mt-1">+15.2% vs atual</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <TrendingUp className="text-blue-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Custos Previstos</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(mockMLMetrics.totalPredictedCosts)}
                </p>
                <p className="text-xs text-amber-400 mt-1">+8.7% vs atual</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <BarChart3 className="text-emerald-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Margem Prevista</p>
                <p className="text-2xl font-bold text-white">{mockMLMetrics.predictedMargin}%</p>
                <p className="text-xs text-emerald-400 mt-1">+2.2% vs atual</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-full">
                <Brain className="text-purple-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Acurácia ML</p>
                <p className="text-2xl font-bold text-white">{mockMLMetrics.accuracyRate}%</p>
                <p className="text-xs text-emerald-400 mt-1">{mockMLMetrics.modelsCount} modelos ativos</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <Brain className="text-emerald-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect border-blue-200/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Previsões com Machine Learning
              </CardTitle>
              <p className="text-sm text-blue-200">
                Análise preditiva baseada em dados históricos e tendências de mercado
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retreinar Modelos
              </Button>
              <Button variant="outline" className="border-blue-400/30 text-white hover:bg-blue-600/30">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="predictions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-600/30">
              <TabsTrigger value="predictions" className="data-[state=active]:bg-blue-600">
                Previsões
              </TabsTrigger>
              <TabsTrigger value="models" className="data-[state=active]:bg-blue-600">
                Modelos
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">
                Análise
              </TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedContract} onValueChange={setSelectedContract}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Todos os contratos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os contratos</SelectItem>
                    {contracts.map((contract: any) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="costs">Custos</SelectItem>
                    <SelectItem value="margin">Margem</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Próximos 3 meses</SelectItem>
                    <SelectItem value="6">Próximos 6 meses</SelectItem>
                    <SelectItem value="12">Próximo ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prediction Chart */}
              <Card className="glass-effect border-blue-200/20">
                <CardHeader>
                  <CardTitle className="text-white text-base">
                    Gráfico de Tendências - {selectedMetric === 'revenue' ? 'Receita' : selectedMetric === 'costs' ? 'Custos' : 'Margem'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-blue-400/10 rounded-lg flex items-center justify-center">
                    <div className="text-center text-blue-200">
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Gráfico de Previsões ML</p>
                      <p className="text-xs opacity-70">Tendências e intervalos de confiança</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictions Table */}
              <div className="bg-blue-400/10 rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-blue-200 mt-2">Carregando previsões...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-400/20">
                      <thead className="bg-blue-500/20">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Período
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Contrato
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Valor Previsto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Confiança
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Modelo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Tendência
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-blue-400/5 divide-y divide-blue-400/10">
                        {/* Mock prediction data since we don't have real predictions */}
                        {Array.from({ length: 6 }, (_, i) => {
                          const month = new Date();
                          month.setMonth(month.getMonth() + i + 1);
                          
                          return (
                            <tr key={i} className="hover:bg-blue-400/10 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                                {selectedContract ? contracts.find((c: any) => c.id === selectedContract)?.name : 'Todos'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                {selectedMetric === 'revenue' 
                                  ? formatCurrency(2800000 + (Math.random() * 400000)) 
                                  : selectedMetric === 'costs'
                                  ? formatCurrency(1900000 + (Math.random() * 300000))
                                  : `${(30 + Math.random() * 10).toFixed(1)}%`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getConfidenceColor(85 + Math.random() * 15)}>
                                  {(85 + Math.random() * 15).toFixed(1)}%
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                                Linear Regression
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                                  <span className="text-emerald-400 text-sm">↗ Crescimento</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Linear Regression", accuracy: 92.5, status: "active", lastTrained: "2024-01-15" },
                  { name: "Random Forest", accuracy: 89.3, status: "active", lastTrained: "2024-01-10" },
                  { name: "Neural Network", accuracy: 87.8, status: "training", lastTrained: "2024-01-12" },
                  { name: "ARIMA Time Series", accuracy: 85.2, status: "active", lastTrained: "2024-01-08" },
                ].map((model, index) => (
                  <Card key={index} className="glass-effect border-blue-200/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-white font-medium">{model.name}</h3>
                          <p className="text-blue-200 text-sm">Acurácia: {model.accuracy}%</p>
                        </div>
                        <Badge className={
                          model.status === 'active' ? "bg-green-500/20 text-green-300" :
                          model.status === 'training' ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-red-500/20 text-red-300"
                        }>
                          {model.status === 'active' ? 'Ativo' : 
                           model.status === 'training' ? 'Treinando' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-200">Último treino:</span>
                          <span className="text-white">{model.lastTrained}</span>
                        </div>
                        <div className="w-full bg-blue-600/30 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${model.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-effect border-blue-200/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Análise de Padrões Sazonais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-blue-400/10 rounded-lg flex items-center justify-center">
                      <div className="text-center text-blue-200">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Gráfico de Sazonalidade</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-blue-200/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Alertas Preditivos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-red-500/20 rounded-lg border-l-4 border-red-400">
                        <AlertTriangle className="text-red-400 w-5 h-5 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-300">Risco de Redução de Margem</p>
                          <p className="text-xs text-red-400">Previsão indica queda de 5% na margem no Q2</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-yellow-500/20 rounded-lg border-l-4 border-yellow-400">
                        <AlertTriangle className="text-yellow-400 w-5 h-5 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-300">Aumento de Custos Operacionais</p>
                          <p className="text-xs text-yellow-400">Tendência de alta nos próximos 3 meses</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-emerald-500/20 rounded-lg border-l-4 border-emerald-400">
                        <TrendingUp className="text-emerald-400 w-5 h-5 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-emerald-300">Oportunidade de Crescimento</p>
                          <p className="text-xs text-emerald-400">Potencial aumento de 15% na receita</p>
                        </div>
                      </div>
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
