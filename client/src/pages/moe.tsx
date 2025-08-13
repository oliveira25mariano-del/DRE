import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Eye, Edit, Trash2, Users, BarChart3 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeeSchema, type Employee, type InsertEmployee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MOE() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const { toast } = useToast();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEmployee) => {
      return await apiRequest("POST", "/api/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsCreateDialogOpen(false);
      form.reset();
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
    mutationFn: async ({ id, data }: { id: string; data: InsertEmployee }) => {
      return await apiRequest("PATCH", `/api/employees/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      editForm.reset();
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
      extraDate: null,
      active: true,
    },
  });

  // Função para calcular taxa horária baseada no salário mensal
  const calculateHourlyRate = (monthlySalary: string, hoursWorked: string) => {
    const salary = parseFloat(monthlySalary || "0");
    const hours = parseFloat(hoursWorked || "0");
    if (salary > 0 && hours > 0) {
      // Considerando 4.33 semanas por mês (52 semanas / 12 meses)
      const weeklyHours = hours;
      const monthlyHours = weeklyHours * 4.33;
      return (salary / monthlyHours).toFixed(2);
    }
    return "0";
  };

  // Função para calcular custo total (taxa horária * horas trabalhadas)
  const calculateTotalCost = (hourlyRate: string, hoursWorked: string) => {
    const rate = parseFloat(hourlyRate || "0");
    const hours = parseFloat(hoursWorked || "0");
    return (rate * hours).toFixed(2);
  };

  // Observar mudanças no salário e horas para recalcular taxa horária e custo total
  const watchedSalary = form.watch("baseSalary");
  const watchedHours = form.watch("hoursWorked");
  const watchedHourlyRate = form.watch("hourlyRate");
  
  // Atualizar taxa horária quando salário ou horas mudarem
  useEffect(() => {
    const newHourlyRate = calculateHourlyRate(watchedSalary || "0", watchedHours || "0");
    if (newHourlyRate !== form.getValues("hourlyRate")) {
      form.setValue("hourlyRate", newHourlyRate);
    }
  }, [watchedSalary, watchedHours, form]);

  // Atualizar custo total quando taxa horária ou horas mudarem
  useEffect(() => {
    const newTotalCost = calculateTotalCost(watchedHourlyRate || "0", watchedHours || "0");
    if (newTotalCost !== form.getValues("fringeRate")) {
      form.setValue("fringeRate", newTotalCost);
    }
  }, [watchedHourlyRate, watchedHours, form]);

  const editForm = useForm<InsertEmployee>({
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
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContract = !selectedContract || selectedContract === 'all' || employee.contractId === selectedContract;
    const matchesPosition = !selectedPosition || selectedPosition === 'all' || employee.position === selectedPosition;
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

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    editForm.reset({
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
  };

  const handleDelete = (id: string) => {
    const employee = filteredEmployees.find(emp => emp.id === id);
    setEmployeeToDelete(employee || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteMutation.mutate(employeeToDelete.id);
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
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
              <Users className="text-orange-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Total Colaboradores</p>
              <p className="text-2xl font-bold text-white">{(employees as Employee[]).length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Users className="text-purple-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Média Hora</p>
              <p className="text-2xl font-bold text-white">
                {activeEmployees.length > 0 
                  ? formatCurrency(activeEmployees.reduce((sum, emp) => sum + parseFloat(emp.hourlyRate || "0"), 0) / activeEmployees.length)
                  : formatCurrency(0)
                }
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          name="fringeRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Custo Total (R$) - Automático</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  step="0.01"
                                  placeholder="Calculado automaticamente" 
                                  className="bg-gray-600/50 border-gray-400/30 text-gray-300 placeholder:text-gray-400"
                                  {...field}
                                  value={field.value || ""}
                                  readOnly
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
                              <Select onValueChange={field.onChange} value={field.value}>
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
                              <FormLabel className="text-white">Salário Mensal (R$)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="5000,00" 
                                  className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                  {...field}
                                  value={field.value || ""}
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
                                  placeholder="40" 
                                  className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                  {...field}
                                  value={field.value || ""}
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
                              <FormLabel className="text-white">Taxa Horária (R$) - Automática</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="Calculado automaticamente" 
                                  className="bg-gray-600/50 border-gray-400/30 text-gray-300 placeholder:text-gray-400"
                                  {...field}
                                  value={field.value || ""}
                                  readOnly
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="extraDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Data da Extra</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  className="bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                                  {...field}
                                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                <Input
                  placeholder="Buscar colaborador..."
                  className="pl-10 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedContract} onValueChange={setSelectedContract}>
              <SelectTrigger className="w-[200px] bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Contratos</SelectItem>
                {(contracts as any[]).map((contract: any) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    {contract.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden bg-blue-600/20 rounded-lg border border-blue-400/30">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="text-white">Carregando colaboradores...</div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <div className="text-white font-medium">Nenhum colaborador encontrado</div>
                <p className="text-blue-200 mt-2">Adicione o primeiro colaborador ao sistema MOE.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-400/30">
                  <thead className="bg-blue-600/40">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Colaborador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Contrato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Taxa/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Horas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Total MOE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-blue-200 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-400/20">
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
                                onClick={() => handleView(employee)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-yellow-300 hover:text-yellow-100"
                                onClick={() => handleEdit(employee)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-300 hover:text-red-100"
                                onClick={() => handleDelete(employee.id)}
                                disabled={deleteMutation.isPending}
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

      {/* View Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes do Colaborador</DialogTitle>
            <DialogDescription className="text-blue-200">
              Informações completas do colaborador selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-blue-200">Nome Completo</label>
                  <div className="bg-blue-600/20 rounded p-2">
                    <div className="text-sm text-white">{selectedEmployee.name}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-200">Email</label>
                  <div className="bg-blue-600/20 rounded p-2">
                    <div className="text-sm text-white">{selectedEmployee.email || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-200">Cargo</label>
                  <div className="bg-blue-600/20 rounded p-2">
                    <div className="text-sm text-white">{selectedEmployee.position}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-200">Contrato</label>
                  <div className="bg-blue-600/20 rounded p-2">
                    <div className="text-sm text-white">
                      {(contracts as any[]).find((c: any) => c.id === selectedEmployee.contractId)?.name || 'N/A'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-200">Taxa Horária</label>
                  <div className="bg-blue-600/20 rounded p-2">
                    <div className="text-sm text-white">{formatCurrency(selectedEmployee.hourlyRate || "0")}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-200">Horas Trabalhadas</label>
                  <div className="bg-blue-600/20 rounded p-2">
                    <div className="text-sm text-white">{parseFloat(selectedEmployee.hoursWorked || "0").toFixed(1)}h</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-200">Total MOE</label>
                  <div className="bg-blue-600/20 rounded p-2">
                    <div className="text-sm font-medium text-green-400">
                      {formatCurrency(parseFloat(selectedEmployee.hoursWorked || "0") * parseFloat(selectedEmployee.hourlyRate || "0"))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-200">Status</label>
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

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Colaborador</DialogTitle>
            <DialogDescription className="text-blue-200">
              Edite os dados do colaborador selecionado
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Contrato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  control={editForm.control}
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
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
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
                          {...field}
                          value={field.value || ""}
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
                    editForm.reset();
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

      {/* Analysis Modal */}
      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent className="max-w-4xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Análise MOE - Total Vendido por Contrato e Mês</DialogTitle>
            <DialogDescription className="text-blue-200">
              Visualização dinâmica do Total MOE vendido por contrato e período
            </DialogDescription>
          </DialogHeader>
          <div className="p-6" style={{ height: '300px' }}>
            {(() => {
              const chartData = (employees as Employee[]).reduce((acc: any[], employee: Employee) => {
                if (!employee.active) return acc;
                
                const contract = (contracts as any[]).find((c: any) => c.id === employee.contractId);
                const contractName = contract?.name || "Contrato Indefinido";
                
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

              const formatTooltipValue = (value: number) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(value);
              };

              return chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                    <p className="text-white font-medium">Nenhum dado disponível</p>
                    <p className="text-blue-200 text-sm">Adicione colaboradores ativos para visualizar a análise.</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 60,
                      bottom: 80,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" />
                    <XAxis 
                      dataKey="contratoMes" 
                      stroke="#93c5fd" 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#93c5fd" 
                      fontSize={12}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e3a8a', 
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      formatter={(value: any) => [formatTooltipValue(value), 'Total MOE']}
                      labelStyle={{ color: '#93c5fd' }}
                    />
                    <Bar 
                      dataKey="totalMOE" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold text-red-600">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Tem certeza que deseja excluir <strong>{employeeToDelete?.name}</strong>?
              <br />
              <span className="text-sm text-red-500 mt-2 block">Esta ação não pode ser desfeita.</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="px-6"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}