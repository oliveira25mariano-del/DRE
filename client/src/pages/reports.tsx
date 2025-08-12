import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Search, Download, Eye, Edit, Trash2, FileBarChart, 
  Clock, CheckCircle, XCircle, Send, Settings, Calendar,
  Mail, MessageSquare, Users, FileText, BarChart3
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema, type Report, type InsertReport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/reports"],
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertReport) => {
      return await apiRequest("POST", "/api/reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Relatório criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar relatório: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertReport> }) => {
      return await apiRequest("PUT", `/api/reports/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsApprovalDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Relatório atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar relatório: " + error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertReport>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      name: "",
      type: "dre",
      parameters: {},
      schedule: "",
      recipients: [],
      status: "draft",
      approvalStatus: "pending",
    },
  });

  const filteredReports = reports.filter((report: Report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || report.type === selectedType;
    const matchesStatus = !selectedStatus || report.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-300";
      case "draft": return "bg-yellow-500/20 text-yellow-300";
      case "archived": return "bg-gray-500/20 text-gray-300";
      default: return "bg-blue-500/20 text-blue-300";
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/20 text-green-300";
      case "rejected": return "bg-red-500/20 text-red-300";
      case "pending": return "bg-yellow-500/20 text-yellow-300";
      default: return "bg-blue-500/20 text-blue-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "dre": return <BarChart3 className="w-4 h-4" />;
      case "contracts": return <FileText className="w-4 h-4" />;
      case "glosas": return <FileBarChart className="w-4 h-4" />;
      case "moe": return <Users className="w-4 h-4" />;
      case "fringe": return <Users className="w-4 h-4" />;
      default: return <FileBarChart className="w-4 h-4" />;
    }
  };

  const pendingApprovalReports = filteredReports.filter((r: Report) => r.approvalStatus === "pending");
  const activeReports = filteredReports.filter((r: Report) => r.status === "active");
  const scheduledReports = filteredReports.filter((r: Report) => r.schedule);

  const onSubmit = (data: InsertReport) => {
    // Convert recipients string to array if needed
    if (typeof data.recipients === 'string') {
      data.recipients = data.recipients.split(',').map(r => r.trim()).filter(r => r);
    }
    createMutation.mutate(data);
  };

  const handleApproval = (report: Report, approved: boolean) => {
    updateMutation.mutate({
      id: report.id,
      data: {
        approvalStatus: approved ? "approved" : "rejected",
        approvedBy: "João Silva", // In real app, get from auth
        approvedAt: new Date().toISOString(),
        status: approved ? "active" : "draft",
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Pendentes Aprovação</p>
                <p className="text-2xl font-bold text-white">{pendingApprovalReports.length}</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <Clock className="text-yellow-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Relatórios Ativos</p>
                <p className="text-2xl font-bold text-white">{activeReports.length}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <CheckCircle className="text-green-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Agendamentos</p>
                <p className="text-2xl font-bold text-white">{scheduledReports.length}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Calendar className="text-blue-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Relatórios</p>
                <p className="text-2xl font-bold text-white">{filteredReports.length}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-full">
                <FileBarChart className="text-purple-400 w-6 h-6" />
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
                <FileBarChart className="w-5 h-5 mr-2" />
                Sistema de Relatórios
              </CardTitle>
              <p className="text-sm text-blue-200">
                Geração, aprovação e envio automático de relatórios personalizados
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Relatório
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-blue-bg border-blue-400/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">Criar Novo Relatório</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-blue-600/30">
                          <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600">
                            Básico
                          </TabsTrigger>
                          <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-600">
                            Agendamento
                          </TabsTrigger>
                          <TabsTrigger value="delivery" className="data-[state=active]:bg-blue-600">
                            Entrega
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Nome do Relatório</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Ex: DRE Mensal" 
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
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Tipo de Relatório</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                                        <SelectValue placeholder="Selecione o tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="dre">DRE</SelectItem>
                                      <SelectItem value="contracts">Contratos</SelectItem>
                                      <SelectItem value="glosas">Glosas</SelectItem>
                                      <SelectItem value="moe">MOE</SelectItem>
                                      <SelectItem value="fringe">Fringe Benefits</SelectItem>
                                      <SelectItem value="audit">Auditoria</SelectItem>
                                      <SelectItem value="custom">Personalizado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="recipients"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Destinatários (separados por vírgula)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="email1@empresa.com, email2@empresa.com, +5511999999999"
                                    className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                    rows={2}
                                    {...field}
                                    value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>

                        <TabsContent value="schedule" className="space-y-4">
                          <FormField
                            control={form.control}
                            name="schedule"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Agendamento</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                                      <SelectValue placeholder="Selecione a frequência" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="all">Manual</SelectItem>
                                    <SelectItem value="daily">Diário</SelectItem>
                                    <SelectItem value="weekly">Semanal</SelectItem>
                                    <SelectItem value="monthly">Mensal</SelectItem>
                                    <SelectItem value="quarterly">Trimestral</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="bg-blue-600/20 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-2">Configurações de Agendamento</h4>
                            <div className="space-y-3 text-sm text-blue-200">
                              <div className="flex items-center justify-between">
                                <span>Enviar apenas após aprovação</span>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Incluir anexos</span>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Notificar falhas</span>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="delivery" className="space-y-4">
                          <div className="space-y-4">
                            <h4 className="text-white font-medium">Canais de Entrega</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-blue-600/20 p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-3">
                                  <Checkbox defaultChecked />
                                  <Mail className="w-4 h-4 text-blue-300" />
                                  <span className="text-white font-medium">Email</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <label className="text-blue-200">Template de Assunto:</label>
                                    <Input 
                                      placeholder="Relatório {tipo} - {periodo}"
                                      className="mt-1 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="bg-blue-600/20 p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-3">
                                  <Checkbox />
                                  <MessageSquare className="w-4 h-4 text-green-300" />
                                  <span className="text-white font-medium">WhatsApp</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <label className="text-blue-200">Template de Mensagem:</label>
                                    <Textarea 
                                      placeholder="Olá! Segue o relatório {tipo} referente ao período {periodo}."
                                      rows={2}
                                      className="mt-1 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-amber-500/20 p-4 rounded-lg border-l-4 border-amber-400">
                              <h5 className="text-amber-300 font-medium mb-1">Variáveis Disponíveis</h5>
                              <p className="text-amber-200 text-sm">
                                {"{tipo}"} - Tipo do relatório | {"{periodo}"} - Período de referência | 
                                {"{empresa}"} - Nome da empresa | {"{data}"} - Data de geração
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

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
                          {createMutation.isPending ? "Criando..." : "Criar Relatório"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-400/30 text-white hover:bg-blue-600/30">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-blue-bg border-blue-400/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">Configurações de Relatórios</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Configurações Gerais */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium text-lg">Configurações Gerais</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-white text-sm">Formato Padrão</label>
                          <Select defaultValue="pdf">
                            <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                              <SelectValue placeholder="Selecione o formato" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-white text-sm">Idioma</label>
                          <Select defaultValue="pt-BR">
                            <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                              <SelectValue placeholder="Selecione o idioma" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pt-BR">Português (BR)</SelectItem>
                              <SelectItem value="en-US">English (US)</SelectItem>
                              <SelectItem value="es-ES">Español</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-white text-sm">Assinatura Padrão</label>
                        <Textarea 
                          placeholder="Digite a assinatura que aparecerá nos relatórios..."
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                          rows={3}
                          defaultValue="Gerado automaticamente pelo Sistema DRE"
                        />
                      </div>
                    </div>

                    {/* Configurações de Notificação */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium text-lg">Notificações</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Notificar sobre novos relatórios</p>
                            <p className="text-blue-200 text-xs">Receba notificações quando novos relatórios forem gerados</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Notificar sobre aprovações pendentes</p>
                            <p className="text-blue-200 text-xs">Alertas para relatórios aguardando aprovação</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Notificar sobre falhas de envio</p>
                            <p className="text-blue-200 text-xs">Alertas quando o envio de relatórios falhar</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    {/* Configurações de Segurança */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium text-lg">Segurança</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Requerer aprovação dupla</p>
                            <p className="text-blue-200 text-xs">Relatórios críticos precisam de duas aprovações</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Log de auditoria detalhado</p>
                            <p className="text-blue-200 text-xs">Registrar todas as ações nos relatórios</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Criptografar relatórios sensíveis</p>
                            <p className="text-blue-200 text-xs">Aplicar criptografia a relatórios financeiros</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button 
                        variant="outline" 
                        className="border-blue-400/30 text-white hover:bg-blue-600/30"
                        onClick={() => setIsSettingsOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          toast({
                            title: "Configurações salvas",
                            description: "As configurações de relatórios foram atualizadas com sucesso."
                          });
                          setIsSettingsOpen(false);
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
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-600/30">
              <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600">
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="approval" className="data-[state=active]:bg-blue-600">
                Aprovações ({pendingApprovalReports.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-blue-300 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar relatórios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="dre">DRE</SelectItem>
                    <SelectItem value="contracts">Contratos</SelectItem>
                    <SelectItem value="glosas">Glosas</SelectItem>
                    <SelectItem value="moe">MOE</SelectItem>
                    <SelectItem value="fringe">Fringe Benefits</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reports Table */}
              <div className="bg-blue-400/10 rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-blue-200 mt-2">Carregando relatórios...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="p-8 text-center text-blue-200">
                    <FileBarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum relatório encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-400/20">
                      <thead className="bg-blue-500/20">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Relatório
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Agendamento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Aprovação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Última Execução
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-blue-400/5 divide-y divide-blue-400/10">
                        {filteredReports.map((report: Report) => (
                          <tr key={report.id} className="hover:bg-blue-400/10 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    {getTypeIcon(report.type)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">{report.name}</div>
                                  <div className="text-sm text-blue-200">
                                    {Array.isArray(report.recipients) ? report.recipients.length : 0} destinatários
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-blue-500/20 text-blue-300">
                                {report.type.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {report.schedule ? (
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1 text-green-400" />
                                  <span className="text-green-400">
                                    {report.schedule === 'daily' ? 'Diário' :
                                     report.schedule === 'weekly' ? 'Semanal' :
                                     report.schedule === 'monthly' ? 'Mensal' :
                                     report.schedule === 'quarterly' ? 'Trimestral' : report.schedule}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Manual</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(report.status)}>
                                {report.status === 'active' ? 'Ativo' :
                                 report.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getApprovalStatusColor(report.approvalStatus || "pending")}>
                                {report.approvalStatus === 'approved' ? 'Aprovado' :
                                 report.approvalStatus === 'rejected' ? 'Rejeitado' : 'Pendente'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                              {report.lastRun 
                                ? format(new Date(report.lastRun), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                : "Nunca executado"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost" className="text-blue-300 hover:text-blue-100">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-green-300 hover:text-green-100">
                                  <Send className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-yellow-300 hover:text-yellow-100">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-300 hover:text-red-100">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="approval" className="space-y-6">
              <div className="space-y-4">
                {pendingApprovalReports.length === 0 ? (
                  <div className="p-8 text-center text-blue-200">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum relatório pendente de aprovação</p>
                  </div>
                ) : (
                  pendingApprovalReports.map((report: Report) => (
                    <Card key={report.id} className="glass-effect border-blue-200/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(report.type)}
                              <h3 className="text-lg font-medium text-white">{report.name}</h3>
                              <Badge className="bg-yellow-500/20 text-yellow-300">
                                Pendente Aprovação
                              </Badge>
                            </div>
                            <p className="text-blue-200 mb-2">Tipo: {report.type.toUpperCase()}</p>
                            <p className="text-blue-200 mb-2">
                              Destinatários: {Array.isArray(report.recipients) ? report.recipients.join(', ') : 'N/A'}
                            </p>
                            <p className="text-blue-200 text-sm">
                              Criado em: {format(new Date(report.createdAt!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleApproval(report, true)}
                              disabled={updateMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button
                              onClick={() => handleApproval(report, false)}
                              disabled={updateMutation.isPending}
                              variant="outline"
                              className="border-red-400/30 text-red-300 hover:bg-red-600/30"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="bg-blue-400/10 rounded-lg p-6">
                <h3 className="text-white font-medium mb-4">Histórico de Execuções</h3>
                <div className="space-y-3">
                  {/* Mock execution history */}
                  {[
                    { report: "DRE Mensal", date: "2024-01-15 09:00", status: "success", recipients: 5 },
                    { report: "Relatório de Contratos", date: "2024-01-14 18:30", status: "success", recipients: 3 },
                    { report: "Análise de Glosas", date: "2024-01-14 16:45", status: "failed", recipients: 2 },
                    { report: "MOE Semanal", date: "2024-01-13 08:00", status: "success", recipients: 8 },
                  ].map((execution, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-600/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          execution.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div>
                          <p className="text-white font-medium">{execution.report}</p>
                          <p className="text-blue-200 text-sm">{execution.date} - {execution.recipients} destinatários</p>
                        </div>
                      </div>
                      <Badge className={execution.status === 'success' 
                        ? "bg-green-500/20 text-green-300" 
                        : "bg-red-500/20 text-red-300"}>
                        {execution.status === 'success' ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
