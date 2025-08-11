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
  FileBarChart 
} from "lucide-react";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/contracts", label: "Contratos", icon: FileText },
  { path: "/glosas", label: "Glosas", icon: AlertTriangle },
  { path: "/moe", label: "MOE", icon: Users },
  { path: "/fringe", label: "Fringe Benefits", icon: UserPlus },
];

const analysisItems = [
  { path: "/predictions", label: "Previsões ML", icon: Brain },
  { path: "/audit", label: "Auditoria", icon: Search },
  { path: "/alerts", label: "Alertas", icon: Bell },
  { path: "/reports", label: "Relatórios", icon: FileBarChart },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 sidebar-gradient shadow-xl">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BarChart3 className="text-white text-xl w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sistema DRE</h1>
            <p className="text-blue-200 text-sm">Gestão Financeira</p>
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
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={cn(
                    "flex items-center px-6 py-3 transition-colors duration-200",
                    isActive 
                      ? "text-white bg-blue-700 border-r-4 border-blue-400" 
                      : "text-blue-200 hover:bg-blue-700 hover:text-white"
                  )}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </a>
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
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={cn(
                    "flex items-center px-6 py-3 transition-colors duration-200",
                    isActive 
                      ? "text-white bg-blue-700 border-r-4 border-blue-400" 
                      : "text-blue-200 hover:bg-blue-700 hover:text-white"
                  )}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
