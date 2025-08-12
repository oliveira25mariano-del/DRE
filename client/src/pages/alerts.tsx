import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Bell, CheckCircle, AlertTriangle, Clock, Info, Settings, Volume2, VolumeX } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAlertSchema, type Alert, type InsertAlert } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Alerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAlert) => {
      return await apiRequest("POST", "/api/alerts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Alerta criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar alerta: " + error.message,
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PUT", `/api/alerts/${id}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Sucesso",
        description: "Alerta marcado como lido!",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PUT", `/api/alerts/${id}`, { resolved: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Sucesso",
        description: "Alerta resolvido!",
      });
    },
  });

  const form = useForm<InsertAlert>({
    resolver: zodResolver(insertAlertSchema),
    defaultValues: {
      type: "manual",
      severity: "info",
      title: "",
      message: "",
      read: false,
      resolved: false,
    },
  });

  const filteredAlerts = alerts.filter((alert: Alert) => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = !selectedSeverity || alert.severity === selectedSeverity;
    const matchesStatus = !selectedStatus || 
      (selectedStatus === "read" && alert.read) ||
      (selectedStatus === "unread" && !alert.read) ||
      (selectedStatus === "resolved" && alert.resolved) ||
      (selectedStatus === "unresolved" && !alert.resolved);
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-300";
      case "warning": return "bg-yellow-500/20 text-yellow-300";
      case "info": return "bg-blue-500/20 text-blue-300";
      case "success": return "bg-green-500/20 text-green-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="w-5 h-5" />;
      case "warning": return <Clock className="w-5 h-5" />;
      case "info": return <Info className="w-5 h-5" />;
      case "success": return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const criticalAlerts = filteredAlerts.filter((alert: Alert) => alert.severity === "critical" && !alert.resolved);
  const unreadAlerts = filteredAlerts.filter((alert: Alert) => !alert.read);
  const resolvedAlerts = filteredAlerts.filter((alert: Alert) => alert.resolved);

  const onSubmit = (data: InsertAlert) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <AlertTriangle className="text-red-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Alertas Críticos</p>
              <p className="text-2xl font-bold text-white">{criticalAlerts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Bell className="text-yellow-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Não Lidos</p>
              <p className="text-2xl font-bold text-white">{unreadAlerts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <CheckCircle className="text-green-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Resolvidos</p>
              <p className="text-2xl font-bold text-white">{resolvedAlerts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Bell className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Total Alertas</p>
              <p className="text-2xl font-bold text-white">{filteredAlerts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect border-blue-200/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Central de Alertas
              </CardTitle>
              <p className="text-sm text-blue-200">
                Monitoramento em tempo real de métricas críticas e notificações
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Alerta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-blue-bg border-blue-400/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">Criar Novo Alerta</DialogTitle>
                    <DialogDescription className="text-blue-200">
                      Crie um novo alerta manual para monitoramento específico.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="severity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Severidade</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                                    <SelectValue placeholder="Selecione a severidade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="info">Info</SelectItem>
                                  <SelectItem value="warning">Aviso</SelectItem>
                                  <SelectItem value="critical">Crítico</SelectItem>
                                  <SelectItem value="success">Sucesso</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contractId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Contrato (Opcional)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                                    <SelectValue placeholder="Selecione um contrato" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">Nenhum contrato</SelectItem>
                                  {contracts.map((contract: any) => (
                                    <SelectItem key={contract.id} value={contract.id}>
                                      {contract.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Título</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Título do alerta" 
                                className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Mensagem</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descrição detalhada do alerta" 
                                className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="border-blue-400/30 text-white hover:bg-blue-600/30"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                          {createMutation.isPending ? "Criando..." : "Criar Alerta"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-400/30 text-white hover:bg-blue-600/30">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl bg-blue-bg border-blue-400/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">Configurações de Alertas</DialogTitle>
                    <DialogDescription className="text-blue-200">
                      Configure limites, notificações e regras automáticas para o sistema de alertas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Configurações de Limites */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium text-lg">Limites de Alertas</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-white text-sm">Limite de Receita Crítico (%)</label>
                            <Input 
                              type="number"
                              defaultValue="80"
                              className="bg-blue-600/30 border-blue-400/30 text-white"
                              placeholder="80"
                            />
                            <p className="text-xs text-blue-300">Alerta quando receita cair abaixo deste percentual</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-white text-sm">Limite de Custo Crítico (%)</label>
                            <Input 
                              type="number"
                              defaultValue="120"
                              className="bg-blue-600/30 border-blue-400/30 text-white"
                              placeholder="120"
                            />
                            <p className="text-xs text-blue-300">Alerta quando custos excederem este percentual</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-white text-sm">Dias para Vencimento de Contrato</label>
                            <Input 
                              type="number"
                              defaultValue="30"
                              className="bg-blue-600/30 border-blue-400/30 text-white"
                              placeholder="30"
                            />
                            <p className="text-xs text-blue-300">Alerta X dias antes do vencimento</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-white text-sm">Margem de Lucro Mínima (%)</label>
                            <Input 
                              type="number"
                              defaultValue="15"
                              className="bg-blue-600/30 border-blue-400/30 text-white"
                              placeholder="15"
                            />
                            <p className="text-xs text-blue-300">Alerta quando margem cair abaixo deste valor</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-white text-sm">Limite de MOE por Contrato (R$)</label>
                            <Input 
                              type="number"
                              defaultValue="50000"
                              className="bg-blue-600/30 border-blue-400/30 text-white"
                              placeholder="50000"
                            />
                            <p className="text-xs text-blue-300">Alerta para custos MOE acima deste valor</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-white text-sm">Frequência de Verificação</label>
                            <Select defaultValue="15min">
                              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5min">A cada 5 minutos</SelectItem>
                                <SelectItem value="15min">A cada 15 minutos</SelectItem>
                                <SelectItem value="30min">A cada 30 minutos</SelectItem>
                                <SelectItem value="1hour">A cada hora</SelectItem>
                                <SelectItem value="daily">Diariamente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configurações de Notificação */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium text-lg">Notificações</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-600/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <div>
                              <p className="text-white text-sm font-medium">Alertas Críticos</p>
                              <p className="text-blue-200 text-xs">Notificações imediatas para problemas críticos</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Switch defaultChecked />
                            <Volume2 className="w-4 h-4 text-blue-300" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-600/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <div>
                              <p className="text-white text-sm font-medium">Alertas de Aviso</p>
                              <p className="text-blue-200 text-xs">Notificações para situações que precisam atenção</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Switch defaultChecked />
                            <Volume2 className="w-4 h-4 text-blue-300" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-600/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Info className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-white text-sm font-medium">Alertas Informativos</p>
                              <p className="text-blue-200 text-xs">Notificações gerais e atualizações do sistema</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Switch />
                            <VolumeX className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-600/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="text-white text-sm font-medium">Alertas de Sucesso</p>
                              <p className="text-blue-200 text-xs">Confirmações de ações e processos concluídos</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Switch />
                            <VolumeX className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configurações Avançadas */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium text-lg">Configurações Avançadas</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Auto-resolução de alertas</p>
                            <p className="text-blue-200 text-xs">Resolver automaticamente alertas quando condições normalizarem</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Escalonamento automático</p>
                            <p className="text-blue-200 text-xs">Escalonar alertas não resolvidos após tempo limite</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Histórico detalhado</p>
                            <p className="text-blue-200 text-xs">Manter log detalhado de todos os alertas</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Alertas por email</p>
                            <p className="text-blue-200 text-xs">Enviar alertas críticos por email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Modo silencioso</p>
                            <p className="text-blue-200 text-xs">Suspender todas as notificações temporariamente</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Machine Learning</p>
                            <p className="text-blue-200 text-xs">Usar IA para detectar padrões e anomalias</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button 
                        variant="outline" 
                        className="border-blue-400/30 text-white hover:bg-blue-600/30"
                        onClick={() => setIsConfigDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          toast({
                            title: "Configurações salvas",
                            description: "As configurações de alertas foram atualizadas com sucesso."
                          });
                          setIsConfigDialogOpen(false);
                        }}
                      >
                        Salvar Configurações
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-blue-300 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
              />
            </div>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todas as severidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as severidades</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="unread">Não lidos</SelectItem>
                <SelectItem value="read">Lidos</SelectItem>
                <SelectItem value="unresolved">Não resolvidos</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-blue-200 mt-2">Carregando alertas...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-blue-200">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum alerta encontrado</p>
              </div>
            ) : (
              filteredAlerts.map((alert: Alert) => {
                const contract = contracts.find((c: any) => c.id === alert.contractId);
                
                return (
                  <Card key={alert.id} className={`glass-effect border-blue-200/20 ${
                    !alert.read ? 'ring-2 ring-blue-400/30' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                          {getSeverityIcon(alert.severity)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-sm font-medium text-white">{alert.title}</h3>
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity === 'critical' ? 'Crítico' :
                                   alert.severity === 'warning' ? 'Aviso' :
                                   alert.severity === 'info' ? 'Info' : 'Sucesso'}
                                </Badge>
                                {!alert.read && (
                                  <Badge className="bg-blue-500/20 text-blue-300">Novo</Badge>
                                )}
                                {alert.resolved && (
                                  <Badge className="bg-green-500/20 text-green-300">Resolvido</Badge>
                                )}
                              </div>
                              <p className="text-sm text-blue-200 mb-2">{alert.message}</p>
                              {contract && (
                                <p className="text-xs text-blue-300">Contrato: {contract.name}</p>
                              )}
                              <p className="text-xs text-blue-400 mt-1">
                                {format(new Date(alert.createdAt!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            
                            <div className="flex space-x-2">
                              {!alert.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-300 hover:text-blue-100"
                                  onClick={() => markAsReadMutation.mutate(alert.id)}
                                  disabled={markAsReadMutation.isPending}
                                >
                                  Marcar como lida
                                </Button>
                              )}
                              
                              {!alert.resolved && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-300 hover:text-green-100"
                                  onClick={() => resolveMutation.mutate(alert.id)}
                                  disabled={resolveMutation.isPending}
                                >
                                  Resolver
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
