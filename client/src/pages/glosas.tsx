import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Eye, Edit, Trash2, AlertTriangle, CalendarIcon, BarChart3 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGlosaSchema, type Glosa, type InsertGlosa } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Glosas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedGlosa, setSelectedGlosa] = useState<Glosa | null>(null);
  const { toast } = useToast();

  const { data: glosas = [], isLoading } = useQuery({
    queryKey: ["/api/glosas"],
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const { data: billingData = [] } = useQuery({
    queryKey: ["/api/billing"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertGlosa) => {
      return await apiRequest("POST", "/api/glosas", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glosas"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Glosa criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar glosa: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertGlosa }) => {
      return await apiRequest("PUT", `/api/glosas/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glosas"] });
      setIsEditDialogOpen(false);
      setSelectedGlosa(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Glosa atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar glosa: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/glosas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glosas"] });
      toast({
        title: "Sucesso",
        description: "Glosa excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir glosa: " + error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertGlosa>({
    resolver: zodResolver(insertGlosaSchema),
    defaultValues: {
      contractId: "",
      description: "",
      amount: "0",
      attestationCosts: "0",
      date: new Date(),
      reason: "",
      status: "pending",
    },
  });

  const filteredGlosas = (glosas as Glosa[]).filter((glosa: Glosa) => {
    const matchesSearch = glosa.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContract = !selectedContract || selectedContract === 'all' || glosa.contractId === selectedContract;
    const matchesStatus = !selectedStatus || selectedStatus === 'all' || glosa.status === selectedStatus;
    
    return matchesSearch && matchesContract && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-300";
      case "approved": return "bg-green-500/20 text-green-300";
      case "rejected": return "bg-red-500/20 text-red-300";
      default: return "bg-blue-500/20 text-blue-300";
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  // Calculate totals
  const totalGlosas = (glosas as Glosa[]).reduce((sum, glosa) => sum + parseFloat(glosa.amount), 0);
  const totalAttestationCosts = (glosas as Glosa[]).reduce((sum, glosa) => {
    return sum + (glosa.attestationCosts ? parseFloat(glosa.attestationCosts) : 0);
  }, 0);

  const calculateImpactRate = () => {
    const totalBillingAmount = (billingData as any[]).reduce((sum, item) => {
      return sum + parseFloat(item.actual || "0");
    }, 0);
    
    if (totalBillingAmount === 0) return "0.0";
    
    const totalImpact = totalGlosas + totalAttestationCosts;
    const baseAmount = totalBillingAmount;
    
    return ((totalImpact / baseAmount) * 100).toFixed(1);
  };

  // Prepare analysis chart data for monthly bar chart
  const analysisData = () => {
    const monthlyData: { [key: string]: { custoGlosa: number; custoAtestado: number } } = {};
    
    (glosas as Glosa[]).forEach((glosa: Glosa) => {
      const month = format(new Date(glosa.date), 'MMM/yyyy', { locale: ptBR });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { custoGlosa: 0, custoAtestado: 0 };
      }
      
      monthlyData[month].custoGlosa += parseFloat(glosa.amount);
      monthlyData[month].custoAtestado += glosa.attestationCosts ? parseFloat(glosa.attestationCosts) : 0;
    });
    
    return Object.entries(monthlyData)
      .map(([month, costs]) => ({
        mes: month,
        custoGlosa: costs.custoGlosa,
        custoAtestado: costs.custoAtestado
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.mes.split('/');
        const [monthB, yearB] = b.mes.split('/');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const chartData = analysisData();

  const onSubmit = (data: InsertGlosa) => {
    const processedData = {
      ...data,
      amount: data.amount?.toString() || "0",
      attestationCosts: data.attestationCosts?.toString() || null,
      reason: data.reason || null,
    };
    
    if (selectedGlosa) {
      updateMutation.mutate({ id: selectedGlosa.id, data: processedData });
    } else {
      createMutation.mutate(processedData);
    }
  };

  const handleView = (glosa: Glosa) => {
    setSelectedGlosa(glosa);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (glosa: Glosa) => {
    setSelectedGlosa(glosa);
    form.reset({
      contractId: glosa.contractId,
      description: glosa.description,
      amount: glosa.amount,
      attestationCosts: glosa.attestationCosts || "",
      date: new Date(glosa.date),
      reason: glosa.reason || "",
      status: glosa.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (glosa: Glosa) => {
    if (window.confirm(`Tem certeza que deseja excluir a glosa de "${glosa.description}"?`)) {
      deleteMutation.mutate(glosa.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <AlertTriangle className="text-red-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Total de Glosas</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalGlosas)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <AlertTriangle className="text-orange-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Total Custos de Atestado</p>
              <p className="text-2xl font-bold text-orange-400">
                {formatCurrency(totalAttestationCosts)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <AlertTriangle className="text-red-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Taxa de Impacto na Medição Final</p>
              <p className="text-2xl font-bold text-red-400">
                {calculateImpactRate()}%
              </p>
              <p className="text-xs text-blue-300 mt-1">
                Baseado no faturamento total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect border-blue-200/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Gestão de Glosas
              </CardTitle>
              <p className="text-sm text-blue-200">Controle de glosas e ajustes de faturamento</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Glosa
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setIsAnalysisOpen(true)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Análise
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
              <Input
                placeholder="Buscar por colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-300"
              />
            </div>
            <Select value={selectedContract} onValueChange={setSelectedContract}>
              <SelectTrigger className="w-full sm:w-48 bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Filtrar por contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os contratos</SelectItem>
                {(contracts as any[]).map((contract: any) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    {contract.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-36 bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
                <SelectItem value="rejected">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-white">Carregando glosas...</div>
            </div>
          ) : filteredGlosas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-blue-200">Nenhuma glosa encontrada</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-400/10">
                <thead className="bg-blue-600/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                      Contrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                      Custos de Atestado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-blue-400/5 divide-y divide-blue-400/10">
                  {filteredGlosas.map((glosa: Glosa) => {
                    const contract = (contracts as any[]).find((c: any) => c.id === glosa.contractId);
                    
                    return (
                      <tr key={glosa.id} className="hover:bg-blue-400/10 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{glosa.description}</div>
                          <div className="text-sm text-blue-200">{glosa.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{contract?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-400">
                          {formatCurrency(glosa.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-400">
                          {glosa.attestationCosts ? formatCurrency(glosa.attestationCosts) : 'R$ 0,00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {format(new Date(glosa.date), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(glosa.status)}>
                            {glosa.status === 'pending' ? 'Pendente' : 
                             glosa.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-blue-300 hover:text-blue-100"
                              onClick={() => handleView(glosa)}
                              data-testid={`button-view-${glosa.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-yellow-300 hover:text-yellow-100"
                              onClick={() => handleEdit(glosa)}
                              data-testid={`button-edit-${glosa.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-300 hover:text-red-100"
                              onClick={() => handleDelete(glosa)}
                              data-testid={`button-delete-${glosa.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Criar Nova Glosa</DialogTitle>
            <DialogDescription className="text-blue-200">
              Preencha os dados para criar uma nova glosa no sistema
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Contrato</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white h-9">
                          <SelectValue placeholder="Selecione um contrato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(contracts as any[]).map((contract: any) => (
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

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Valor (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0,00" 
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200 h-9"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attestationCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Custos Atestado (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0,00" 
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200 h-9"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white">Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-blue-600/30 border-blue-400/30 text-white h-9",
                                !field.value && "text-blue-200"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "pending"}>
                        <FormControl>
                          <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white h-9">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="approved">Aprovada</SelectItem>
                          <SelectItem value="rejected">Rejeitada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome do Colaborador(a)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome do colaborador" 
                        className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200 h-9"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Motivo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Motivo da glosa" 
                        className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200 h-9"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-blue-400/30 text-white hover:bg-blue-600/30"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {createMutation.isPending ? "Salvando..." : "Salvar Glosa"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes da Glosa</DialogTitle>
            <DialogDescription className="text-blue-200">
              Visualização completa dos dados da glosa selecionada
            </DialogDescription>
          </DialogHeader>
          {selectedGlosa && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-100">Contrato</label>
                  <p className="text-white bg-blue-600/30 rounded p-2 mt-1">
                    {(contracts as any[]).find(c => c.id === selectedGlosa.contractId)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Valor</label>
                  <p className="text-white bg-blue-600/30 rounded p-2 mt-1">
                    {formatCurrency(selectedGlosa.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Custos de Atestado</label>
                  <p className="text-white bg-blue-600/30 rounded p-2 mt-1">
                    {selectedGlosa.attestationCosts ? formatCurrency(selectedGlosa.attestationCosts) : 'R$ 0,00'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Data</label>
                  <p className="text-white bg-blue-600/30 rounded p-2 mt-1">
                    {format(new Date(selectedGlosa.date), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-100">Nome do Colaborador(a)</label>
                <p className="text-white bg-blue-600/30 rounded p-2 mt-1">
                  {selectedGlosa.description}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-100">Motivo</label>
                <p className="text-white bg-blue-600/30 rounded p-2 mt-1">
                  {selectedGlosa.reason || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-100">Status</label>
                <Badge className={`${getStatusColor(selectedGlosa.status)} mt-1`}>
                  {selectedGlosa.status === 'pending' ? 'Pendente' : 
                   selectedGlosa.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={() => {
        setIsEditDialogOpen(false);
        setSelectedGlosa(null);
        form.reset();
      }}>
        <DialogContent className="max-w-md bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Glosa</DialogTitle>
            <DialogDescription className="text-blue-200">
              Modifique os dados da glosa conforme necessário
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Contrato</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white h-9">
                          <SelectValue placeholder="Selecione um contrato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(contracts as any[]).map((contract: any) => (
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

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Valor (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0,00" 
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200 h-9"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attestationCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Custos Atestado (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0,00" 
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200 h-9"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white">Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-blue-600/30 border-blue-400/30 text-white h-9",
                                !field.value && "text-blue-200"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "pending"}>
                        <FormControl>
                          <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white h-9">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="approved">Aprovada</SelectItem>
                          <SelectItem value="rejected">Rejeitada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome do Colaborador(a)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome do colaborador" 
                        className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200 h-9"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Motivo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Motivo da glosa" 
                        className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200 h-9"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-blue-400/30 text-white hover:bg-blue-600/30"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedGlosa(null);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateMutation.isPending ? "Salvando..." : "Atualizar Glosa"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent className="max-w-3xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Análise de Custos por Contrato</DialogTitle>
            <DialogDescription className="text-blue-200">
              Separação entre custos de glosas e custos de atestado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {chartData.length === 0 ? (
              <div className="text-center py-6 text-blue-200">
                Nenhum dado disponível. Crie algumas glosas primeiro.
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                    barGap={8}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fill: '#DBEAFE', fontSize: 12, fontWeight: 600 }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fill: '#DBEAFE', fontSize: 11, fontWeight: 600 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `R$ ${(value/1000000).toFixed(1)}M`;
                        }
                        if (value >= 1000) {
                          return `R$ ${(value/1000).toFixed(0)}k`;
                        }
                        return `R$ ${value.toFixed(0)}`;
                      }}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(value as number), 
                        name === 'custoGlosa' ? 'Custo Glosa' : 'Custo Atestado'
                      ]}
                      labelStyle={{ color: '#1E40AF', fontSize: '13px', fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: '#1E3A8A', 
                        border: '1px solid #3B82F6',
                        borderRadius: '8px',
                        fontSize: '13px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        color: '#DBEAFE'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => (
                        <span style={{ color: '#DBEAFE', fontSize: '12px', fontWeight: 500 }}>
                          {value === 'custoGlosa' ? 'Custo Glosa' : 'Custo Atestado'}
                        </span>
                      )}
                    />
                    <Bar 
                      dataKey="custoGlosa" 
                      fill="#3B82F6" 
                      radius={[2, 2, 0, 0]}
                      name="custoGlosa"
                    />
                    <Bar 
                      dataKey="custoAtestado" 
                      fill="#1D4ED8" 
                      radius={[2, 2, 0, 0]}
                      name="custoAtestado"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {/* Summary Info */}
            {chartData.length > 0 && (
              <div className="mt-4 text-center">
                <div className="text-sm text-blue-200">
                  Total de Meses: {chartData.length} | 
                  Custo Total: {formatCurrency(chartData.reduce((sum, item) => sum + item.custoGlosa + item.custoAtestado, 0))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}