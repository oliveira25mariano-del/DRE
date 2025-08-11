import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, UserPlus, Calculator, TrendingUp } from "lucide-react";
import { type Employee } from "@shared/schema";

export default function Fringe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState("");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const filteredEmployees = employees.filter((employee: Employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContract = !selectedContract || employee.contractId === selectedContract;
    
    return matchesSearch && matchesContract;
  });

  const activeEmployees = filteredEmployees.filter((emp: Employee) => emp.active);
  
  const totalFringeBenefits = activeEmployees.reduce((sum, emp) => {
    const baseSalary = parseFloat(emp.baseSalary || "0");
    const fringeRate = parseFloat(emp.fringeRate || "0");
    return sum + (baseSalary * (fringeRate / 100));
  }, 0);

  const averageFringeRate = activeEmployees.length > 0
    ? activeEmployees.reduce((sum, emp) => sum + parseFloat(emp.fringeRate || "0"), 0) / activeEmployees.length
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculateFringeBenefits = (baseSalary: string, fringeRate: string) => {
    const salary = parseFloat(baseSalary || "0");
    const rate = parseFloat(fringeRate || "0");
    return salary * (rate / 100);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Fringe Benefits</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalFringeBenefits)}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-full">
                <UserPlus className="text-purple-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Taxa Média</p>
                <p className="text-2xl font-bold text-white">{averageFringeRate.toFixed(1)}%</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <TrendingUp className="text-emerald-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Colaboradores</p>
                <p className="text-2xl font-bold text-white">{activeEmployees.length}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <UserPlus className="text-blue-400 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-200/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Contratos Ativos</p>
                <p className="text-2xl font-bold text-white">
                  {Array.from(new Set(activeEmployees.map(emp => emp.contractId))).length}
                </p>
              </div>
              <div className="bg-amber-500/20 p-3 rounded-full">
                <Calculator className="text-amber-400 w-6 h-6" />
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
                <UserPlus className="w-5 h-5 mr-2" />
                Fringe Benefits por Colaborador
              </CardTitle>
              <p className="text-sm text-blue-200">Cálculo de benefícios complementares por colaborador</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Calculator className="w-4 h-4 mr-2" />
                Recalcular Benefícios
              </Button>
              <Button variant="outline" className="border-blue-400/30 text-white hover:bg-blue-600/30">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                {contracts.map((contract: any) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    {contract.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fringe Benefits Table */}
          <div className="bg-blue-400/10 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-blue-200 mt-2">Carregando dados...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-blue-200">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                        Salário Base
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Taxa Fringe (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Valor Fringe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-400/5 divide-y divide-blue-400/10">
                    {filteredEmployees.map((employee: Employee) => {
                      const contract = contracts.find((c: any) => c.id === employee.contractId);
                      const baseSalary = parseFloat(employee.baseSalary || "0");
                      const fringeRate = parseFloat(employee.fringeRate || "0");
                      const fringeValue = calculateFringeBenefits(employee.baseSalary || "0", employee.fringeRate || "0");
                      const totalCompensation = baseSalary + fringeValue;
                      
                      return (
                        <tr key={employee.id} className="hover:bg-blue-400/10 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                  <UserPlus className="text-purple-400 w-5 h-5" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{employee.name}</div>
                                <div className="text-sm text-blue-200">{employee.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{contract?.name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCurrency(baseSalary)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-blue-500/20 text-blue-300">
                              {fringeRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-400">
                            {formatCurrency(fringeValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                            {formatCurrency(totalCompensation)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={employee.active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                              {employee.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Footer */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-500/20 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-blue-200">Total Salários Base</p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(activeEmployees.reduce((sum, emp) => sum + parseFloat(emp.baseSalary || "0"), 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-200">Total Fringe Benefits</p>
              <p className="text-lg font-bold text-purple-400">
                {formatCurrency(totalFringeBenefits)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-200">Custo Total com Pessoal</p>
              <p className="text-lg font-bold text-green-400">
                {formatCurrency(
                  activeEmployees.reduce((sum, emp) => sum + parseFloat(emp.baseSalary || "0"), 0) + totalFringeBenefits
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
