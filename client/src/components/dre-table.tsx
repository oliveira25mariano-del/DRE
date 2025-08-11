import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useState } from "react";

export default function DRETable() {
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedMonth] = useState(new Date().getMonth() + 1);

  const { data: dreData, isLoading } = useQuery({
    queryKey: ["/api/analytics/dre", selectedYear, selectedMonth],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getVarianceColor = (value: number) => {
    if (value > 0) return "text-emerald-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-blue-200/20">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 bg-white/5 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-blue-200/20">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Demonstrativo do Resultado do Exercício (DRE)
            </CardTitle>
            <p className="text-sm text-blue-200">Análise comparativa: Orçado vs Realizado</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select defaultValue={`${selectedMonth}`}>
              <SelectTrigger className="w-40 bg-blue-600/30 border-blue-400/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={`${i + 1}`}>
                    {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-blue-400/30 text-white hover:bg-blue-600/30">
              <Download className="w-4 h-4 mr-2" />
              Exportar DRE
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-blue-400/30">
                <th className="text-left py-3 px-4 font-semibold text-blue-100">Descrição</th>
                <th className="text-right py-3 px-4 font-semibold text-blue-100">Orçado (R$)</th>
                <th className="text-right py-3 px-4 font-semibold text-blue-100">Realizado (R$)</th>
                <th className="text-right py-3 px-4 font-semibold text-blue-100">Variação (R$)</th>
                <th className="text-right py-3 px-4 font-semibold text-blue-100">Variação (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-400/20">
              <tr className="bg-blue-500/20">
                <td className="py-3 px-4 font-semibold text-white">RECEITA OPERACIONAL BRUTA</td>
                <td className="py-3 px-4 text-right font-medium text-white">
                  {formatCurrency(dreData?.revenue?.budgeted || 0)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-white">
                  {formatCurrency(dreData?.revenue?.actual || 0)}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${getVarianceColor(dreData?.revenue?.variance || 0)}`}>
                  {dreData?.revenue?.variance > 0 ? '+' : ''}{formatCurrency(dreData?.revenue?.variance || 0)}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${getVarianceColor(dreData?.revenue?.variancePercent || 0)}`}>
                  {dreData?.revenue?.variancePercent > 0 ? '+' : ''}{formatPercent(dreData?.revenue?.variancePercent || 0)}
                </td>
              </tr>

              <tr className="bg-red-500/20">
                <td className="py-3 px-4 font-semibold text-white">(-) CUSTOS OPERACIONAIS</td>
                <td className="py-3 px-4 text-right font-medium text-white">
                  ({formatCurrency(dreData?.costs?.budgeted || 0)})
                </td>
                <td className="py-3 px-4 text-right font-medium text-white">
                  ({formatCurrency(dreData?.costs?.actual || 0)})
                </td>
                <td className={`py-3 px-4 text-right font-medium ${getVarianceColor(-(dreData?.costs?.variance || 0))}`}>
                  {dreData?.costs?.variance > 0 ? '-' : '+'}{formatCurrency(Math.abs(dreData?.costs?.variance || 0))}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${getVarianceColor(-(dreData?.costs?.variancePercent || 0))}`}>
                  {dreData?.costs?.variancePercent > 0 ? '-' : '+'}{formatPercent(Math.abs(dreData?.costs?.variancePercent || 0))}
                </td>
              </tr>

              <tr className="bg-emerald-500/20 border-t-2 border-emerald-400/30">
                <td className="py-4 px-4 font-bold text-xl text-white">LUCRO LÍQUIDO</td>
                <td className="py-4 px-4 text-right font-bold text-xl text-white">
                  {formatCurrency(dreData?.profit?.budgeted || 0)}
                </td>
                <td className="py-4 px-4 text-right font-bold text-xl text-emerald-400">
                  {formatCurrency(dreData?.profit?.actual || 0)}
                </td>
                <td className="py-4 px-4 text-right font-bold text-xl text-emerald-400">
                  +{formatCurrency((dreData?.profit?.actual || 0) - (dreData?.profit?.budgeted || 0))}
                </td>
                <td className="py-4 px-4 text-right font-bold text-xl text-emerald-400">
                  +{formatPercent(dreData?.profit?.margin || 0)}
                </td>
              </tr>

              <tr className="bg-blue-400/20 border-t border-blue-300/30">
                <td className="py-3 px-4 font-semibold text-blue-100">MARGEM LÍQUIDA (%)</td>
                <td className="py-3 px-4 text-right font-semibold text-blue-100">
                  {formatPercent((dreData?.profit?.budgeted || 0) / (dreData?.revenue?.budgeted || 1) * 100)}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                  {formatPercent(dreData?.profit?.margin || 0)}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                  +{formatPercent(Math.abs(dreData?.profit?.margin || 0) - Math.abs((dreData?.profit?.budgeted || 0) / (dreData?.revenue?.budgeted || 1) * 100))}pp
                </td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                  +{formatPercent(5.3)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
