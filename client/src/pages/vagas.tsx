import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVagaSchema, type Vaga, type Contract } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Users, Clock, Target, AlertTriangle, Plus, Filter, PieChart, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Define form schema
const formSchema = insertVagaSchema.extend({
  dataAbertura: z.date(),
  dataFechamento: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusOptions = [
  { value: "aberta", label: "Aberta", color: "bg-yellow-500" },
  { value: "fechada", label: "Fechada", color: "bg-green-500" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-500" }
];

const prioridadeOptions = [
  { value: "baixa", label: "Baixa", color: "bg-gray-400" },
  { value: "media", label: "Média", color: "bg-blue-500" },
  { value: "alta", label: "Alta", color: "bg-orange-500" },
  { value: "urgente", label: "Urgente", color: "bg-red-600" }
];

const CHART_COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

export default function VagasPage() {
  const [selectedContract, setSelectedContract] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVaga, setEditingVaga] = useState<Vaga | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const queryClient = useQueryClient();

  const { data: contracts, isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: vagas, isLoading: vagasLoading } = useQuery<Vaga[]>({
    queryKey: ["/api/vagas", selectedContract],
    queryFn: async () => {
      const contractParam = selectedContract === "all" ? "" : selectedContract;
      const url = `/api/vagas${contractParam ? `?contractId=${contractParam}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    }
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/vagas/metrics", selectedContract],
    queryFn: async () => {
      const contractParam = selectedContract === "all" ? "" : selectedContract;
      const url = `/api/vagas/metrics${contractParam ? `?contractId=${contractParam}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contratoId: "",
      titulo: "",
      descricao: "",
      status: "aberta",
      dataAbertura: new Date(),
      prioridade: "media",
      departamento: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        dataAbertura: data.dataAbertura.toISOString(),
        dataFechamento: data.dataFechamento?.toISOString(),
      };
      return apiRequest("POST", "/api/vagas", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vagas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vagas/metrics"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<FormValues> }) => {
      const payload = {
        ...data.updates,
        ...(data.updates.dataAbertura && { dataAbertura: data.updates.dataAbertura.toISOString() }),
        ...(data.updates.dataFechamento && { dataFechamento: data.updates.dataFechamento.toISOString() }),
      };
      return apiRequest("PUT", `/api/vagas/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vagas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vagas/metrics"] });
      setIsDialogOpen(false);
      setEditingVaga(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vagas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vagas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vagas/metrics"] });
    },
  });

  useEffect(() => {
    if (editingVaga) {
      form.reset({
        contratoId: editingVaga.contratoId || "",
        titulo: editingVaga.titulo,
        descricao: editingVaga.descricao || "",
        status: editingVaga.status,
        dataAbertura: new Date(editingVaga.dataAbertura),
        dataFechamento: editingVaga.dataFechamento ? new Date(editingVaga.dataFechamento) : undefined,
        prioridade: editingVaga.prioridade || "media",
        departamento: editingVaga.departamento || "",
      });
    }
  }, [editingVaga, form]);

  const filteredVagas = vagas?.filter(vaga => {
    const matchesStatus = filterStatus === "all" || vaga.status === filterStatus;
    const matchesSearch = !searchQuery || 
      vaga.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vaga.departamento?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const onSubmit = (data: FormValues) => {
    if (editingVaga) {
      updateMutation.mutate({ id: editingVaga.id, updates: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNewVaga = () => {
    setEditingVaga(null);
    form.reset({
      contratoId: selectedContract === "all" ? "" : selectedContract,
      titulo: "",
      descricao: "",
      status: "aberta",
      dataAbertura: new Date(),
      prioridade: "media",
      departamento: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditVaga = (vaga: Vaga) => {
    setEditingVaga(vaga);
    setIsDialogOpen(true);
  };

  if (contractsLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="vagas-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Gestão de Vagas</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Controle de vagas abertas e fechadas por contrato com métricas avançadas
          </p>
        </div>
        <Button onClick={handleNewVaga} className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-vaga">
          <Plus className="h-4 w-4 mr-2" />
          Nova Vaga
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select value={selectedContract} onValueChange={setSelectedContract}>
          <SelectTrigger className="w-48" data-testid="select-contract">
            <SelectValue placeholder="Todos os Contratos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Contratos</SelectItem>
            {contracts?.map((contract) => (
              <SelectItem key={contract.id} value={contract.id}>
                {contract.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="Todos Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Buscar vagas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            data-testid="input-search-vagas"
          />
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && !metricsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Taxa de Fechamento de Vagas (TFV)
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {metrics.kpis?.tfv || 0}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Meta: 70%
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Tempo Médio de Fechamento (TMF)
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {metrics.kpis?.tmf || 0} dias
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Meta: 30 dias
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Vagas Abertas Ativas
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {metrics.kpis?.vagasAbertasAtivas || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aguardando preenchimento
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Índice de Rotatividade
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {metrics.kpis?.indiceRotatividade || 0}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Últimos 12 meses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {metrics?.alerts && metrics.alerts.length > 0 && (
        <div className="space-y-2">
          {metrics.alerts.map((alert: any, index: number) => (
            <div key={index} className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {alert.message}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Severidade: {alert.severity}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <BarChart3 className="h-5 w-5" />
                Tendência Mensal de Vagas
              </CardTitle>
              <CardDescription>Abertas vs Fechadas nos últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      color: '#f8fafc',
                      border: 'none',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="abertas" fill="#3b82f6" name="Abertas" />
                  <Bar dataKey="fechadas" fill="#10b981" name="Fechadas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Contract Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <PieChart className="h-5 w-5" />
                Performance por Contrato
              </CardTitle>
              <CardDescription>Taxa de fechamento por contrato</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.metricsByContract || []} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="contractName" stroke="#64748b" fontSize={10} width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      color: '#f8fafc',
                      border: 'none',
                      borderRadius: '8px'
                    }} 
                    formatter={(value: any) => [`${value}%`, 'TFV']}
                  />
                  <Bar dataKey="tfv" fill="#1e40af" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vagas Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">Lista de Vagas</CardTitle>
          <CardDescription>
            {filteredVagas.length} vaga(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vagasLoading ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              Carregando vagas...
            </div>
          ) : filteredVagas.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              Nenhuma vaga encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVagas.map((vaga) => {
                const contract = contracts?.find(c => c.id === vaga.contratoId);
                const statusOption = statusOptions.find(s => s.value === vaga.status);
                const prioridadeOption = prioridadeOptions.find(p => p.value === vaga.prioridade);
                
                return (
                  <div key={vaga.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                            {vaga.titulo}
                          </h3>
                          <Badge className={`${statusOption?.color} text-white`}>
                            {statusOption?.label}
                          </Badge>
                          {prioridadeOption && (
                            <Badge variant="outline" className={`${prioridadeOption.color} text-white border-none`}>
                              {prioridadeOption.label}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div>
                            <span className="font-medium">Contrato:</span> {contract?.name ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Departamento:</span> {vaga.departamento ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Abertura:</span> {format(new Date(vaga.dataAbertura), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          {vaga.dataFechamento && (
                            <div>
                              <span className="font-medium">Fechamento:</span> {format(new Date(vaga.dataFechamento), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          )}
                          {vaga.tempoFechamentoDias && (
                            <div>
                              <span className="font-medium">Tempo de Fechamento:</span> {vaga.tempoFechamentoDias} dias
                            </div>
                          )}
                        </div>
                        
                        {vaga.descricao && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {vaga.descricao}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditVaga(vaga)}
                          data-testid={`button-edit-vaga-${vaga.id}`}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteMutation.mutate(vaga.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-vaga-${vaga.id}`}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVaga ? 'Editar Vaga' : 'Nova Vaga'}</DialogTitle>
            <DialogDescription>
              {editingVaga ? 'Atualize as informações da vaga.' : 'Cadastre uma nova vaga no sistema.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="contratoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contrato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contract-form">
                            <SelectValue placeholder="Selecione um contrato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contracts?.map((contract) => (
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status-form">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Vaga</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-titulo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} data-testid="textarea-descricao" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-prioridade-form">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prioridadeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} data-testid="input-departamento" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="dataAbertura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Abertura</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          data-testid="input-data-abertura"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataFechamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Fechamento</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-data-fechamento"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-save-vaga"
                >
                  {editingVaga ? 'Atualizar' : 'Criar'} Vaga
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}