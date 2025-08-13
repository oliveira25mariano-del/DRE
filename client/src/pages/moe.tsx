import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Eye, Edit, Trash2, Users, Clock, BarChart3 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeeSchema, type Employee, type InsertEmployee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Dialog as AnalysisDialog, DialogContent as AnalysisDialogContent, DialogHeader as AnalysisDialogHeader, DialogTitle as AnalysisDialogTitle, DialogDescription as AnalysisDialogDescription } from "@/components/ui/dialog";

export default function MOE() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<InsertEmployee | null>(null);
  const { toast } = useToast();

  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/employees"],
    refetchOnWindowFocus: true,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEmployee) => {
      console.log("Enviando dados:", data);
      const result = await apiRequest("POST", "/api/employees", data);
      console.log("Resultado:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Colaborador criado com sucesso:", data);
      // Invalidar queries e forçar refetch imediato
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      refetch();
      
      form.reset({
        name: "",
        email: "",
        position: "",
        contractId: "",
        baseSalary: "0",
        fringeRate: "0",
        hoursWorked: "0",
        hourlyRate: "0",
        active: true,
      });
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Colaborador criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar colaborador: " + error.message,
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: InsertEmployee }) => {
      return await apiRequest("PATCH", `/api/employees/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      refetch();
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      toast({
        title: "Sucesso",
        description: "Colaborador atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar colaborador: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      refetch();
      toast({
        title: "Sucesso",
        description: "Colaborador excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir colaborador: " + error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      position: "",
      contractId: "",
      baseSalary: "0",
      fringeRate: "0",
      hoursWorked: "0",
      hourlyRate: "0",
      active: true,
    },
  });

  const editFormConfig = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      position: "",
      contractId: "",
      baseSalary: "0",
      fringeRate: "0",
      hoursWorked: "0",
      hourlyRate: "0",
      active: true,
    },
  });

  const filteredEmployees = (employees as Employee[]).filter((employee: Employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContract = selectedContract === "all" || employee.contractId === selectedContract;
    const matchesPosition = selectedPosition === "all" || employee.position === selectedPosition;
    
    return matchesSearch && matchesContract && matchesPosition;
  });

  const activeEmployees = filteredEmployees.filter((emp: Employee) => emp.active);
  const totalMOECost = activeEmployees.reduce((sum: number, emp: Employee) => {
    const hours = parseFloat(emp.hoursWorked || "0");
    const rate = parseFloat(emp.hourlyRate || "0");
    return sum + (hours * rate);
  }, 0);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const onSubmit = (data: InsertEmployee) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertEmployee) => {
    if (selectedEmployee) {
      editMutation.mutate({ id: selectedEmployee.id, data });
    }
  };



  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Users className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Total MOE</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalMOECost)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Users className="text-green-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Colaboradores Ativos</p>
              <p className="text-2xl font-bold text-white">{activeEmployees.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Clock className="text-amber-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Horas Trabalhadas</p>
              <p className="text-2xl font-bold text-white">
                {activeEmployees.reduce((sum: number, emp: Employee) => sum + parseFloat(emp.hoursWorked || "0"), 0).toFixed(0)}h
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Users className="text-purple-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Taxa Média/Hora</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(
                  activeEmployees.length > 0
                    ? activeEmployees.reduce((sum: number, emp: Employee) => sum + parseFloat(emp.hourlyRate || "0"), 0) / activeEmployees.length
                    : 0
                )}
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
                <Users className="w-5 h-5 mr-2" />
                Mão de Obra Extra (MOE)
              </CardTitle>
              <p className="text-sm text-blue-200">Gestão de colaboradores e faturamento de horas</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Colaborador
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-blue-bg border-blue-400/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">Adicionar Colaborador</DialogTitle>
                    <DialogDescription className="text-blue-200">
                      Adicione um novo colaborador ao sistema MOE
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Nome Completo</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nome do colaborador" 
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
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Data</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
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
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Cargo</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Desenvolvedor Sênior" 
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
                          name="contractId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Contrato</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
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

                        <FormField
                          control={form.control}
                          name="baseSalary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Salário Base (R$)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0,00" 
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
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Taxa Horária (R$)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0,00" 
                                  className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
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

                        <FormField
                          control={form.control}
                          name="fringeRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Faturado Extra</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0,00" 
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
                          name="hoursWorked"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Horas Trabalhadas</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.5"
                                  placeholder="0" 
                                  className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    // Automatizar cálculo do Total MOE
                                    const hoursWorked = parseFloat(e.target.value || "0");
                                    const hourlyRate = parseFloat(form.getValues("hourlyRate") || "0");
                                    // O Total MOE será calculado automaticamente na tabela (Taxa/Hora × Horas)
                                  }}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                          {createMutation.isPending ? "Salvando..." : "Salvar Colaborador"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
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
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-blue-300 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
              />
            </div>
            <Select value={selectedContract} onValueChange={setSelectedContract}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todos os contratos" />
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
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todos os cargos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cargos</SelectItem>
                {Array.from(new Set((employees as Employee[]).map((emp: Employee) => emp.position))).map((position: string) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employees Table */}
          <div className="bg-blue-400/10 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-blue-200 mt-2">Carregando colaboradores...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-blue-200">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum colaborador encontrado</p>
              </div>
            ) : (
              <div id="moe-table-content" className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-400/20">
                  <thead className="bg-blue-500/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Colaborador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Contrato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Taxa/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Horas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Total MOE
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
                    {filteredEmployees.map((employee: Employee) => {
                      const contract = (contracts as any[]).find((c: any) => c.id === employee.contractId);
                      const totalMOE = parseFloat(employee.hoursWorked || "0") * parseFloat(employee.hourlyRate || "0");
                      
                      return (
                        <tr key={employee.id} className="hover:bg-blue-400/10 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <Users className="text-blue-400 w-5 h-5" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{employee.name}</div>
                                <div className="text-sm text-blue-200">{employee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{contract?.name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{employee.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCurrency(employee.hourlyRate || "0")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {parseFloat(employee.hoursWorked || "0").toFixed(1)}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                            {formatCurrency(totalMOE)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={employee.active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                              {employee.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-300 hover:text-blue-100"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsViewDialogOpen(true);
                                }}
                                data-testid={`button-view-${employee.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-yellow-300 hover:text-yellow-100"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  editFormConfig.reset({
                                    name: employee.name,
                                    email: employee.email || "",
                                    position: employee.position,
                                    contractId: employee.contractId,
                                    baseSalary: employee.baseSalary || "0",
                                    fringeRate: employee.fringeRate || "0",
                                    hoursWorked: employee.hoursWorked || "0",
                                    hourlyRate: employee.hourlyRate || "0",
                                    active: employee.active,
                                  });
                                  setIsEditDialogOpen(true);
                                }}
                                data-testid={`button-edit-${employee.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-300 hover:text-red-100"
                                onClick={() => {
                                  if (window.confirm("Tem certeza que deseja excluir este colaborador?")) {
                                    deleteMutation.mutate(employee.id);
                                  }
                                }}
                                data-testid={`button-delete-${employee.id}`}
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
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Análise Modal */}
      <AnalysisDialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <AnalysisDialogContent className="max-w-4xl bg-blue-bg border-blue-400/30">
          <AnalysisDialogHeader>
            <AnalysisDialogTitle className="text-white">Análise MOE - Total Vendido por Contrato e Mês</AnalysisDialogTitle>
            <AnalysisDialogDescription className="text-blue-200">
              Visualização dinâmica do Total MOE vendido por contrato e período
            </AnalysisDialogDescription>
          </AnalysisDialogHeader>
          <div className="p-6">
            {(() => {
              // Preparar dados do gráfico
              const chartData = (employees as Employee[]).reduce((acc: any[], employee: Employee) => {
                if (!employee.active) return acc;
                
                const contract = (contracts as any[]).find((c: any) => c.id === employee.contractId);
                const contractName = contract?.name || "Contrato Indefinido";
                
                // Usar a data de hoje para simular dados mensais (em uma implementação real, você teria datas específicas)
                const currentDate = new Date();
                const monthKey = format(currentDate, "MMM/yyyy", { locale: ptBR });
                const contractMonth = `${contractName} - ${monthKey}`;
                
                const totalMOE = parseFloat(employee.hoursWorked || "0") * parseFloat(employee.hourlyRate || "0");
                
                const existingEntry = acc.find(item => item.contratoMes === contractMonth);
                if (existingEntry) {
                  existingEntry.totalMOE += totalMOE;
                } else {
                  acc.push({
                    contratoMes: contractMonth,
                    contractName,
                    totalMOE,
                    month: monthKey
                  });
                }
                
                return acc;
              }, []);

              // Ordenar por nome do contrato e depois por data
              chartData.sort((a, b) => {
                const contractCompare = a.contractName.localeCompare(b.contractName);
                if (contractCompare !== 0) return contractCompare;
                return a.month.localeCompare(b.month);
              });

              const totalMOESum = chartData.reduce((sum, item) => sum + item.totalMOE, 0);

              return (
                <>
                  <div className="mb-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="glass-effect border-blue-200/20">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <p className="text-xs font-medium text-blue-100">Registros</p>
                            <p className="text-lg font-bold text-white">{chartData.length}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="glass-effect border-blue-200/20">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <p className="text-xs font-medium text-blue-100">Total MOE</p>
                            <p className="text-lg font-bold text-white">
                              {totalMOESum.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="glass-effect border-blue-200/20">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <p className="text-xs font-medium text-blue-100">Contratos</p>
                            <p className="text-lg font-bold text-white">
                              {new Set(chartData.map(item => item.contractName)).size}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="bg-blue-400/5 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 80, bottom: 120 }}
                        barGap={6}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                        <XAxis 
                          dataKey="contratoMes" 
                          tick={{ 
                            fill: '#DBEAFE', 
                            fontSize: 10, 
                            fontWeight: 600
                          }}
                          angle={-35}
                          textAnchor="end"
                          height={120}
                          interval={0}
                        />
                        <YAxis 
                          tick={{ 
                            fill: '#DBEAFE', 
                            fontSize: 11, 
                            fontWeight: 600
                          }}
                          tickFormatter={(value) => {
                            if (value >= 1000000) {
                              return `R$ ${(value/1000000).toFixed(1)}M`;
                            }
                            if (value >= 1000) {
                              return `R$ ${(value/1000).toFixed(0)}k`;
                            }
                            return `R$ ${value.toFixed(0)}`;
                          }}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(30, 58, 138, 0.95)',
                            border: '1px solid #3B82F6',
                            borderRadius: '8px',
                            color: '#DBEAFE',
                            fontSize: '12px'
                          }}
                          formatter={(value: any) => [
                            `${parseFloat(value).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}`,
                            'Total MOE'
                          ]}
                          labelStyle={{ color: '#DBEAFE', fontWeight: 'bold' }}
                        />
                        <Legend 
                          wrapperStyle={{ 
                            color: '#DBEAFE', 
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        />
                        <Bar 
                          dataKey="totalMOE" 
                          fill="#3B82F6" 
                          name="Total MOE"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              );
            })()}
          </div>
        </AnalysisDialogContent>
      </AnalysisDialog>

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes do Colaborador</DialogTitle>
            <DialogDescription className="text-blue-200">
              Visualização completa dos dados do colaborador selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-100">Nome</label>
                  <p className="text-white bg-blue-600/20 rounded p-2">{selectedEmployee.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Email/Data</label>
                  <p className="text-white bg-blue-600/20 rounded p-2">{selectedEmployee.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Cargo</label>
                  <p className="text-white bg-blue-600/20 rounded p-2">{selectedEmployee.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Contrato</label>
                  <p className="text-white bg-blue-600/20 rounded p-2">
                    {(contracts as any[]).find((c: any) => c.id === selectedEmployee.contractId)?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Taxa/Hora</label>
                  <p className="text-white bg-blue-600/20 rounded p-2">{formatCurrency(selectedEmployee.hourlyRate || "0")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Horas Trabalhadas</label>
                  <p className="text-white bg-blue-600/20 rounded p-2">{selectedEmployee.hoursWorked}h</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Total MOE</label>
                  <p className="text-white bg-blue-600/20 rounded p-2 font-bold text-green-300">
                    {formatCurrency(parseFloat(selectedEmployee.hoursWorked || "0") * parseFloat(selectedEmployee.hourlyRate || "0"))}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-100">Status</label>
                  <div className="bg-blue-600/20 rounded p-2">
                    <Badge className={selectedEmployee.active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                      {selectedEmployee.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Colaborador</DialogTitle>
            <DialogDescription className="text-blue-200">
              Edite os dados do colaborador selecionado
            </DialogDescription>
          </DialogHeader>
          <Form {...editFormConfig}>
            <form onSubmit={editFormConfig.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={editFormConfig.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nome Completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome do colaborador" 
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editFormConfig.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Data</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editFormConfig.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cargo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Desenvolvedor Sênior" 
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editFormConfig.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Contrato</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
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

                <FormField
                  control={editFormConfig.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Taxa/Hora (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="0.00" 
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
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

                <FormField
                  control={editFormConfig.control}
                  name="hoursWorked"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Horas Trabalhadas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.5"
                          placeholder="0" 
                          className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
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

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-blue-400/30 text-white hover:bg-blue-600/30"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedEmployee(null);
                    editFormConfig.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={editMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {editMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
