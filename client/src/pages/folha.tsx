import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Calendar, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertPayrollSchema, type Payroll, type InsertPayroll, type Contract } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";


interface PayrollFilters {
  contractId: string;
  year: string;
  period: "monthly" | "quarter" | "annual";
  month?: string;
  quarter?: string;
}

export default function Folha() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [filters, setFilters] = useState<PayrollFilters>({
    contractId: "all",
    year: new Date().getFullYear().toString(),
    period: "monthly",
    month: (new Date().getMonth() + 1).toString(),
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar contratos para o filtro
  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  // Buscar dados da folha de pagamento com filtros
  const { data: payrollData = [], isLoading } = useQuery<Payroll[]>({
    queryKey: ["/api/payroll", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.contractId !== "all") params.set("contractId", filters.contractId);
      params.set("year", filters.year);
      params.set("period", filters.period);
      if (filters.month) params.set("month", filters.month);
      if (filters.quarter) params.set("quarter", filters.quarter);
      
      return apiRequest("GET", `/api/payroll?${params.toString()}`);
    },
  });

  const form = useForm<InsertPayroll>({
    resolver: zodResolver(insertPayrollSchema),
    defaultValues: {
      contractId: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      quarter: Math.ceil((new Date().getMonth() + 1) / 3),
      salarios: "0",
      horaExtra: "0",
      beneficios: "0",
      vt: "0",
      imestra: "0",
    },
  });

  const createPayrollMutation = useMutation({
    mutationFn: (data: InsertPayroll) => {
      if (editingPayroll) {
        return apiRequest("PUT", `/api/payroll/${editingPayroll.id}`, data);
      }
      return apiRequest("POST", "/api/payroll", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      setIsDialogOpen(false);
      setEditingPayroll(null);
      form.reset();
      toast({
        title: editingPayroll ? "Folha atualizada" : "Folha criada",
        description: editingPayroll 
          ? "Os dados da folha foram atualizados com sucesso."
          : "Nova folha de pagamento foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar folha de pagamento",
        variant: "destructive",
      });
    },
  });

  const deletePayrollMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/payroll/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Folha excluída",
        description: "A folha de pagamento foi excluída com sucesso.",
      });
    },
  });

  const handleSubmit = (data: InsertPayroll) => {
    createPayrollMutation.mutate(data);
  };

  const handleEdit = (payroll: Payroll) => {
    setEditingPayroll(payroll);
    form.reset({
      contractId: payroll.contractId,
      year: payroll.year,
      month: payroll.month,
      quarter: payroll.quarter,
      salarios: payroll.salarios,
      horaExtra: payroll.horaExtra,
      beneficios: payroll.beneficios,
      vt: payroll.vt,
      imestra: payroll.imestra,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta folha de pagamento?")) {
      deletePayrollMutation.mutate(id);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value) || 0);
  };

  const getContractName = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    return contract?.name || contractId;
  };

  const getPeriodLabel = () => {
    switch (filters.period) {
      case "monthly":
        return `${filters.month}/${filters.year}`;
      case "quarter":
        return `Q${filters.quarter}/${filters.year}`;
      case "annual":
        return filters.year;
      default:
        return "";
    }
  };

  const getTotalByField = (field: keyof Payroll) => {
    return payrollData.reduce((total, item) => {
      const value = parseFloat(item[field] as string) || 0;
      return total + value;
    }, 0);
  };



  // Atualizar quarter quando mudar mês
  useEffect(() => {
    if (filters.period === "monthly" && filters.month) {
      const quarter = Math.ceil(parseInt(filters.month) / 3);
      setFilters(prev => ({ ...prev, quarter: quarter.toString() }));
    }
  }, [filters.month, filters.period]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Folha de Pagamento</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestão de salários, benefícios e custos trabalhistas
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPayroll(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Folha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPayroll ? "Editar Folha" : "Nova Folha de Pagamento"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contractId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contrato</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o contrato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contracts.map((contract) => (
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
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mês</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="12"
                              {...field} 
                              value={field.value}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quarter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trimestre</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="4"
                              {...field} 
                              value={field.value}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salarios"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salários</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="horaExtra"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora Extra</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="beneficios"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benefícios</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VT (Vale Transporte)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imestra"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imestra</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createPayrollMutation.isPending}>
                      {createPayrollMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Contrato</Label>
              <Select 
                value={filters.contractId} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, contractId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Contratos</SelectItem>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período</Label>
              <Select 
                value={filters.period} 
                onValueChange={(value: "monthly" | "quarter" | "annual") => {
                  setFilters(prev => ({ ...prev, period: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarter">Trimestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ano</Label>
              <Select 
                value={filters.year} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {filters.period === "monthly" && (
              <div>
                <Label>Mês</Label>
                <Select 
                  value={filters.month || ""} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2023, i).toLocaleDateString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {filters.period === "quarter" && (
              <div>
                <Label>Trimestre</Label>
                <Select 
                  value={filters.quarter || ""} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, quarter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Abr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Set)</SelectItem>
                    <SelectItem value="4">Q4 (Out-Dez)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(getTotalByField('salarios').toString())}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Salários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(getTotalByField('horaExtra').toString())}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hora Extra</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(getTotalByField('beneficios').toString())}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Benefícios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(getTotalByField('vt').toString())}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">VT</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(getTotalByField('imestra').toString())}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Imestra</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency((
                getTotalByField('salarios') +
                getTotalByField('horaExtra') +
                getTotalByField('beneficios') +
                getTotalByField('vt') +
                getTotalByField('imestra')
              ).toString())}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Folha de Pagamento - {getPeriodLabel()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="folha-table-content">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Salários</TableHead>
                  <TableHead className="text-right">Hora Extra</TableHead>
                  <TableHead className="text-right">Benefícios</TableHead>
                  <TableHead className="text-right">VT</TableHead>
                  <TableHead className="text-right">Imestra</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      Carregando dados da folha...
                    </TableCell>
                  </TableRow>
                ) : payrollData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      Nenhum dado encontrado para o período selecionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  payrollData.map((item) => {
                    const total = (
                      parseFloat(item.salarios) +
                      parseFloat(item.horaExtra) +
                      parseFloat(item.beneficios) +
                      parseFloat(item.vt) +
                      parseFloat(item.imestra)
                    );
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {getContractName(item.contractId)}
                        </TableCell>
                        <TableCell>
                          {filters.period === "monthly" 
                            ? `${item.month}/${item.year}`
                            : filters.period === "quarter"
                            ? `Q${item.quarter}/${item.year}`
                            : item.year.toString()
                          }
                        </TableCell>
                        <TableCell className="text-right text-blue-600 font-medium">
                          {formatCurrency(item.salarios)}
                        </TableCell>
                        <TableCell className="text-right text-blue-500 font-medium">
                          {formatCurrency(item.horaExtra)}
                        </TableCell>
                        <TableCell className="text-right text-blue-700 font-medium">
                          {formatCurrency(item.beneficios)}
                        </TableCell>
                        <TableCell className="text-right text-blue-800 font-medium">
                          {formatCurrency(item.vt)}
                        </TableCell>
                        <TableCell className="text-right text-blue-900 font-medium">
                          {formatCurrency(item.imestra)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-gray-900 dark:text-white">
                          {formatCurrency(total.toString())}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}