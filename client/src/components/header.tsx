import { Bell, User, Settings, Camera, Upload, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ThemeCustomizer from "./theme-customizer";

interface HeaderProps {
  onLogout?: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
  });
  
  const [userName, setUserName] = useState("Nome do Usuário");
  const [userRole, setUserRole] = useState("Administrador(a)");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Carregar dados do perfil na inicialização
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserName(profile.name);
      setUserRole(profile.role);
      setProfilePhoto(profile.photo || null);
    }
  }, []);

  // Escutar mudanças de perfil
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const profile = event.detail;
      if (profile) {
        setUserName(profile.name);
        setUserRole(profile.role);
        setProfilePhoto(profile.photo || null);
      } else {
        // Perfil foi limpo (logout)
        setUserName("Nome do Usuário");
        setUserRole("Administrador(a)");
        setProfilePhoto(null);
      }
    };

    window.addEventListener('userProfileUpdate', handleProfileUpdate as EventListener);
    return () => window.removeEventListener('userProfileUpdate', handleProfileUpdate as EventListener);
  }, []);

  // Atualizar data e hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Salvar dados do perfil no localStorage
  const saveProfileToStorage = (name: string, role: string, photo: string | null) => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const existingProfile = JSON.parse(savedProfile);
      const profile = { 
        ...existingProfile,
        name, 
        role, 
        photo,
        loginTime: existingProfile.loginTime 
      };
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  };

  const unreadAlerts = (alerts as any[]).filter((alert: any) => !alert.read);
  const criticalAlerts = unreadAlerts.filter((alert: any) => alert.severity === "critical");

  const handleProfileSave = () => {
    saveProfileToStorage(userName, userRole, profilePhoto);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    if (onLogout) {
      setTimeout(() => {
        onLogout();
      }, 100);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Arquivo muito grande",
          description: "A foto deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-slate-800/90 shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <div className="text-lg font-medium">
                {currentDateTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                }).replace(/^\w/, c => c.toUpperCase())}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-white font-mono text-lg font-semibold">
                {currentDateTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </span>
              <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse" title="Sistema Online"></div>
            </div>
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
                  {(alerts as any[]).length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(alerts as any[]).slice(0, 5).map((alert: any, index: number) => (
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

          {/* Botão de Configurações */}
          <button
            onClick={() => setIsThemeCustomizerOpen(true)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Personalizar Interface"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Perfil do Usuário */}
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-700/50 rounded-lg p-2 transition-colors">
                <div className="text-right">
                  <div className="text-sm font-medium text-white" key={userName}>{userName}</div>
                  <div className="text-xs text-slate-300" key={userRole}>
                    {userRole === "edit" ? "Administrador(a)" : "Somente Visualização"}
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-700/80 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Foto do perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-white w-5 h-5" />
                  )}
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescription>
                  Atualize suas informações pessoais e foto de perfil.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                {/* Foto de Perfil */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt="Foto do perfil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Foto
                    </Button>
                    {profilePhoto && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemovePhoto}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Campos de texto */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="col-span-3"
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Cargo</Label>
                  <Input
                    id="role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="col-span-3"
                    placeholder="Ex: Administrador(a), Gerente, etc."
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleProfileSave}>
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Theme Customizer */}
          <ThemeCustomizer
            isOpen={isThemeCustomizerOpen}
            onClose={() => setIsThemeCustomizerOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
