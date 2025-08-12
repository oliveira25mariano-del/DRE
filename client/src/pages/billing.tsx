import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Calendar, FileBarChart, Target, CheckCircle2, AlertCircle, AlertTriangle,
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
  status: 'nf_emitida' | 'aguardando_po' | 'aguardando_sla' | 'aguardando_aprovacao';
  dueDate: string;
  createdAt: string;
  // Custos Não Previstos
  glosas: number;
  descontoSla: number;
  vendaMoe: number;
  outros: number;
  // Fringe Benefits
  efetivo: number;
  fringePlanejado: number;
  fringeExecutado: number;
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBilling, setEditingBilling] = useState<BillingData | null>(null);
  const [isNewBillingDialogOpen, setIsNewBillingDialogOpen] = useState(false);
  const [isNewCostDialogOpen, setIsNewCostDialogOpen] = useState(false);
  const [newCostData, setNewCostData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    contractId: '',
    status: 'pendente',
    description: '',
    supplier: '',
    value: '',
    costCenter: '',
    invoiceNumber: '',
    dueDate: ''
  });
  const [selectedBilling, setSelectedBilling] = useState<BillingData | null>(null);
  const { toast } = useToast();
  const queryClientHook = useQueryClient();

  // Query to fetch direct costs
  const { data: directCosts = [] } = useQuery({
    queryKey: ['/api/direct-costs'],
    staleTime: 0,
    refetchOnMount: true,
  });

  // Query to fetch contracts
  const { data: contracts = [] } = useQuery({
    queryKey: ['/api/contracts'],
  });

  // Filter function for direct costs
  const filteredDirectCosts = directCosts.filter((cost: any) => {
    const costDate = new Date(cost.date);
    const costMonth = costDate.getMonth() + 1;
    const costYear = costDate.getFullYear();

    const matchesContract = selectedContract === 'all' || cost.contractId === selectedContract;
    const matchesMonth = selectedMonth === 'all' || costMonth.toString() === selectedMonth;
    const matchesYear = costYear.toString() === selectedYear;
    const matchesCategory = selectedCategory === 'all' || cost.category === selectedCategory;
    
    return matchesContract && matchesMonth && matchesYear && matchesCategory;
  });

  // Mutation for creating new direct cost
  const createDirectCostMutation = useMutation({
    mutationFn: async (costData: any) => {
      return apiRequest('POST', '/api/direct-costs', costData);
    },
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: ['/api/direct-costs'] });
      toast({
        title: "Custo Adicionado",
        description: "Novo custo direto registrado com sucesso.",
      });
      setIsNewCostDialogOpen(false);
      // Reset form
      setNewCostData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        contractId: '',
        status: 'pendente',
        description: '',
        supplier: '',
        value: '',
        costCenter: '',
        invoiceNumber: '',
        dueDate: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Falha ao registrar o custo direto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Function to handle new cost submission
  const handleCreateCost = () => {
    // Validation
    if (!newCostData.category || !newCostData.contractId || !newCostData.description || !newCostData.value) {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha categoria, contrato, descrição e valor.",
        variant: "destructive",
      });
      return;
    }

    const costPayload = {
      ...newCostData,
      date: new Date(newCostData.date).toISOString(),
      dueDate: newCostData.dueDate ? new Date(newCostData.dueDate).toISOString() : null,
      value: newCostData.value.toString(),
    };

    createDirectCostMutation.mutate(costPayload);
  };

  // State for edit values
  const [editValues, setEditValues] = useState<Partial<BillingData>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [billingData, setBillingData] = useState<BillingData[]>([]);

  // Function to handle edit button click
  const handleEditClick = (billing: BillingData) => {
    setSelectedBilling(billing);
    setEditingBilling(billing);
    setEditValues({
      predictedAmount: billing.predictedAmount,
      billedAmount: billing.billedAmount,
      receivedAmount: billing.receivedAmount,
      glosas: billing.glosas,
      descontoSla: billing.descontoSla,
      vendaMoe: billing.vendaMoe,
      outros: billing.outros,
      efetivo: billing.efetivo,
      fringePlanejado: billing.fringePlanejado,
      fringeExecutado: billing.fringeExecutado,
      status: billing.status,
      dueDate: billing.dueDate.split('T')[0],
      month: billing.month,
      year: billing.year
    });
    setIsEditDialogOpen(true);
  };

  // Function to handle save
  const handleSaveEdit = async () => {
    if (!editingBilling) return;
    
    setIsUpdating(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the billing data state
      setBillingData(prev => prev.map(bill => 
        bill.id === editingBilling.id 
          ? { ...bill, ...editValues }
          : bill
      ));
      
      toast({
        title: "Provisão Atualizada",
        description: "Os dados da provisão foram atualizados com sucesso.",
      });
      
      setIsEditDialogOpen(false);
      setEditingBilling(null);
      setEditValues({});
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar a provisão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to update edit values
  const updateEditValue = (field: keyof BillingData, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Initialize mock data
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
      status: "nf_emitida",
      dueDate: "2025-09-15",
      createdAt: "2025-08-01T00:00:00Z",
      glosas: 2500,
      descontoSla: 1200,
      vendaMoe: 3800,
      outros: 1500,
      efetivo: 42000,
      fringePlanejado: 42000,
      fringeExecutado: 40500
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
      status: "aguardando_po",
      dueDate: "2025-09-20",
      createdAt: "2025-08-01T00:00:00Z",
      glosas: 5600,
      descontoSla: 0,
      vendaMoe: 4200,
      outros: 2100,
      efetivo: 78400,
      fringePlanejado: 78400,
      fringeExecutado: 77000
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
      status: "nf_emitida",
      dueDate: "2025-08-15",
      createdAt: "2025-07-01T00:00:00Z",
      glosas: 1800,
      descontoSla: 800,
      vendaMoe: 2100,
      outros: 950,
      efetivo: 23800,
      fringePlanejado: 23800,
      fringeExecutado: 25760
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
      status: "aguardando_sla",
      dueDate: "2025-09-10",
      createdAt: "2025-08-01T00:00:00Z",
      glosas: 3200,
      descontoSla: 2500,
      vendaMoe: 1900,
      outros: 1800,
      efetivo: 89600,
      fringePlanejado: 89600,
      fringeExecutado: 83440
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
      status: "aguardando_aprovacao",
      dueDate: "2025-09-25",
      createdAt: "2025-08-01T00:00:00Z",
      glosas: 0,
      descontoSla: 0,
      vendaMoe: 0,
      outros: 0,
      efetivo: 126000,
      fringePlanejado: 126000,
      fringeExecutado: 0
    }
  ];

  // Initialize billing data on first render
  useEffect(() => {
    if (billingData.length === 0) {
      setBillingData(mockBillingData);
    }
  }, []);

  const displayBillingData = billingData.length > 0 ? billingData : mockBillingData;

  const filteredBilling = displayBillingData.filter((bill) => {
    const matchesSearch = bill.contractName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !selectedMonth || selectedMonth === "all" || bill.month.toString() === selectedMonth;
    const matchesYear = !selectedYear || bill.year.toString() === selectedYear;
    const matchesContract = !selectedContract || selectedContract === "all" || bill.contractId === selectedContract;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || bill.status === selectedStatus;
    
    return matchesSearch && matchesMonth && matchesYear && matchesContract && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nf_emitida": return "bg-green-500/20 text-green-300";
      case "aguardando_po": return "bg-blue-500/20 text-blue-300";
      case "aguardando_sla": return "bg-yellow-500/20 text-yellow-300";
      case "aguardando_aprovacao": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "nf_emitida": return "NF Emitida";
      case "aguardando_po": return "Aguardando PO";
      case "aguardando_sla": return "Aguardando SLA";
      case "aguardando_aprovacao": return "Aguardando aprovação shopping";
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
  
  // Calculate indirect costs
  const totalGlosas = filteredBilling.reduce((sum, bill) => sum + bill.glosas, 0);
  const totalDescontoSla = filteredBilling.reduce((sum, bill) => sum + bill.descontoSla, 0);
  const totalVendaMoe = filteredBilling.reduce((sum, bill) => sum + bill.vendaMoe, 0);
  const totalIndirectCosts = totalGlosas + totalDescontoSla + totalVendaMoe;

  // Chart data
  const monthlyData = MONTHS.map(month => {
    const monthBills = displayBillingData.filter(bill => bill.month === month.value && bill.year.toString() === selectedYear);
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
    { name: 'NF Emitida', value: displayBillingData.filter(b => b.status === 'nf_emitida').length, color: '#10B981' },
    { name: 'Aguardando PO', value: displayBillingData.filter(b => b.status === 'aguardando_po').length, color: '#3B82F6' },
    { name: 'Aguardando SLA', value: displayBillingData.filter(b => b.status === 'aguardando_sla').length, color: '#F59E0B' },
    { name: 'Aguardando Aprovação', value: displayBillingData.filter(b => b.status === 'aguardando_aprovacao').length, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <Target className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Previsto</p>
              <p className="text-2xl font-bold text-white">R$ {(totalPredicted / 1000).toFixed(0)}K</p>
              <p className="text-xs text-blue-300 mt-1">Meta do período</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <DollarSign className="text-green-400 w-5 h-5" />
            </div>
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
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="text-purple-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Recebido</p>
              <p className="text-2xl font-bold text-white">R$ {(totalReceived / 1000).toFixed(0)}K</p>
              <p className="text-xs text-blue-300 mt-1">{collectionRate.toFixed(1)}% cobrança</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <AlertTriangle className="text-red-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Custos Indiretos</p>
              <p className="text-2xl font-bold text-red-300">R$ {(totalIndirectCosts / 1000).toFixed(0)}K</p>
              <p className="text-xs text-red-300 mt-1">{totalBilled > 0 ? ((totalIndirectCosts / totalBilled) * 100).toFixed(1) : 0}% do provisionado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <TrendingUp className="text-yellow-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Aproveitamento</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(avgUtilization)}`}>
                {avgUtilization.toFixed(1)}%
              </p>
              <p className="text-xs text-blue-300 mt-1">Média geral</p>
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
                Provisões Mensais
              </CardTitle>
              <p className="text-sm text-blue-200">
                Análise de provisões previstas vs realizadas por contrato
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsNewBillingDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Provisão
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-400/30 text-white hover:bg-blue-600/30"
                onClick={() => {
                  // Export filtered data to CSV
                  const csvData = filteredBilling.map(bill => ({
                    "Contrato": bill.contractName,
                    "Mês": MONTHS.find(m => m.value === bill.month)?.label,
                    "Ano": bill.year,
                    "Valor Previsto": bill.predictedAmount,
                    "Valor Faturado": bill.billedAmount,
                    "Valor Recebido": bill.receivedAmount,
                    "Taxa Aproveitamento": `${bill.utilizationRate.toFixed(1)}%`,
                    "Status": getStatusLabel(bill.status),
                    "Glosas": bill.glosas,
                    "Desconto SLA": bill.descontoSla,
                    "Venda MOE": bill.vendaMoe,
                    "Outros": bill.outros,
                    "Efetivo": bill.efetivo,
                    "Fringe Planejado": bill.fringePlanejado,
                    "Fringe Executado": bill.fringeExecutado,
                    "Vencimento": format(new Date(bill.dueDate), 'dd/MM/yyyy', { locale: ptBR })
                  }));
                  
                  const csvContent = [
                    Object.keys(csvData[0]).join(','),
                    ...csvData.map(row => Object.values(row).join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `provisoes_${selectedYear}.csv`;
                  link.click();
                  
                  toast({
                    title: "Dados Exportados",
                    description: `Arquivo CSV exportado com ${filteredBilling.length} registros`,
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
            <TabsList className="grid w-full grid-cols-5 bg-blue-600/30">
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-600">
                Lista
              </TabsTrigger>
              <TabsTrigger value="charts" className="data-[state=active]:bg-blue-600">
                Gráficos
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">
                Análise
              </TabsTrigger>
              <TabsTrigger value="custos-diretos" className="data-[state=active]:bg-blue-600">
                Custos Diretos
              </TabsTrigger>
              <TabsTrigger value="provisao" className="data-[state=active]:bg-blue-600">
                Provisão Geral
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
                    <SelectItem value="nf_emitida">NF Emitida</SelectItem>
                    <SelectItem value="aguardando_po">Aguardando PO</SelectItem>
                    <SelectItem value="aguardando_sla">Aguardando SLA</SelectItem>
                    <SelectItem value="aguardando_aprovacao">Aguardando aprovação shopping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Billing List */}
              <div className="space-y-4">
                {filteredBilling.map((bill) => (
                  <Card key={bill.id} className="glass-effect border-blue-400/30">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header Row */}
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
                              onClick={() => handleEditClick(bill)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Custos Não Previstos Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pt-3 border-t border-blue-400/20">
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Custos Não Previstos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Glosas</p>
                            <p className="text-lg font-semibold text-red-300">
                              R$ {bill.glosas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Desconto SLA</p>
                            <p className="text-lg font-semibold text-yellow-300">
                              R$ {bill.descontoSla.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Venda MOE</p>
                            <p className="text-lg font-semibold text-green-300">
                              R$ {bill.vendaMoe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Outros</p>
                            <p className="text-lg font-semibold text-orange-300">
                              R$ {bill.outros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {/* Fringe Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pt-3 border-t border-blue-400/20">
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Fringe</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Efetivo</p>
                            <p className="text-lg font-semibold text-purple-300">
                              {bill.efetivo}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Fringe Planejado</p>
                            <p className="text-lg font-semibold text-blue-300">
                              R$ {bill.fringePlanejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-200">Fringe Executado</p>
                            <p className="text-lg font-semibold text-cyan-300">
                              R$ {bill.fringeExecutado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
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
                    <CardTitle className="text-white text-lg">Status das Provisões</CardTitle>
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
                      <span className="text-blue-200">Eficiência de Provisão</span>
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
                    {billingData.filter(b => b.utilizationRate < 90).length > 0 && (
                      <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-red-300 font-medium">Provisões com Problemas</p>
                          <p className="text-red-200 text-sm">
                            {billingData.filter(b => b.utilizationRate < 90).length} provisão(ões) com baixo aproveitamento
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
                            Eficiência de provisão acima de 95%
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Custos Diretos Tab */}
            <TabsContent value="custos-diretos" className="space-y-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Gestão de Custos Diretos</h3>
                    <p className="text-blue-200 mt-1">Controle e acompanhamento de custos diretos por categoria</p>
                  </div>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsNewCostDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Custo
                  </Button>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Contrato</label>
                    <Select value={selectedContract} onValueChange={setSelectedContract}>
                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                        <SelectValue placeholder="Todos os contratos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os contratos</SelectItem>
                        {contracts.map((contract: any) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Mês</label>
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
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Ano</label>
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
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Categoria</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        <SelectItem value="folha">Folha</SelectItem>
                        <SelectItem value="insumos">Insumos</SelectItem>
                        <SelectItem value="epis">EPIs</SelectItem>
                        <SelectItem value="ferramentas">Ferramentas</SelectItem>
                        <SelectItem value="combustivel">Combustível</SelectItem>
                        <SelectItem value="manutencao">Manutenção de equipamentos</SelectItem>
                        <SelectItem value="locacao">Locação de Equipamento</SelectItem>
                        <SelectItem value="budget">Budget Clara</SelectItem>
                        <SelectItem value="hospedagem">Hospedagem</SelectItem>
                        <SelectItem value="alimentacao">Alimentação</SelectItem>
                        <SelectItem value="frete">Frete</SelectItem>
                        <SelectItem value="escritorio">Material de escritório</SelectItem>
                        <SelectItem value="uniformes">Uniformes</SelectItem>
                        <SelectItem value="coffee">Coffee break</SelectItem>
                        <SelectItem value="acoes">Ações</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cards de Resumo por Categoria */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { category: 'Folha', value: 85000, icon: '👥', color: 'blue' },
                    { category: 'Insumos', value: 42000, icon: '🔧', color: 'green' },
                    { category: 'EPIs', value: 8500, icon: '🦺', color: 'yellow' },
                    { category: 'Combustível', value: 15000, icon: '⛽', color: 'orange' },
                    { category: 'Alimentação', value: 12000, icon: '🍽️', color: 'purple' }
                  ].map((item, index) => (
                    <Card key={index} className="glass-effect border-blue-200/20">
                      <CardContent className="p-4 relative">
                        <div className="absolute top-3 right-3 text-lg">{item.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-blue-100">{item.category}</p>
                          <p className="text-xl font-bold text-white">R$ {(item.value / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-blue-300 mt-1">Este mês</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Tabela de Custos Diretos */}
                <Card className="glass-effect border-blue-200/20">
                  <CardHeader>
                    <CardTitle className="text-white">Registro de Custos Diretos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-blue-400/20">
                            <th className="text-left py-3 px-4 text-blue-200 font-medium">Data</th>
                            <th className="text-left py-3 px-4 text-blue-200 font-medium">Categoria</th>
                            <th className="text-left py-3 px-4 text-blue-200 font-medium">Descrição</th>
                            <th className="text-left py-3 px-4 text-blue-200 font-medium">Contrato</th>
                            <th className="text-left py-3 px-4 text-blue-200 font-medium">Valor</th>
                            <th className="text-left py-3 px-4 text-blue-200 font-medium">Status</th>
                            <th className="text-left py-3 px-4 text-blue-200 font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Custos Diretos Cadastrados */}
                          {filteredDirectCosts.length > 0 ? filteredDirectCosts.map((cost: any, index) => (
                            <tr key={index} className="border-b border-blue-400/10 hover:bg-blue-600/10">
                              <td className="py-3 px-4 text-white text-sm">
                                {new Date(cost.date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-3 px-4 text-white text-sm">
                                <Badge variant="outline" className="border-blue-400/30 text-blue-200">
                                  {cost.category}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-white text-sm">{cost.description}</td>
                              <td className="py-3 px-4 text-blue-200 text-sm">
                                {contracts.find((c: any) => c.id === cost.contractId)?.name || cost.contractId}
                              </td>
                              <td className="py-3 px-4 text-white text-sm font-medium">
                                R$ {parseFloat(cost.value).toLocaleString('pt-BR')}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <Badge 
                                  variant={cost.status === 'pago' ? 'default' : cost.status === 'pendente' ? 'destructive' : 'secondary'}
                                  className={
                                    cost.status === 'pago' 
                                      ? 'bg-green-500/20 text-green-300 border-green-400/30'
                                      : cost.status === 'pendente'
                                      ? 'bg-red-500/20 text-red-300 border-red-400/30'
                                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                                  }
                                >
                                  {cost.status === 'pago' ? 'Pago' : cost.status === 'pendente' ? 'Pendente' : cost.status === 'aprovado' ? 'Aprovado' : 'Processando'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-1">
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-blue-600/30">
                                    <Eye className="w-3 h-3 text-blue-300" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-blue-600/30">
                                    <Edit className="w-3 h-3 text-blue-300" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={7} className="py-8 px-4 text-center text-blue-200">
                                {directCosts.length === 0 ? 'Nenhum custo direto cadastrado ainda.' : 'Nenhum custo encontrado com os filtros aplicados.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de Distribuição por Categoria */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass-effect border-blue-200/20">
                    <CardHeader>
                      <CardTitle className="text-white">Distribuição por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Folha', value: 85000, color: '#3B82F6' },
                              { name: 'Insumos', value: 42000, color: '#10B981' },
                              { name: 'Combustível', value: 15000, color: '#F59E0B' },
                              { name: 'Alimentação', value: 12000, color: '#8B5CF6' },
                              { name: 'EPIs', value: 8500, color: '#EF4444' },
                              { name: 'Outros', value: 18500, color: '#6B7280' }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: R$ ${(entry.value / 1000).toFixed(0)}K`}
                          >
                            {[
                              { name: 'Folha', value: 85000, color: '#3B82F6' },
                              { name: 'Insumos', value: 42000, color: '#10B981' },
                              { name: 'Combustível', value: 15000, color: '#F59E0B' },
                              { name: 'Alimentação', value: 12000, color: '#8B5CF6' },
                              { name: 'EPIs', value: 8500, color: '#EF4444' },
                              { name: 'Outros', value: 18500, color: '#6B7280' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-blue-200/20">
                    <CardHeader>
                      <CardTitle className="text-white">Evolução Mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { month: 'Jun', folha: 82000, insumos: 38000, outros: 45000 },
                          { month: 'Jul', folha: 84000, insumos: 41000, outros: 42000 },
                          { month: 'Ago', folha: 85000, insumos: 42000, outros: 54000 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1E3A8A', 
                              border: '1px solid #3B82F6', 
                              borderRadius: '8px',
                              color: '#fff'
                            }} 
                          />
                          <Bar dataKey="folha" fill="#3B82F6" name="Folha" />
                          <Bar dataKey="insumos" fill="#10B981" name="Insumos" />
                          <Bar dataKey="outros" fill="#F59E0B" name="Outros" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Provisão Geral Tab */}
            <TabsContent value="provisao" className="space-y-6">
              <div className="space-y-6">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Filtrar por Contrato</label>
                    <Select value={selectedContract} onValueChange={setSelectedContract}>
                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                        <SelectValue placeholder="Todos os contratos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os contratos</SelectItem>
                        {Array.from(new Set(billingData.map(b => b.contractName))).map(contractName => (
                          <SelectItem key={contractName} value={contractName}>
                            {contractName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Período</label>
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
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Mês</label>
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
                  </div>
                </div>

                {/* Cards de Provisão */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="glass-effect border-blue-200/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-100">Faturamento Planejado</p>
                          <p className="text-2xl font-bold text-blue-300">
                            R$ {(filteredBilling.reduce((sum, b) => sum + b.predictedAmount, 0) / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-blue-300 mt-1">
                            {filteredBilling.length} contrato(s)
                          </p>
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
                          <p className="text-sm font-medium text-blue-100">Projeção de Faturamento</p>
                          <p className="text-2xl font-bold text-green-300">
                            R$ {(filteredBilling.reduce((sum, b) => sum + b.billedAmount, 0) / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-blue-300 mt-1">
                            Valor projetado atual
                          </p>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-full">
                          <TrendingUp className="text-green-400 w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-blue-200/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-100">Diferença (Projeção vs Planejado)</p>
                          {(() => {
                            const planejado = filteredBilling.reduce((sum, b) => sum + b.predictedAmount, 0);
                            const projetado = filteredBilling.reduce((sum, b) => sum + b.billedAmount, 0);
                            const diferenca = projetado - planejado;
                            const isPositive = diferenca >= 0;
                            
                            return (
                              <>
                                <p className={`text-2xl font-bold ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                                  {isPositive ? '+' : ''}R$ {(diferenca / 1000).toFixed(0)}K
                                </p>
                                <p className="text-xs text-blue-300 mt-1">
                                  {isPositive ? 'Acima do planejado' : 'Abaixo do planejado'}
                                </p>
                              </>
                            );
                          })()}
                        </div>
                        <div className={`p-3 rounded-full ${
                          filteredBilling.reduce((sum, b) => sum + b.billedAmount, 0) >= 
                          filteredBilling.reduce((sum, b) => sum + b.predictedAmount, 0) 
                            ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {filteredBilling.reduce((sum, b) => sum + b.billedAmount, 0) >= 
                           filteredBilling.reduce((sum, b) => sum + b.predictedAmount, 0) ? (
                            <TrendingUp className="text-green-400 w-6 h-6" />
                          ) : (
                            <TrendingDown className="text-red-400 w-6 h-6" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabela de Detalhamento por Contrato */}
                <Card className="glass-effect border-blue-200/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Detalhamento por Contrato
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-blue-400/20">
                            <th className="text-left py-3 px-2 text-blue-100 font-medium">Contrato</th>
                            <th className="text-right py-3 px-2 text-blue-100 font-medium">Planejado (R$)</th>
                            <th className="text-right py-3 px-2 text-blue-100 font-medium">Projeção (R$)</th>
                            <th className="text-right py-3 px-2 text-blue-100 font-medium">Diferença (R$)</th>
                            <th className="text-right py-3 px-2 text-blue-100 font-medium">Variação (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(new Set(filteredBilling.map(b => b.contractName))).map(contractName => {
                            const contractData = filteredBilling.filter(b => b.contractName === contractName);
                            const totalPlanejado = contractData.reduce((sum, b) => sum + b.predictedAmount, 0);
                            const totalProjetado = contractData.reduce((sum, b) => sum + b.billedAmount, 0);
                            const diferenca = totalProjetado - totalPlanejado;
                            const variacao = totalPlanejado > 0 ? ((diferenca / totalPlanejado) * 100) : 0;
                            const isPositive = diferenca >= 0;

                            return (
                              <tr key={contractName} className="border-b border-blue-400/10 hover:bg-blue-600/10">
                                <td className="py-3 px-2 text-white font-medium">{contractName}</td>
                                <td className="py-3 px-2 text-blue-200 text-right">
                                  {totalPlanejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-2 text-blue-200 text-right">
                                  {totalProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className={`py-3 px-2 text-right font-medium ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                                  {isPositive ? '+' : ''}{diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className={`py-3 px-2 text-right font-medium ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                                  {isPositive ? '+' : ''}{variacao.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-blue-400/30 bg-blue-600/20">
                            <td className="py-3 px-2 text-white font-bold">Total Geral</td>
                            <td className="py-3 px-2 text-white font-bold text-right">
                              {filteredBilling.reduce((sum, b) => sum + b.predictedAmount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-2 text-white font-bold text-right">
                              {filteredBilling.reduce((sum, b) => sum + b.billedAmount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            {(() => {
                              const totalPlanejado = filteredBilling.reduce((sum, b) => sum + b.predictedAmount, 0);
                              const totalProjetado = filteredBilling.reduce((sum, b) => sum + b.billedAmount, 0);
                              const diferenca = totalProjetado - totalPlanejado;
                              const variacao = totalPlanejado > 0 ? ((diferenca / totalPlanejado) * 100) : 0;
                              const isPositive = diferenca >= 0;
                              
                              return (
                                <>
                                  <td className={`py-3 px-2 font-bold text-right ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                                    {isPositive ? '+' : ''}{diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className={`py-3 px-2 font-bold text-right ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                                    {isPositive ? '+' : ''}{variacao.toFixed(1)}%
                                  </td>
                                </>
                              );
                            })()}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      {/* Direct Costs Section */}
      <Card className="bg-blue-900/50 border-blue-400/30 mt-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Custos Diretos Cadastrados ({directCosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {directCosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-blue-200">Nenhum custo direto cadastrado ainda.</p>
              <p className="text-blue-300 text-sm mt-2">Use o botão "Novo Custo" para adicionar registros.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {directCosts.map((cost: any) => (
                <div key={cost.id} className="bg-blue-800/30 rounded-lg p-4 border border-blue-400/20">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-blue-200 text-sm">Data</p>
                      <p className="text-white font-medium">
                        {format(new Date(cost.date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Categoria</p>
                      <p className="text-white font-medium capitalize">{cost.category}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Valor</p>
                      <p className="text-white font-medium">R$ {parseFloat(cost.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Status</p>
                      <Badge variant={cost.status === 'pago' ? 'default' : cost.status === 'aprovado' ? 'secondary' : 'outline'}>
                        {cost.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-blue-200 text-sm">Descrição</p>
                    <p className="text-white">{cost.description}</p>
                  </div>
                  {cost.supplier && (
                    <div className="mt-2">
                      <p className="text-blue-200 text-sm">Fornecedor: <span className="text-white font-medium">{cost.supplier}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl bg-blue-bg border-blue-400/30 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-white text-lg">Detalhes do Faturamento</DialogTitle>
            <DialogDescription className="text-blue-200 text-sm">
              Visualização completa dos dados de faturamento do contrato.
            </DialogDescription>
          </DialogHeader>
          {selectedBilling && (
            <div className="space-y-3">
              {/* Compact Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-white text-xs font-medium">Contrato</label>
                  <p className="text-blue-100 bg-blue-600/20 p-2 rounded text-sm mt-1">
                    {selectedBilling.contractName}
                  </p>
                </div>
                
                <div>
                  <label className="text-white text-xs font-medium">Período</label>
                  <p className="text-blue-100 bg-blue-600/20 p-2 rounded text-sm mt-1">
                    {MONTHS.find(m => m.value === selectedBilling.month)?.label} {selectedBilling.year}
                  </p>
                </div>
                
                <div>
                  <label className="text-white text-xs font-medium">Status</label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedBilling.status)} text-xs`}>
                      {getStatusLabel(selectedBilling.status)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-white text-xs font-medium">Data de Vencimento</label>
                  <p className="text-blue-100 bg-blue-600/20 p-2 rounded text-sm mt-1">
                    {format(new Date(selectedBilling.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Financial Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-white text-xs font-medium">Valor Previsto</label>
                  <p className="text-blue-100 bg-blue-600/20 p-2 rounded text-sm mt-1">
                    R$ {selectedBilling.predictedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div>
                  <label className="text-white text-xs font-medium">Valor Faturado</label>
                  <p className="text-blue-100 bg-blue-600/20 p-2 rounded text-sm mt-1">
                    R$ {selectedBilling.billedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div>
                  <label className="text-white text-xs font-medium">Valor Recebido</label>
                  <p className="text-blue-100 bg-blue-600/20 p-2 rounded text-sm mt-1">
                    R$ {selectedBilling.receivedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              {/* Utilization Rate */}
              <div>
                <label className="text-white text-xs font-medium">Taxa de Aproveitamento</label>
                <div className="bg-blue-600/20 p-2 rounded mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-lg font-semibold ${getUtilizationColor(selectedBilling.utilizationRate)}`}>
                      {selectedBilling.utilizationRate.toFixed(1)}%
                    </span>
                    {selectedBilling.utilizationRate >= 95 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <Progress value={Math.min(selectedBilling.utilizationRate, 100)} className="h-1.5" />
                </div>
              </div>
              
              {/* Custos Não Previstos Section */}
              <div>
                <h3 className="text-white text-sm font-medium mb-2">Custos Não Previstos</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-white text-xs font-medium">Glosas</label>
                    <p className="text-red-300 bg-blue-600/20 p-2 rounded text-sm mt-1">
                      R$ {selectedBilling.glosas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-xs font-medium">Desconto SLA</label>
                    <p className="text-yellow-300 bg-blue-600/20 p-2 rounded text-sm mt-1">
                      R$ {selectedBilling.descontoSla.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-xs font-medium">Venda MOE</label>
                    <p className="text-green-300 bg-blue-600/20 p-2 rounded text-sm mt-1">
                      R$ {selectedBilling.vendaMoe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-xs font-medium">Outros</label>
                    <p className="text-orange-300 bg-blue-600/20 p-2 rounded text-sm mt-1">
                      R$ {selectedBilling.outros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fringe Section */}
              <div>
                <h3 className="text-white text-sm font-medium mb-2">Fringe</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-white text-xs font-medium">Efetivo</label>
                    <p className="text-purple-300 bg-blue-600/20 p-2 rounded text-sm mt-1">
                      {selectedBilling.efetivo}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-xs font-medium">Fringe Planejado</label>
                    <p className="text-blue-300 bg-blue-600/20 p-2 rounded text-sm mt-1">
                      R$ {selectedBilling.fringePlanejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-white text-xs font-medium">Fringe Executado</label>
                    <p className="text-cyan-300 bg-blue-600/20 p-2 rounded text-sm mt-1">
                      R$ {selectedBilling.fringeExecutado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2 border-t border-blue-400/20">
                <Button 
                  variant="outline"
                  size="sm" 
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-blue-bg border-blue-400/30">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-white text-lg">Editar Faturamento</DialogTitle>
            <DialogDescription className="text-blue-200 text-sm">
              Altere os dados de faturamento do contrato selecionado.
            </DialogDescription>
          </DialogHeader>
          {editingBilling && (
            <div className="space-y-4">
                {/* Dados Básicos - Linha 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-white text-xs font-medium">Contrato</label>
                    <Input 
                      value={editingBilling.contractName}
                      disabled
                      className="bg-blue-600/30 border-blue-400/30 text-gray-400 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-white text-xs font-medium">Mês</label>
                    <Select 
                      onValueChange={(value) => updateEditValue('month', parseInt(value))} 
                      value={editValues.month?.toString()}
                    >
                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm">
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
                    <label className="text-white text-xs font-medium">Ano</label>
                    <Select 
                      onValueChange={(value) => updateEditValue('year', parseInt(value))} 
                      value={editValues.year?.toString()}
                    >
                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white text-xs font-medium">Status</label>
                    <Select 
                      onValueChange={(value) => updateEditValue('status', value)} 
                      value={editValues.status}
                    >
                      <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nf_emitida">NF Emitida</SelectItem>
                        <SelectItem value="aguardando_po">Aguardando PO</SelectItem>
                        <SelectItem value="aguardando_sla">Aguardando SLA</SelectItem>
                        <SelectItem value="aguardando_aprovacao">Aguardando aprovação shopping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Valores Financeiros - Linha 2 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-white text-xs font-medium">Valor Previsto (R$)</label>
                    <Input 
                      type="number" 
                      value={editValues.predictedAmount || 0}
                      onChange={(e) => updateEditValue('predictedAmount', parseFloat(e.target.value))}
                      className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                    />
                  </div>

                  <div>
                    <label className="text-white text-xs font-medium">Valor Faturado (R$)</label>
                    <Input 
                      type="number" 
                      value={editValues.billedAmount || 0}
                      onChange={(e) => updateEditValue('billedAmount', parseFloat(e.target.value))}
                      className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                    />
                  </div>

                  <div>
                    <label className="text-white text-xs font-medium">Valor Recebido (R$)</label>
                    <Input 
                      type="number" 
                      value={editValues.receivedAmount || 0}
                      onChange={(e) => updateEditValue('receivedAmount', parseFloat(e.target.value))}
                      className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                    />
                  </div>

                  <div>
                    <label className="text-white text-xs font-medium">Data de Vencimento</label>
                    <Input 
                      type="date" 
                      value={editValues.dueDate || ''}
                      onChange={(e) => updateEditValue('dueDate', e.target.value)}
                      className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                    />
                  </div>
                </div>

                {/* Custos Não Previstos - Linha 3 */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">Custos Não Previstos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-white text-xs font-medium">Glosas (R$)</label>
                      <Input 
                        type="number" 
                        value={editValues.glosas || 0}
                        onChange={(e) => updateEditValue('glosas', parseFloat(e.target.value))}
                        className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-xs font-medium">Desconto SLA (R$)</label>
                      <Input 
                        type="number" 
                        value={editValues.descontoSla || 0}
                        onChange={(e) => updateEditValue('descontoSla', parseFloat(e.target.value))}
                        className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-xs font-medium">Venda MOE (R$)</label>
                      <Input 
                        type="number" 
                        value={editValues.vendaMoe || 0}
                        onChange={(e) => updateEditValue('vendaMoe', parseFloat(e.target.value))}
                        className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-xs font-medium">Outros (R$)</label>
                      <Input 
                        type="number" 
                        value={editValues.outros || 0}
                        onChange={(e) => updateEditValue('outros', parseFloat(e.target.value))}
                        className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                      />
                    </div>
                  </div>
                </div>

                {/* Fringe - Linha 4 */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">Fringe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-white text-xs font-medium">Efetivo</label>
                      <Input 
                        type="number" 
                        value={editValues.efetivo || 0}
                        onChange={(e) => updateEditValue('efetivo', parseInt(e.target.value))}
                        className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-xs font-medium">Fringe Planejado (R$)</label>
                      <Input 
                        type="number" 
                        value={editValues.fringePlanejado || 0}
                        onChange={(e) => updateEditValue('fringePlanejado', parseFloat(e.target.value))}
                        className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-xs font-medium">Fringe Executado (R$)</label>
                      <Input 
                        type="number" 
                        value={editValues.fringeExecutado || 0}
                        onChange={(e) => updateEditValue('fringeExecutado', parseFloat(e.target.value))}
                        className="bg-blue-600/30 border-blue-400/30 text-white h-8 text-sm" 
                      />
                    </div>
                  </div>
                </div>

              {/* Botões */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-blue-400/20">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-blue-400/30 text-white hover:bg-blue-600/30"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm"
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  onClick={handleSaveEdit}
                >
                  {isUpdating ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Billing Dialog */}
      <Dialog open={isNewBillingDialogOpen} onOpenChange={setIsNewBillingDialogOpen}>
        <DialogContent className="max-w-2xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Novo Faturamento</DialogTitle>
            <DialogDescription className="text-blue-200">
              Criar um novo registro de faturamento para um contrato.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Contrato</label>
                <Select>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Selecione um contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopping-curitiba">Shopping Curitiba - PR</SelectItem>
                    <SelectItem value="hospital-sp">Obra Hospital São Paulo</SelectItem>
                    <SelectItem value="reformas-escritorio">Reformas Escritório Central</SelectItem>
                    <SelectItem value="residencial-premium">Construção Residencial Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Mês/Ano</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select>
                    <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Valor Previsto (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Valor Faturado (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Valor Recebido (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Glosas (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Desconto SLA (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Venda MOE (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Outros (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Efetivo</label>
                <Input 
                  type="number" 
                  placeholder="0"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Fringe Planejado (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Fringe Executado (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Status</label>
                <Select>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nf_emitida">NF Emitida</SelectItem>
                    <SelectItem value="aguardando_po">Aguardando PO</SelectItem>
                    <SelectItem value="aguardando_sla">Aguardando SLA</SelectItem>
                    <SelectItem value="aguardando_aprovacao">Aguardando aprovação shopping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Data de Vencimento</label>
                <Input 
                  type="date"
                  className="bg-blue-600/30 border-blue-400/30 text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                className="border-blue-400/30 text-white hover:bg-blue-600/30"
                onClick={() => setIsNewBillingDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  toast({
                    title: "Faturamento Criado",
                    description: "Novo registro de faturamento adicionado com sucesso.",
                  });
                  setIsNewBillingDialogOpen(false);
                }}
              >
                Criar Faturamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Cost Dialog */}
      <Dialog open={isNewCostDialogOpen} onOpenChange={setIsNewCostDialogOpen}>
        <DialogContent className="max-w-2xl bg-blue-bg border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Novo Custo Direto</DialogTitle>
            <DialogDescription className="text-blue-200">
              Adicionar um novo registro de custo direto ao sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Data</label>
                <Input
                  type="date"
                  value={newCostData.date}
                  onChange={(e) => setNewCostData({...newCostData, date: e.target.value})}
                  className="bg-blue-600/30 border-blue-400/30 text-white"
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Categoria</label>
                <Select value={newCostData.category} onValueChange={(value) => setNewCostData({...newCostData, category: value})}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folha">Folha</SelectItem>
                    <SelectItem value="insumos">Insumos</SelectItem>
                    <SelectItem value="epis">EPIs</SelectItem>
                    <SelectItem value="ferramentas">Ferramentas</SelectItem>
                    <SelectItem value="combustivel">Combustível</SelectItem>
                    <SelectItem value="manutencao">Manutenção de equipamentos</SelectItem>
                    <SelectItem value="locacao">Locação de Equipamento</SelectItem>
                    <SelectItem value="budget">Budget Clara</SelectItem>
                    <SelectItem value="hospedagem">Hospedagem</SelectItem>
                    <SelectItem value="alimentacao">Alimentação</SelectItem>
                    <SelectItem value="frete">Frete</SelectItem>
                    <SelectItem value="escritorio">Material de escritório</SelectItem>
                    <SelectItem value="uniformes">Uniformes</SelectItem>
                    <SelectItem value="coffee">Coffee break</SelectItem>
                    <SelectItem value="acoes">Ações</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Contrato</label>
                <Select value={newCostData.contractId} onValueChange={(value) => setNewCostData({...newCostData, contractId: value})}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Selecione um contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopping-curitiba">Shopping Curitiba - PR</SelectItem>
                    <SelectItem value="hospital-sp">Obra Hospital São Paulo</SelectItem>
                    <SelectItem value="reformas-escritorio">Reformas Escritório Central</SelectItem>
                    <SelectItem value="residencial-premium">Construção Residencial Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Status</label>
                <Select value={newCostData.status} onValueChange={(value) => setNewCostData({...newCostData, status: value})}>
                  <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                    <SelectValue placeholder="Status do custo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium">Descrição</label>
              <Input 
                type="text" 
                placeholder="Descrição detalhada do custo"
                value={newCostData.description}
                onChange={(e) => setNewCostData({...newCostData, description: e.target.value})}
                className="bg-blue-600/30 border-blue-400/30 text-white" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Valor (R$)</label>
                <Input 
                  type="number" 
                  placeholder="0,00"
                  value={newCostData.value}
                  onChange={(e) => setNewCostData({...newCostData, value: e.target.value})}
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Fornecedor</label>
                <Input 
                  type="text" 
                  placeholder="Nome do fornecedor"
                  value={newCostData.supplier}
                  onChange={(e) => setNewCostData({...newCostData, supplier: e.target.value})}
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Centro de Custo</label>
                <Input 
                  type="text" 
                  placeholder="CC001"
                  value={newCostData.costCenter}
                  onChange={(e) => setNewCostData({...newCostData, costCenter: e.target.value})}
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Número NF</label>
                <Input 
                  type="text" 
                  placeholder="Nota fiscal"
                  value={newCostData.invoiceNumber}
                  onChange={(e) => setNewCostData({...newCostData, invoiceNumber: e.target.value})}
                  className="bg-blue-600/30 border-blue-400/30 text-white" 
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Data Vencimento</label>
                <Input
                  type="date"
                  value={newCostData.dueDate}
                  onChange={(e) => setNewCostData({...newCostData, dueDate: e.target.value})}
                  className="bg-blue-600/30 border-blue-400/30 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-blue-400/20">
              <Button 
                type="button"
                variant="outline"
                className="border-blue-400/30 text-white hover:bg-blue-600/30"
                onClick={() => setIsNewCostDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateCost}
                disabled={createDirectCostMutation.isPending}
              >
                {createDirectCostMutation.isPending ? "Adicionando..." : "Adicionar Custo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}