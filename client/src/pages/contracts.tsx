import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Eye, Edit, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import ContractForm from "@/components/contract-form";
import { type Contract, type InsertContract } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { exportUtils } from "@/lib/exportUtils";

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const { toast } = useToast();
  const { canEdit, isVisualizationOnly } = usePermissions();

  const { data: contracts = [], isLoading, refetch } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data
    refetchInterval: false,
    refetchOnReconnect: true, // Refetch when reconnecting
    networkMode: "always", // Always try to fetch
  });

  // Force initial refetch and setup refresh mechanism
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 100);
    return () => clearTimeout(timer);
  }, [refetch]);

  // Remove automatic refresh - will rely on manual refresh after mutations
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refetch();
  //   }, 2000); // Refresh every 2 seconds to catch updates
  //   return () => clearInterval(interval);
  // }, [refetch]);



  const createMutation = useMutation({
    mutationFn: async (data: InsertContract) => {
      return await apiRequest("POST", "/api/contracts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.refetchQueries({ queryKey: ["/api/contracts"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar contrato: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertContract> }) => {
      return await apiRequest("PATCH", `/api/contracts/${id}`, data);
    },
    onSuccess: (data) => {
      console.log("✅ Contrato atualizado, forçando atualização da lista");
      // Multiple cache invalidation strategies
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.refetchQueries({ queryKey: ["/api/contracts"] });
      queryClient.removeQueries({ queryKey: ["/api/contracts"] });
      
      // Force immediate refetch with delay to ensure backend is updated
      setTimeout(() => {
        refetch();
      }, 100);
      
      setIsEditDialogOpen(false);
      setSelectedContract(null);
      toast({
        title: "Sucesso",
        description: "Contrato atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar contrato: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/contracts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setIsDeleteDialogOpen(false);
      setContractToDelete(null);
      toast({
        title: "Sucesso",
        description: "Contrato excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir contrato: " + error.message,
        variant: "destructive",
      });
    },
  });

  const filteredContracts = contracts.filter((contract: Contract) => {
    const matchesSearch = searchTerm === "" ||
                         contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contract.description && contract.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === "all" || contract.category === selectedCategory;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || contract.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Enhanced debug logging
  console.log("🔍 Estado completo:", {
    contratos: contracts.length,
    filtrados: filteredContracts.length,
    carregando: isLoading,
    busca: searchTerm,
    categoria: selectedCategory,
    status: selectedStatus,
    primeiroContrato: contracts[0]?.name || "Nenhum"
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-300";
      case "suspended": return "bg-yellow-500/20 text-yellow-300";
      case "finished": return "bg-gray-500/20 text-gray-300";
      default: return "bg-blue-500/20 text-blue-300";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Desenvolvimento": return "bg-blue-500/20 text-blue-300";
      case "Consultoria": return "bg-purple-500/20 text-purple-300";
      case "Suporte": return "bg-orange-500/20 text-orange-300";
      case "Manutenção e Facilities": return "bg-green-500/20 text-green-300";
      case "Manutenção": return "bg-teal-500/20 text-teal-300";
      case "PMOC": return "bg-cyan-500/20 text-cyan-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(numValue);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-blue-200/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Gestão de Contratos
              </CardTitle>
              <p className="text-sm text-gray-300">Visualize e gerencie todos os contratos ativos</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog 
                open={isCreateDialogOpen} 
                onOpenChange={(open) => {
                  if (!open) {
                    // Se tentando fechar o dialog, mostra alerta de confirmação
                    setShowCancelAlert(true);
                  } else {
                    setIsCreateDialogOpen(true);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={!canEdit}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isVisualizationOnly ? "Visualizar Contratos" : "Novo Contrato"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] bg-blue-bg border-blue-400/30 overflow-hidden flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-white">Criar Novo Contrato</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto pr-2">
                    <ContractForm 
                      onSubmit={(data) => createMutation.mutate(data)}
                      onCancel={() => setShowCancelAlert(true)}
                      isLoading={createMutation.isPending}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Alerta de Confirmação para Cancelar */}
              <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
                <AlertDialogContent className="bg-blue-bg border-blue-400/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Cancelar Cadastro</AlertDialogTitle>
                    <AlertDialogDescription className="text-blue-200">
                      Tem certeza que deseja cancelar o cadastro do contrato? Todos os dados preenchidos serão perdidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500"
                      onClick={() => setShowCancelAlert(false)}
                    >
                      Continuar Editando
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        setShowCancelAlert(false);
                        setIsCreateDialogOpen(false);
                      }}
                    >
                      Sim, Cancelar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button 
                variant="outline" 
                className="border-blue-400/30 text-white hover:bg-blue-600/30"
                onClick={async () => {
                  const exportData = filteredContracts.map((contract: Contract) => ({
                    "Nome": contract.name,
                    "Categoria": contract.category,
                    "Cliente": contract.client,
                    "Valor": `R$ ${parseFloat(contract.monthlyValue || "0").toLocaleString('pt-BR')}`,
                    "Data Início": new Date(contract.startDate).toLocaleDateString('pt-BR'),
                    "Data Fim": contract.endDate ? new Date(contract.endDate).toLocaleDateString('pt-BR') : "N/A",
                    "Status": contract.status === 'active' ? 'Ativo' : contract.status === 'suspended' ? 'Suspenso' : 'Finalizado',
                    "Descrição": contract.description || "N/A",
                    "Contato": contract.contact || "N/A"
                  }));

                  try {
                    await exportUtils.showExportModal(exportData, `contratos`);

                    toast({
                      title: "Dados Exportados",
                      description: `Relatório de contratos exportado com ${filteredContracts.length} registros`,
                    });
                  } catch (error) {
                    toast({
                      title: "Erro na Exportação",
                      description: "Erro ao exportar dados. Tente novamente.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-blue-300 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                <SelectItem value="Consultoria">Consultoria</SelectItem>
                <SelectItem value="Suporte">Suporte</SelectItem>
                <SelectItem value="Manutenção e Facilities">Manutenção e Facilities</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="PMOC">PMOC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
                <SelectItem value="finished">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contracts Table */}
          <div className="bg-blue-900/90 rounded-lg overflow-hidden border border-blue-700/50">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-blue-200 mt-2">Carregando contratos...</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="p-8 text-center text-blue-200">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum contrato encontrado</p>
                <p className="text-xs mt-2">Total de contratos brutos: {contracts.length}</p>
                <p className="text-xs">Filtros aplicados - Busca: "{searchTerm}", Categoria: "{selectedCategory}", Status: "{selectedStatus}"</p>
                <p className="text-xs">Contratos filtrados: {filteredContracts.length}</p>
                {contracts.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs">Debug: Primeiros contratos carregados:</p>
                    <ul className="text-xs">
                      {contracts.slice(0, 3).map((c, i) => (
                        <li key={i}>• {c.name} - {c.category} - {c.status}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div id="contracts-table-content" className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-400/20">
                  <thead className="bg-blue-800/70">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-800/70 uppercase tracking-wider">
                        Contrato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-800/70 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-800/70 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-800/70 uppercase tracking-wider">
                        Valor Mensal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-800/70 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-800/70 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-600/30 divide-y divide-blue-400/20">
                    {filteredContracts.map((contract: Contract) => (
                      <tr key={contract.id} className="hover:bg-blue-600/50 transition-colors duration-200 bg-blue-700/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <FileText className="text-blue-400 w-5 h-5" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white bg-blue-950/80 px-3 py-1 rounded border border-blue-700/30">{contract.name}</div>
                              <div className="text-sm text-blue-100 bg-blue-900/70 px-3 py-1 rounded mt-1 border border-blue-700/20">{contract.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white bg-blue-950/80 px-3 py-1 rounded border border-blue-700/30">{contract.client}</div>
                          <div className="text-sm text-blue-100 bg-blue-900/70 px-3 py-1 rounded mt-1 border border-blue-700/20">{contract.contact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getCategoryColor(contract.category)}>
                            {contract.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium text-green-300 bg-blue-950/80 px-3 py-1 rounded border border-blue-700/30">{formatCurrency(contract.monthlyValue)}</div>
                          <div className="text-blue-100 bg-blue-900/70 px-3 py-1 rounded mt-1 border border-blue-700/20">Total: {formatCurrency(contract.totalValue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status === 'active' ? 'Ativo' : 
                             contract.status === 'suspended' ? 'Suspenso' : 'Finalizado'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-blue-400 hover:text-blue-200 hover:bg-blue-500/20"
                              onClick={() => {
                                setSelectedContract(contract);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {canEdit && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-yellow-400 hover:text-yellow-200 hover:bg-yellow-500/20"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {canEdit && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-400 hover:text-red-200 hover:bg-red-500/20"
                                onClick={() => {
                                  setContractToDelete(contract);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Contract Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Contrato</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <ContractForm
              onSubmit={(data) => {
                updateMutation.mutate({ id: selectedContract.id, data });
              }}
              onCancel={() => setIsEditDialogOpen(false)}
              defaultValues={{
                ...selectedContract,
                endDate: selectedContract.endDate || undefined,
                categories: selectedContract.categories || [],
                tags: selectedContract.tags || [],
                monthlyValues: (selectedContract.monthlyValues || {}) as Record<string, string>,
                totalValues: (selectedContract.totalValues || {}) as Record<string, string>,
                margin: selectedContract.margin || undefined,
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Contract Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Visualizar Contrato
            </DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6 p-4">
              {/* Header with Contract Name */}
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-400/20">
                <h2 className="text-xl font-bold text-white">{selectedContract.name}</h2>
                <p className="text-blue-200 mt-1">{selectedContract.description || 'Sem descrição'}</p>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-blue-400/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Informações do Cliente</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-blue-300">Cliente:</label>
                      <p className="text-white">{selectedContract.client}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-300">Contato:</label>
                      <p className="text-white">{selectedContract.contact || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-blue-400/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Detalhes do Contrato</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-blue-300">Categoria:</label>
                      <Badge className={getCategoryColor(selectedContract.category)}>
                        {selectedContract.category}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-300">Status:</label>
                      <Badge className={getStatusColor(selectedContract.status)}>
                        {selectedContract.status === 'active' ? 'Ativo' : 
                         selectedContract.status === 'suspended' ? 'Suspenso' : 'Finalizado'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-blue-400/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Valores Financeiros</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-blue-300">Valor Mensal:</label>
                      <p className="text-green-300 font-semibold">{formatCurrency(selectedContract.monthlyValue)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-300">Valor Total:</label>
                      <p className="text-green-300 font-semibold">{formatCurrency(selectedContract.totalValue)}</p>
                    </div>
                    {selectedContract.margin && (
                      <div>
                        <label className="text-sm font-medium text-blue-300">Margem (%):</label>
                        <p className="text-blue-200">{selectedContract.margin}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-blue-400/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Datas</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-blue-300">Data de Início:</label>
                      <p className="text-white">{format(new Date(selectedContract.startDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                    {selectedContract.endDate && (
                      <div>
                        <label className="text-sm font-medium text-blue-300">Data de Término:</label>
                        <p className="text-white">{format(new Date(selectedContract.endDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-blue-300">Criado em:</label>
                      <p className="text-blue-200 text-sm">
                        {selectedContract.createdAt ? format(new Date(selectedContract.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories and Tags */}
              {(selectedContract.categories?.length || selectedContract.tags?.length) && (
                <div className="bg-slate-800/50 p-4 rounded-lg border border-blue-400/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Categorias e Tags</h3>
                  <div className="space-y-3">
                    {selectedContract.categories?.length && (
                      <div>
                        <label className="text-sm font-medium text-blue-300 block mb-2">Categorias:</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedContract.categories.map((category, index) => (
                            <Badge key={index} className="bg-blue-600/30 text-blue-200 border-blue-400/30">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedContract.tags?.length && (
                      <div>
                        <label className="text-sm font-medium text-blue-300 block mb-2">Tags:</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedContract.tags.map((tag, index) => (
                            <Badge key={index} className="bg-indigo-600/30 text-indigo-200 border-indigo-400/30">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-blue-400/20">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                  className="border-blue-400/30 text-white hover:bg-blue-600/30"
                >
                  Fechar
                </Button>
                {canEdit && (
                  <Button 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsEditDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-red-400/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza de que deseja excluir o contrato "{contractToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-600 text-white hover:bg-gray-500"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setContractToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={() => {
                if (contractToDelete) {
                  deleteMutation.mutate(contractToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
