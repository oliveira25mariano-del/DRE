import KPICards from "@/components/kpi-cards";
import DRETable from "@/components/dre-table";
import RealtimeCharts from "@/components/real-time-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, PieChart, Brain, Bell, CheckCircle, AlertTriangle, Clock, Info, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ["/api/predictions"],
  });

  const criticalAlerts = alerts.filter((alert: any) => alert.severity === "critical");
  const recentAlerts = alerts.slice(0, 4);

  return (
    <div className="space-y-8">
      <KPICards />

      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-blue-600/30">
          <TabsTrigger value="realtime" className="data-[state=active]:bg-blue-600">
            <Activity className="w-4 h-4 mr-2" />
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Visão Geral</TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-blue-600">Contratos</TabsTrigger>
          <TabsTrigger value="glosas" className="data-[state=active]:bg-blue-600">Glosas</TabsTrigger>
          <TabsTrigger value="moe" className="data-[state=active]:bg-blue-600">MOE</TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-blue-600">Previsões</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <RealtimeCharts />
        </TabsContent>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-effect border-blue-200/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Receitas vs Custos - Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-blue-400/10 rounded-lg flex items-center justify-center">
                  <div className="text-center text-blue-200">
                    <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Gráfico de Receitas vs Custos</p>
                    <p className="text-xs opacity-70">Implementar com Recharts</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-blue-200">Receitas</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-blue-200">Custos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-blue-200/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Distribuição por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-blue-400/10 rounded-lg flex items-center justify-center">
                  <div className="text-center text-blue-200">
                    <PieChart className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Gráfico de Pizza - Categorias</p>
                    <p className="text-xs opacity-70">Distribuição de contratos por categoria</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-blue-200">Desenvolvimento</span>
                    </div>
                    <span className="text-sm font-medium text-white">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm text-blue-200">Consultoria</span>
                    </div>
                    <span className="text-sm font-medium text-white">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-sm text-blue-200">Suporte</span>
                    </div>
                    <span className="text-sm font-medium text-white">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glass-effect border-blue-200/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Brain className="text-purple-400 w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Previsões Machine Learning</CardTitle>
                        <p className="text-sm text-blue-200">Projeções para os próximos 6 meses</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-xs font-medium">
                        92% Acurácia
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-500/20 rounded-lg p-4">
                      <div className="text-sm text-blue-300 font-medium">Receita Prevista</div>
                      <div className="text-xl font-bold text-blue-100">R$ 3.2M</div>
                      <div className="text-xs text-blue-300 flex items-center mt-1">
                        <span>+15.2%</span>
                      </div>
                    </div>
                    <div className="bg-emerald-500/20 rounded-lg p-4">
                      <div className="text-sm text-emerald-300 font-medium">Custos Previstos</div>
                      <div className="text-xl font-bold text-emerald-100">R$ 2.1M</div>
                      <div className="text-xs text-emerald-300 flex items-center mt-1">
                        <span>+8.7%</span>
                      </div>
                    </div>
                    <div className="bg-purple-500/20 rounded-lg p-4">
                      <div className="text-sm text-purple-300 font-medium">Margem Prevista</div>
                      <div className="text-xl font-bold text-purple-100">34.8%</div>
                      <div className="text-xs text-purple-300 flex items-center mt-1">
                        <span>+2.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-48 bg-blue-400/10 rounded-lg flex items-center justify-center">
                    <div className="text-center text-blue-200">
                      <Brain className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Gráfico de Previsões ML</p>
                      <p className="text-xs opacity-70">Tendências e intervalos de confiança</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-effect border-blue-200/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="text-amber-400 w-5 h-5" />
                    <CardTitle className="text-white">Alertas</CardTitle>
                  </div>
                  <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                    {criticalAlerts.length} Críticos
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.length === 0 ? (
                    <div className="text-center py-8 text-blue-200">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum alerta no momento</p>
                    </div>
                  ) : (
                    recentAlerts.map((alert: any) => (
                      <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${
                        alert.severity === 'critical' 
                          ? 'bg-red-500/20 border-red-400' 
                          : alert.severity === 'warning'
                          ? 'bg-amber-500/20 border-amber-400'
                          : alert.severity === 'info'
                          ? 'bg-blue-500/20 border-blue-400'
                          : 'bg-emerald-500/20 border-emerald-400'
                      }`}>
                        {alert.severity === 'critical' && <AlertTriangle className="text-red-400 w-5 h-5 mt-0.5" />}
                        {alert.severity === 'warning' && <Clock className="text-amber-400 w-5 h-5 mt-0.5" />}
                        {alert.severity === 'info' && <Info className="text-blue-400 w-5 h-5 mt-0.5" />}
                        {alert.severity === 'success' && <CheckCircle className="text-emerald-400 w-5 h-5 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{alert.title}</p>
                          <p className="text-xs text-blue-200 mt-1">{alert.message}</p>
                          <p className="text-xs text-blue-300 mt-1">
                            {new Date(alert.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {alerts.length > 4 && (
                  <button className="w-full mt-4 text-sm text-blue-300 hover:text-blue-100 font-medium">
                    Ver todos os alertas
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts">
          <Card className="glass-effect border-blue-200/20">
            <CardContent className="p-6">
              <div className="text-center py-8 text-blue-200">
                <p className="text-sm">Conteúdo da aba Contratos será carregado aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="glosas">
          <Card className="glass-effect border-blue-200/20">
            <CardContent className="p-6">
              <div className="text-center py-8 text-blue-200">
                <p className="text-sm">Conteúdo da aba Glosas será carregado aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moe">
          <Card className="glass-effect border-blue-200/20">
            <CardContent className="p-6">
              <div className="text-center py-8 text-blue-200">
                <p className="text-sm">Conteúdo da aba MOE será carregado aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card className="glass-effect border-blue-200/20">
            <CardContent className="p-6">
              <div className="text-center py-8 text-blue-200">
                <p className="text-sm">Conteúdo da aba Previsões será carregado aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DRETable />
    </div>
  );
}
