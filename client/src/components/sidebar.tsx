import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  Users, 
  UserPlus, 
  Brain, 
  Search, 
  Bell, 
  FileBarChart,
  DollarSign,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import opusLogo from "@assets/Logo-Grupo-Opus_1754948245317.png";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3, id: "sidebar-dashboard" },
  { path: "/contracts", label: "Contratos", icon: FileText, id: "sidebar-contracts" },
  { path: "/glosas", label: "Glosas", icon: AlertTriangle, id: "sidebar-glosas" },
  { path: "/moe", label: "MOE", icon: Users, id: "sidebar-moe" },
  { path: "/fringe", label: "Fringe Benefits", icon: UserPlus, id: "sidebar-fringe" },
];

const analysisItems = [
  { path: "/predictions", label: "Previsões ML", icon: Brain, id: "sidebar-predictions" },
  { path: "/audit", label: "Auditoria", icon: Search, id: "sidebar-audit" },
  { path: "/alerts", label: "Alertas", icon: Bell, id: "sidebar-alerts" },
  { path: "/billing", label: "Faturamento", icon: DollarSign, id: "sidebar-billing" },
  { path: "/reports", label: "Relatórios", icon: FileBarChart, id: "sidebar-reports" },
];

interface SidebarProps {
  onStartOnboarding?: () => void;
}

export default function Sidebar({ onStartOnboarding }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="w-64 sidebar-gradient shadow-xl">
      <div className="p-6">
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="flex items-center justify-center w-full">
            <img 
              src={opusLogo} 
              alt="Grupo Opus" 
              className="h-14 w-auto max-w-[180px]"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium">DRE - Gestão Financeira</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 py-2">
          <h3 className="text-blue-200 text-xs font-semibold uppercase tracking-wide">
            Menu Principal
          </h3>
        </div>
        <ul className="mt-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path} id={item.id}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center px-6 py-3 transition-colors duration-200",
                    isActive 
                      ? "text-white bg-blue-700 border-r-4 border-blue-400" 
                      : "text-blue-200 hover:bg-blue-700 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-6 py-2 mt-8">
          <h3 className="text-blue-200 text-xs font-semibold uppercase tracking-wide">
            Análise & Relatórios
          </h3>
        </div>
        <ul className="mt-2 space-y-1">
          {analysisItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path} id={item.id}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center px-6 py-3 transition-colors duration-200",
                    isActive 
                      ? "text-white bg-blue-700 border-r-4 border-blue-400" 
                      : "text-blue-200 hover:bg-blue-700 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Botão de Ajuda/Onboarding */}
        <div className="px-6 py-4 mt-8 border-t border-blue-700">
          <Button
            onClick={onStartOnboarding}
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-blue-400 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Tour do Sistema
          </Button>
        </div>
      </nav>
    </div>
  );
}
