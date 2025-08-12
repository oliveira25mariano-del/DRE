import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Download, Eye, Edit, Trash2, Users, Clock } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeeSchema, type Employee, type InsertEmployee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function MOE() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const filteredEmployees = (employees as Employee[]).filter((employee: Employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContract = !selectedContract || employee.contractId === selectedContract;
    const matchesPosition = !selectedPosition || employee.position === selectedPosition;
    
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
                Mão de Obra Especializada (MOE)
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
                              <FormLabel className="text-white">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="email@empresa.com" 
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
                              <FormLabel className="text-white">Taxa Fringe (%)</FormLabel>
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
              <Button variant="outline" className="border-blue-400/30 text-white hover:bg-blue-600/30">
                <Download className="w-4 h-4 mr-2" />
                Exportar
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
              <div className="overflow-x-auto">
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
                              <Button size="sm" variant="ghost" className="text-blue-300 hover:text-blue-100">
                                <Eye className="w-4 h-4" />
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
