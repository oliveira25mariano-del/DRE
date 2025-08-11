import { Bell, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const unreadAlerts = alerts.filter((alert: any) => !alert.read);
  const criticalAlerts = unreadAlerts.filter((alert: any) => alert.severity === "critical");

  return (
    <header className="bg-blue-600/80 shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-white">Dashboard Financeiro</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-500/70 text-white">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Badge>
            <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse" title="Sistema Online"></div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-blue-200 hover:text-white hover:bg-blue-500/70 rounded-full transition-colors duration-200">
            <Bell className="w-5 h-5" />
            {criticalAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {criticalAlerts.length}
              </span>
            )}
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">João Silva</div>
              <div className="text-xs text-blue-200">Administrador</div>
            </div>
            <div className="w-10 h-10 bg-blue-500/70 rounded-full flex items-center justify-center">
              <User className="text-white w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
