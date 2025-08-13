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
        <CardContent className="p-6 relative">
          <div className="absolute top-4 right-4">
            <TrendingUp className="text-emerald-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100 mb-2">Receita Total</p>
            <p className="text-2xl font-bold text-white mb-2">
              {formatCurrency((kpiData as any)?.totalRevenue || 0)}
            </p>
            <p className="text-sm text-emerald-400 flex items-center">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span>+{formatPercent((kpiData as any)?.revenueGrowth || 0)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-blue-200/20">
        <CardContent className="p-6 relative">
          <div className="absolute top-4 right-4">
            <Wallet className="text-red-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100 mb-2">Custos Operacionais</p>
            <p className="text-2xl font-bold text-white mb-2">
              {formatCurrency((kpiData as any)?.totalCosts || 0)}
            </p>
            <p className="text-sm text-red-400 flex items-center">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span>+{formatPercent((kpiData as any)?.costIncrease || 0)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-blue-200/20">
        <CardContent className="p-6 relative">
          <div className="absolute top-4 right-4">
            <Percent className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100 mb-2">Margem de Lucro</p>
            <p className="text-2xl font-bold text-white mb-2">
              {formatPercent((kpiData as any)?.profitMargin || 0)}
            </p>
            <p className="text-sm text-emerald-400 flex items-center">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span>+{formatPercent((kpiData as any)?.marginImprovement || 0)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-blue-200/20">
        <CardContent className="p-6 relative">
          <div className="absolute top-4 right-4">
            <Handshake className="text-amber-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100 mb-2">Contratos Ativos</p>
            <p className="text-2xl font-bold text-white mb-2">
              {(kpiData as any)?.activeContracts || 0}
            </p>
            <p className="text-sm text-amber-400 flex items-center">
              <Minus className="w-4 h-4 mr-1" />
              <span>2 renovações pendentes</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
