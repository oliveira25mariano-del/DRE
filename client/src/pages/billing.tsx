import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, DollarSign, TrendingUp, TrendingDown, 
  Calendar, FileBarChart, Target, CheckCircle2, AlertCircle,
  Download, Eye, Edit, Filter, BarChart3, PieChart
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface BillingData {
  id: string;
  contractId: string;
  contractName: string;
  month: number;
  year: number;
  predictedAmount: number;
  billedAmount: number;
  receivedAmount: number;
  utilizationRate: number;
  status: 'pending' | 'billed' | 'received' | 'overdue';
  dueDate: string;
  createdAt: string;
}

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedContract, setSelectedContract] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<BillingData | null>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockBillingData: BillingData[] = [
    {
      id: "1",
      contractId: "c1",
      contractName: "Shopping Curitiba - PR",
      month: 8,
      year: 2025,
      predictedAmount: 150000,
      billedAmount: 145000,
      receivedAmount: 145000,
      utilizationRate: 96.7,
      status: "received",
      dueDate: "2025-09-15",
      createdAt: "2025-08-01T00:00:00Z"
    },
    {
      id: "2",
      contractId: "c2",
      contractName: "Obra Hospital São Paulo",
      month: 8,
      year: 2025,
      predictedAmount: 280000,
      billedAmount: 275000,
      receivedAmount: 0,
      utilizationRate: 98.2,
      status: "billed",
      dueDate: "2025-09-20",
      createdAt: "2025-08-01T00:00:00Z"
    },
    {
      id: "3",
      contractId: "c3",
      contractName: "Reformas Escritório Central",
      month: 7,
      year: 2025,
      predictedAmount: 85000,
      billedAmount: 92000,
      receivedAmount: 92000,
      utilizationRate: 108.2,
      status: "received",
      dueDate: "2025-08-15",
      createdAt: "2025-07-01T00:00:00Z"
    },
    {
      id: "4",
      contractId: "c4",
      contractName: "Construção Residencial Premium",
      month: 8,
      year: 2025,
      predictedAmount: 320000,
      billedAmount: 298000,
      receivedAmount: 0,
      utilizationRate: 93.1,
      status: "overdue",
      dueDate: "2025-09-10",
      createdAt: "2025-08-01T00:00:00Z"
    },
    {
      id: "5",
      contractId: "c5",
      contractName: "Infraestrutura Logística ABC",
      month: 8,
      year: 2025,
      predictedAmount: 450000,
      billedAmount: 0,
      receivedAmount: 0,
      utilizationRate: 0,
      status: "pending",
      dueDate: "2025-09-25",
      createdAt: "2025-08-01T00:00:00Z"
    }
  ];

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const billingData = mockBillingData;

  const filteredBilling = billingData.filter((bill) => {
    const matchesSearch = bill.contractName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !selectedMonth || selectedMonth === "all" || bill.month.toString() === selectedMonth;
    const matchesYear = !selectedYear || bill.year.toString() === selectedYear;
    const matchesContract = !selectedContract || selectedContract === "all" || bill.contractId === selectedContract;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || bill.status === selectedStatus;
    
    return matchesSearch && matchesMonth && matchesYear && matchesContract && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-green-500/20 text-green-300";
      case "billed": return "bg-blue-500/20 text-blue-300";
      case "pending": return "bg-yellow-500/20 text-yellow-300";
      case "overdue": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received": return "Recebido";
      case "billed": return "Faturado";
      case "pending": return "Pendente";
      case "overdue": return "Vencido";
      default: return status;
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 95) return "text-green-400";
    if (rate >= 80) return "text-yellow-400";
    return "text-red-400";
  };

  // Calculate summary metrics
  const totalPredicted = filteredBilling.reduce((sum, bill) => sum + bill.predictedAmount, 0);
  const totalBilled = filteredBilling.reduce((sum, bill) => sum + bill.billedAmount, 0);
  const totalReceived = filteredBilling.reduce((sum, bill) => sum + bill.receivedAmount, 0);
  const avgUtilization = filteredBilling.length > 0 
    ? filteredBilling.reduce((sum, bill) => sum + bill.utilizationRate, 0) / filteredBilling.length
    : 0;

  const billingEfficiency = totalPredicted > 0 ? (totalBilled / totalPredicted) * 100 : 0;
  const collectionRate = totalBilled > 0 ? (totalReceived / totalBilled) * 100 : 0;

  // Chart data
  const monthlyData = MONTHS.map(month => {
    const monthBills = billingData.filter(bill => bill.month === month.value && bill.year.toString() === selectedYear);
    const predicted = monthBills.reduce((sum, bill) => sum + bill.predictedAmount, 0);
    const billed = monthBills.reduce((sum, bill) => sum + bill.billedAmount, 0);
    const received = monthBills.reduce((sum, bill) => sum + bill.receivedAmount, 0);
    
    return {
      month: month.label.substring(0, 3),
      predicted: predicted / 1000,
      billed: billed / 1000,
      received: received / 1000
    };
  });

  const statusData = [
    { name: 'Recebido', value: billingData.filter(b => b.status === 'received').length, color: '#10B981' },
    { name: 'Faturado', value: billingData.filter(b => b.status === 'billed').length, color: '#3B82F6' },
    { name: 'Pendente', value: billingData.filter(b => b.status === 'pending').length, color: '#F59E0B' },
    { name: 'Vencido', value: billingData.filter(b => b.status === 'overdue').length, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Previsto</p>
                <p className="text-2xl font-bold text-white">R$ {(totalPredicted / 1000).toFixed(0)}K</p>
                <p className="text-xs text-blue-300 mt-1">Meta do período</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Target className="text-blue-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Faturado</p>
                <p className="text-2xl font-bold text-white">R$ {(totalBilled / 1000).toFixed(0)}K</p>
                <div className="flex items-center mt-1">
                  {billingEfficiency >= 95 ? (
                    <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400 mr-1" />
                  )}
                  <p className="text-xs text-blue-300">{billingEfficiency.toFixed(1)}% da meta</p>
                </div>
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <DollarSign className="text-green-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Recebido</p>
                <p className="text-2xl font-bold text-white">R$ {(totalReceived / 1000).toFixed(0)}K</p>
                <p className="text-xs text-blue-300 mt-1">{collectionRate.toFixed(1)}% cobrança</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-full">
                <CheckCircle2 className="text-purple-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Aproveitamento</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(avgUtilization)}`}>
                  {avgUtilization.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-300 mt-1">Média geral</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <TrendingUp className="text-yellow-400 w-6 h-6" />
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
                Faturamento Mensal
              </CardTitle>
              <p className="text-sm text-blue-200">
                Análise de faturamento previsto vs realizado por contrato
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  toast({
                    title: "Novo Faturamento",
                    description: "Abrindo formulário para criar novo faturamento",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Faturamento
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-400/30 text-white hover:bg-blue-600/30"
                onClick={() => {
                  toast({
                    title: "Exportar Dados",
                    description: "Exportando relatório de faturamento em Excel",
                  });
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-600/30">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-600">
                Lista
              </TabsTrigger>
              <TabsTrigger value="charts" className="data-[state=active]:bg-blue-600">
                Gráficos
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">
                Análise
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-blue-300 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar contratos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
                  />
                </div>
                
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {MONTHS.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedContract} onValueChange={setSelectedContract}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Todos contratos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos contratos</SelectItem>
                    {contracts.map((contract: any) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Todos status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="billed">Faturado</SelectItem>
                    <SelectItem value="received">Recebido</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Billing List */}
              <div className="space-y-4">
                {filteredBilling.map((bill) => (
                  <Card key={bill.id} className="glass-effect border-blue-400/30">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        <div className="lg:col-span-3">
                          <h3 className="font-medium text-white">{bill.contractName}</h3>
                          <p className="text-sm text-blue-200">
                            {MONTHS.find(m => m.value === bill.month)?.label} {bill.year}
                          </p>
                        </div>
                        
                        <div className="lg:col-span-2 text-center">
                          <p className="text-sm text-blue-200">Previsto</p>
                          <p className="text-lg font-semibold text-white">
                            R$ {(bill.predictedAmount / 1000).toFixed(0)}K
                          </p>
                        </div>
                        
                        <div className="lg:col-span-2 text-center">
                          <p className="text-sm text-blue-200">Faturado</p>
                          <p className="text-lg font-semibold text-white">
                            R$ {(bill.billedAmount / 1000).toFixed(0)}K
                          </p>
                        </div>
                        
                        <div className="lg:col-span-2 text-center">
                          <p className="text-sm text-blue-200">Aproveitamento</p>
                          <p className={`text-lg font-semibold ${getUtilizationColor(bill.utilizationRate)}`}>
                            {bill.utilizationRate.toFixed(1)}%
                          </p>
                          <Progress 
                            value={Math.min(bill.utilizationRate, 100)} 
                            className="w-full h-2 mt-1"
                          />
                        </div>
                        
                        <div className="lg:col-span-2 text-center">
                          <Badge className={getStatusColor(bill.status)}>
                            {getStatusLabel(bill.status)}
                          </Badge>
                        </div>
                        
                        <div className="lg:col-span-1 flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-300 hover:text-white"
                            onClick={() => {
                              setSelectedBilling(bill);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-300 hover:text-white"
                            onClick={() => {
                              setSelectedBilling(bill);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Billing Chart */}
                <Card className="glass-effect border-blue-400/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Evolução Mensal {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="predicted" fill="#3B82F6" name="Previsto (K)" />
                        <Bar dataKey="billed" fill="#10B981" name="Faturado (K)" />
                        <Bar dataKey="received" fill="#8B5CF6" name="Recebido (K)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="glass-effect border-blue-400/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Status dos Faturamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-effect border-blue-400/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Indicadores de Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Eficiência de Faturamento</span>
                      <div className="text-right">
                        <span className="text-white font-semibold">{billingEfficiency.toFixed(1)}%</span>
                        <Progress value={billingEfficiency} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Taxa de Cobrança</span>
                      <div className="text-right">
                        <span className="text-white font-semibold">{collectionRate.toFixed(1)}%</span>
                        <Progress value={collectionRate} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Aproveitamento Médio</span>
                      <div className="text-right">
                        <span className={`font-semibold ${getUtilizationColor(avgUtilization)}`}>
                          {avgUtilization.toFixed(1)}%
                        </span>
                        <Progress value={Math.min(avgUtilization, 100)} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-blue-400/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Alertas e Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {billingData.filter(b => b.status === 'overdue').length > 0 && (
                      <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-red-300 font-medium">Faturamentos Vencidos</p>
                          <p className="text-red-200 text-sm">
                            {billingData.filter(b => b.status === 'overdue').length} faturamento(s) em atraso
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {avgUtilization < 90 && (
                      <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-yellow-300 font-medium">Baixo Aproveitamento</p>
                          <p className="text-yellow-200 text-sm">
                            Média de aproveitamento abaixo de 90%
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {billingEfficiency > 95 && (
                      <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="text-green-300 font-medium">Excelente Performance</p>
                          <p className="text-green-200 text-sm">
                            Eficiência de faturamento acima de 95%
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes do Faturamento</DialogTitle>
            <DialogDescription className="text-blue-200">
              Visualização completa dos dados de faturamento do contrato.
            </DialogDescription>
          </DialogHeader>
          {selectedBilling && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium">Contrato</label>
                    <p className="text-blue-100 bg-blue-600/20 p-3 rounded-lg mt-1">
                      {selectedBilling.contractName}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium">Período</label>
                    <p className="text-blue-100 bg-blue-600/20 p-3 rounded-lg mt-1">
                      {MONTHS.find(m => m.value === selectedBilling.month)?.label} {selectedBilling.year}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedBilling.status)}>
                        {getStatusLabel(selectedBilling.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium">Valor Previsto</label>
                    <p className="text-blue-100 bg-blue-600/20 p-3 rounded-lg mt-1">
                      R$ {selectedBilling.predictedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium">Valor Faturado</label>
                    <p className="text-blue-100 bg-blue-600/20 p-3 rounded-lg mt-1">
                      R$ {selectedBilling.billedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium">Valor Recebido</label>
                    <p className="text-blue-100 bg-blue-600/20 p-3 rounded-lg mt-1">
                      R$ {selectedBilling.receivedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-sm font-medium">Taxa de Aproveitamento</label>
                  <div className="bg-blue-600/20 p-4 rounded-lg mt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-semibold ${getUtilizationColor(selectedBilling.utilizationRate)}`}>
                        {selectedBilling.utilizationRate.toFixed(1)}%
                      </span>
                      {selectedBilling.utilizationRate >= 95 ? (
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <Progress value={Math.min(selectedBilling.utilizationRate, 100)} className="h-2" />
                  </div>
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium">Data de Vencimento</label>
                  <p className="text-blue-100 bg-blue-600/20 p-3 rounded-lg mt-1">
                    {format(new Date(selectedBilling.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="border-blue-400/30 text-white hover:bg-blue-600/30"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Faturamento</DialogTitle>
            <DialogDescription className="text-blue-200">
              Altere os dados de faturamento do contrato selecionado.
            </DialogDescription>
          </DialogHeader>
          {selectedBilling && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium">Contrato</label>
                    <Input 
                      value={selectedBilling.contractName}
                      disabled
                      className="bg-blue-600/30 border-blue-400/30 text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium">Mês</label>
                    <Select defaultValue={selectedBilling.month.toString()}>
                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(month => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium">Ano</label>
                    <Select defaultValue={selectedBilling.year.toString()}>
                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium">Valor Previsto (R$)</label>
                    <Input 
                      type="number"
                      defaultValue={selectedBilling.predictedAmount}
                      className="bg-blue-600/30 border-blue-400/30 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium">Valor Faturado (R$)</label>
                    <Input 
                      type="number"
                      defaultValue={selectedBilling.billedAmount}
                      className="bg-blue-600/30 border-blue-400/30 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium">Valor Recebido (R$)</label>
                    <Input 
                      type="number"
                      defaultValue={selectedBilling.receivedAmount}
                      className="bg-blue-600/30 border-blue-400/30 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-sm font-medium">Status</label>
                  <Select defaultValue={selectedBilling.status}>
                    <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="billed">Faturado</SelectItem>
                      <SelectItem value="received">Recebido</SelectItem>
                      <SelectItem value="overdue">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium">Data de Vencimento</label>
                  <Input 
                    type="date"
                    defaultValue={selectedBilling.dueDate.split('T')[0]}
                    className="bg-blue-600/30 border-blue-400/30 text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  className="border-blue-400/30 text-white hover:bg-blue-600/30"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    toast({
                      title: "Faturamento atualizado",
                      description: "As alterações foram salvas com sucesso.",
                    });
                    setIsEditDialogOpen(false);
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}