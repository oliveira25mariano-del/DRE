import { useState } from "react";
import { exportUtils } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Download, Eye, FileSearch, History, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Audit() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const { toast } = useToast();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
  });

  const filteredLogs = auditLogs.filter((log: any) => {
    const matchesSearch = log.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = !selectedTable || log.tableName === selectedTable;
    const matchesOperation = !selectedOperation || log.operation === selectedOperation;
    const matchesUser = !selectedUser || log.userId === selectedUser;
    
    return matchesSearch && matchesTable && matchesOperation && matchesUser;
  });

  const getOperationColor = (operation: string) => {
    switch (operation.toUpperCase()) {
      case "POST": return "bg-green-500/20 text-green-300";
      case "PUT": return "bg-yellow-500/20 text-yellow-300";
      case "DELETE": return "bg-red-500/20 text-red-300";
      default: return "bg-blue-500/20 text-blue-300";
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation.toUpperCase()) {
      case "POST": return "➕";
      case "PUT": return "✏️";
      case "DELETE": return "🗑️";
      default: return "👁️";
    }
  };

  const formatJsonData = (data: any) => {
    if (!data) return "N/A";
    return JSON.stringify(data, null, 2);
  };

  const totalOperations = filteredLogs.length;
  const recentOperations = filteredLogs.filter((log: any) => {
    const logDate = new Date(log.timestamp);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return logDate > oneDayAgo;
  }).length;

  const uniqueUsers = Array.from(new Set(auditLogs.map((log: any) => log.userId))).length;
  const uniqueTables = Array.from(new Set(auditLogs.map((log: any) => log.tableName)));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <FileSearch className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Total de Operações</p>
              <p className="text-2xl font-bold text-white">{totalOperations.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <History className="text-emerald-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Últimas 24h</p>
              <p className="text-2xl font-bold text-white">{recentOperations}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <FileSearch className="text-purple-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Usuários Ativos</p>
              <p className="text-2xl font-bold text-white">{uniqueUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6 relative">
            <div className="absolute top-4 right-4">
              <AlertCircle className="text-amber-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Tabelas Monitoradas</p>
              <p className="text-2xl font-bold text-white">{uniqueTables.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect border-blue-200/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <FileSearch className="w-5 h-5 mr-2" />
                Sistema de Auditoria
              </CardTitle>
              <p className="text-sm text-blue-200">
                Trilha completa de alterações com histórico detalhado
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <History className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-400/30 text-white hover:bg-blue-600/30"
                onClick={async () => {
                  const exportData = filteredLogs.map((log: any) => ({
                    "Data/Hora": format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
                    "Tabela": log.tableName,
                    "Operação": log.operation,
                    "Usuário": log.userId,
                    "Registro ID": log.recordId,
                    "Dados Anteriores": log.oldData ? JSON.stringify(log.oldData) : "N/A",
                    "Dados Novos": log.newData ? JSON.stringify(log.newData) : "N/A"
                  }));

                  try {
                    await exportUtils.showExportModal(
                      exportData,
                      `logs_auditoria`,
                      'audit-logs-content',
                      {
                        title: 'Relatório de Logs de Auditoria',
                        subtitle: `Total de ${filteredLogs.length} registros - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
                        orientation: 'landscape'
                      }
                    );

                    toast({
                      title: "Logs Exportados",
                      description: `Relatório de auditoria exportado com ${filteredLogs.length} registros`,
                    });
                  } catch (error) {
                    toast({
                      title: "Erro na Exportação",
                      description: "Erro ao exportar logs. Tente novamente.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Logs
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
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-600/30 border-blue-400/30 text-white placeholder:text-blue-200"
              />
            </div>
            
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todas as tabelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tabelas</SelectItem>
                {uniqueTables.map((table: string) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedOperation} onValueChange={setSelectedOperation}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todas as operações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as operações</SelectItem>
                <SelectItem value="POST">Criação (POST)</SelectItem>
                <SelectItem value="PUT">Atualização (PUT)</SelectItem>
                <SelectItem value="DELETE">Exclusão (DELETE)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue placeholder="Todos os usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {Array.from(new Set(auditLogs.map((log: any) => log.userId))).map((user: string) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-blue-400/10 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-blue-200 mt-2">Carregando logs de auditoria...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-blue-200">
                <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log de auditoria encontrado</p>
              </div>
            ) : (
              <div id="audit-logs-content" className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-400/20">
                  <thead className="bg-blue-500/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Operação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Tabela
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-400/5 divide-y divide-blue-400/10">
                    {filteredLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-blue-400/10 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                          {log.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getOperationColor(log.operation)}>
                            {getOperationIcon(log.operation)} {log.operation}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {log.tableName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                          {log.recordId.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-blue-300 hover:text-blue-100">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl bg-blue-bg border-blue-400/30">
                              <DialogHeader>
                                <DialogTitle className="text-white">Detalhes do Log de Auditoria</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-blue-100 mb-2">Informações Gerais</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-blue-200">Data/Hora:</span>
                                        <span className="text-white">
                                          {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-blue-200">Usuário:</span>
                                        <span className="text-white">{log.userId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-blue-200">Operação:</span>
                                        <Badge className={getOperationColor(log.operation)}>
                                          {log.operation}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-blue-200">Tabela:</span>
                                        <span className="text-white">{log.tableName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-blue-200">ID do Registro:</span>
                                        <span className="text-white font-mono text-xs">{log.recordId}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {log.oldData && (
                                  <div>
                                    <h4 className="text-sm font-medium text-blue-100 mb-2">Dados Anteriores</h4>
                                    <pre className="bg-blue-600/30 p-4 rounded-lg text-xs text-white overflow-x-auto">
                                      {formatJsonData(log.oldData)}
                                    </pre>
                                  </div>
                                )}
                                
                                {log.newData && (
                                  <div>
                                    <h4 className="text-sm font-medium text-blue-100 mb-2">Novos Dados</h4>
                                    <pre className="bg-blue-600/30 p-4 rounded-lg text-xs text-white overflow-x-auto">
                                      {formatJsonData(log.newData)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
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
