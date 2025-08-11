import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Users, Settings, BarChart3, FileText, AlertTriangle, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetElement?: string;
  position: "top" | "bottom" | "left" | "right";
  content: React.ReactNode;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, userRole }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const adminSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Bem-vindo ao Sistema DRE",
      description: "Vamos te guiar pelas principais funcionalidades do painel administrativo",
      icon: <UserCheck className="w-6 h-6" />,
      position: "bottom",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Este tour interativo vai te ajudar a entender todas as funcionalidades disponíveis 
            no painel administrativo do Sistema DRE.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Sua função:</strong> Administrador - Você tem acesso completo a todas as funcionalidades.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "users",
      title: "Gerenciamento de Usuários",
      description: "Gerencie usuários do sistema com permissões específicas",
      icon: <Users className="w-6 h-6" />,
      targetElement: "#sidebar-users",
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Aqui você pode adicionar, editar e remover usuários do sistema.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Criar</Badge>
              <span className="text-sm">Adicionar novos usuários</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Editar</Badge>
              <span className="text-sm">Alterar permissões e dados</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Excluir</Badge>
              <span className="text-sm">Remover usuários inativos</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "dashboard",
      title: "Dashboard Financeiro",
      description: "Acompanhe KPIs e métricas em tempo real",
      icon: <BarChart3 className="w-6 h-6" />,
      targetElement: "#sidebar-dashboard",
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            O dashboard apresenta uma visão geral das métricas financeiras mais importantes.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-50 p-2 rounded">
              <strong className="text-emerald-800">Receitas</strong><br/>
              Acompanhe entradas
            </div>
            <div className="bg-red-50 p-2 rounded">
              <strong className="text-red-800">Custos</strong><br/>
              Monitore gastos
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <strong className="text-blue-800">Margem</strong><br/>
              Calcule lucros
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <strong className="text-purple-800">Previsões</strong><br/>
              Analise tendências
            </div>
          </div>
        </div>
      )
    },
    {
      id: "contracts",
      title: "Contratos",
      description: "Gerencie contratos e acompanhe performance",
      icon: <FileText className="w-6 h-6" />,
      targetElement: "#sidebar-contracts",
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Controle todos os contratos da empresa e monitore seu desempenho financeiro.
          </p>
          <div className="space-y-2">
            <p className="text-sm"><strong>Funcionalidades:</strong></p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Adicionar novos contratos</li>
              <li>• Acompanhar receitas por contrato</li>
              <li>• Monitorar custos associados</li>
              <li>• Analisar margem de lucro</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "alerts",
      title: "Sistema de Alertas",
      description: "Receba notificações sobre eventos importantes",
      icon: <AlertTriangle className="w-6 h-6" />,
      targetElement: "#sidebar-alerts",
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Mantenha-se informado sobre situações que requerem atenção imediata.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Alertas críticos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Avisos importantes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Informações gerais</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "admin-access",
      title: "Acesso Administrativo",
      description: "Atalho secreto para funções avançadas",
      icon: <Settings className="w-6 h-6" />,
      position: "bottom",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Como administrador, você tem acesso a funcionalidades especiais.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">Atalho Secreto:</p>
            <div className="flex items-center gap-2 bg-white p-2 rounded border">
              <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">Alt</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">A</kbd>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Use este atalho para acessar o painel administrativo completo
            </p>
          </div>
        </div>
      )
    }
  ];

  const viewerSteps: OnboardingStep[] = [
    {
      id: "welcome-viewer",
      title: "Bem-vindo ao Sistema DRE",
      description: "Explore os dados e relatórios disponíveis",
      icon: <UserCheck className="w-6 h-6" />,
      position: "bottom",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Este tour vai te mostrar como navegar e visualizar as informações financeiras.
          </p>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Sua função:</strong> Somente Visualização - Você pode acessar relatórios e dashboards.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "dashboard-viewer",
      title: "Dashboard Financeiro",
      description: "Visualize métricas e KPIs importantes",
      icon: <BarChart3 className="w-6 h-6" />,
      targetElement: "#sidebar-dashboard",
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Acompanhe as principais métricas financeiras da empresa.
          </p>
          <div className="space-y-2">
            <p className="text-sm"><strong>Você pode visualizar:</strong></p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Gráficos de receitas e custos</li>
              <li>• Indicadores de performance</li>
              <li>• Análises de margem</li>
              <li>• Previsões e tendências</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "reports-viewer",
      title: "Relatórios",
      description: "Acesse relatórios detalhados",
      icon: <FileText className="w-6 h-6" />,
      targetElement: "#sidebar-reports",
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Visualize relatórios completos sobre a performance financeira.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Dica:</strong> Use os filtros para personalizar a visualização dos dados
            </p>
          </div>
        </div>
      )
    }
  ];

  const steps = userRole === "edit" ? adminSteps : viewerSteps;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    setIsCompleted(true);
    localStorage.setItem('onboardingCompleted', 'true');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const skipTour = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  if (isCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Parabéns!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">
              Você completou o tour do sistema! Agora está pronto para usar todas as funcionalidades disponíveis.
            </p>
            <Button onClick={onClose} className="w-full">
              Começar a usar o sistema
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStepData.icon}
              <DialogTitle>{currentStepData.title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Step Counter */}
          <div className="text-center">
            <Badge variant="outline">
              {currentStep + 1} de {steps.length}
            </Badge>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader className="pb-3">
              <p className="text-sm text-slate-600">{currentStepData.description}</p>
            </CardHeader>
            <CardContent>
              {currentStepData.content}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center pt-2 border-t">
            <button
              onClick={skipTour}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Pular tour
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;