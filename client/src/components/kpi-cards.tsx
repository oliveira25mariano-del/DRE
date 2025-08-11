import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, Percent, Handshake, ArrowUp, ArrowDown, Minus } from "lucide-react";

export default function KPICards() {
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ["/api/analytics/kpis"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-effect animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-white/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="glass-effect border-blue-200/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Receita Total</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(kpiData?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-emerald-400 flex items-center mt-1">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>+{formatPercent(kpiData?.revenueGrowth || 0)}</span>
              </p>
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
              <p className="text-sm font-medium text-blue-100">Custos Operacionais</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(kpiData?.totalCosts || 0)}
              </p>
              <p className="text-sm text-red-400 flex items-center mt-1">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>+{formatPercent(kpiData?.costIncrease || 0)}</span>
              </p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-full">
              <Wallet className="text-red-400 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-blue-200/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Margem de Lucro</p>
              <p className="text-2xl font-bold text-white">
                {formatPercent(kpiData?.profitMargin || 0)}
              </p>
              <p className="text-sm text-emerald-400 flex items-center mt-1">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>+{formatPercent(kpiData?.marginImprovement || 0)}</span>
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Percent className="text-blue-400 w-6 h-6" />
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
                {kpiData?.activeContracts || 0}
              </p>
              <p className="text-sm text-amber-400 flex items-center mt-1">
                <Minus className="w-4 h-4 mr-1" />
                <span>2 renovações pendentes</span>
              </p>
            </div>
            <div className="bg-amber-500/20 p-3 rounded-full">
              <Handshake className="text-amber-400 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
