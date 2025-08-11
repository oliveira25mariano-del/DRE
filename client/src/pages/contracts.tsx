import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Eye, Edit, Trash2, FileText } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import ContractForm from "@/components/contract-form";
import { type Contract, type InsertContract } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const { toast } = useToast();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertContract) => {
      return await apiRequest("POST", "/api/contracts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
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

  const filteredContracts = contracts.filter((contract: Contract) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || contract.category === selectedCategory;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || contract.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
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
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Contrato
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
              <Button variant="outline" className="border-blue-400/30 text-white hover:bg-blue-600/30">
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
          <div className="bg-blue-400/10 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-blue-200 mt-2">Carregando contratos...</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="p-8 text-center text-blue-200">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum contrato encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-400/20">
                  <thead className="bg-blue-800/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-900/80 uppercase tracking-wider">
                        Contrato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-900/80 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-900/80 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-900/80 uppercase tracking-wider">
                        Valor Mensal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-900/80 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white bg-blue-900/80 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-900/30 divide-y divide-blue-400/20">
                    {filteredContracts.map((contract: Contract) => (
                      <tr key={contract.id} className="hover:bg-blue-800/40 transition-colors duration-200 bg-blue-800/20">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <FileText className="text-blue-400 w-5 h-5" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white bg-blue-900/60 px-3 py-1 rounded">{contract.name}</div>
                              <div className="text-sm text-blue-100 bg-blue-800/40 px-3 py-1 rounded mt-1">{contract.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white bg-blue-900/60 px-3 py-1 rounded">{contract.client}</div>
                          <div className="text-sm text-blue-100 bg-blue-800/40 px-3 py-1 rounded mt-1">{contract.contact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getCategoryColor(contract.category)}>
                            {contract.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium text-green-300 bg-blue-900/60 px-3 py-1 rounded">{formatCurrency(contract.monthlyValue)}</div>
                          <div className="text-blue-100 bg-blue-800/40 px-3 py-1 rounded mt-1">Total: {formatCurrency(contract.totalValue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status === 'active' ? 'Ativo' : 
                             contract.status === 'suspended' ? 'Suspenso' : 'Finalizado'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-200 hover:bg-blue-500/20">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-200 hover:bg-yellow-500/20">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-200 hover:bg-red-500/20">
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
        </CardContent>
      </Card>
    </div>
  );
}
