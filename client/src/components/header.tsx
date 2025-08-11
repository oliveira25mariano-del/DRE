import { Bell, User, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
  });
  
  const [userName, setUserName] = useState("João Silva");
  const [userRole, setUserRole] = useState("Administrador");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toast } = useToast();

  const unreadAlerts = alerts.filter((alert: any) => !alert.read);
  const criticalAlerts = unreadAlerts.filter((alert: any) => alert.severity === "critical");

  const handleProfileSave = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
    setIsProfileOpen(false);
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <header className="bg-slate-800/90 shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-white">Dashboard Financeiro</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-slate-700/80 text-white">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Badge>
            <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse" title="Sistema Online"></div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Botão de Notificações */}
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700/80 rounded-full transition-colors duration-200"
            >
              <Bell className="w-5 h-5" />
              {criticalAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {criticalAlerts.length}
                </span>
              )}
            </button>
            
            {/* Dropdown de Notificações */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Notificações</h3>
                  {alerts.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {alerts.slice(0, 5).map((alert: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{alert.title}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{alert.message}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">Nenhuma notificação no momento</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Perfil do Usuário */}
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-700/50 rounded-lg p-2 transition-colors">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{userName}</div>
                  <div className="text-xs text-slate-300">{userRole}</div>
                </div>
                <div className="w-10 h-10 bg-slate-700/80 rounded-full flex items-center justify-center">
                  <User className="text-white w-5 h-5" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Cargo</Label>
                  <Input
                    id="role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleProfileSave}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
