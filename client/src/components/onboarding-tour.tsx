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
      id: "data-input",
      title: "Entrada de Dados",
      description: "Como inserir e organizar informações financeiras",
      icon: <Users className="w-6 h-6" />,
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Aprenda as melhores práticas para cadastrar dados financeiros no sistema.
          </p>
          <div className="space-y-3">
            <div className="bg-cyan-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-cyan-900 mb-2">🎯 Fluxo Recomendado</p>
              <ol className="text-xs text-cyan-800 space-y-1 list-decimal list-inside">
                <li>Cadastre o contrato principal</li>
                <li>Configure tipos de receita</li>
                <li>Registre custos mensais</li>
                <li>Acompanhe indicadores</li>
              </ol>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-orange-900 mb-2">⚠️ Dicas Importantes</p>
              <ul className="text-xs text-orange-800 space-y-1">
                <li>• Use datas consistentes</li>
                <li>• Categorize custos corretamente</li>
                <li>• Revise dados antes de salvar</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "dashboard",
      title: "Dashboard Financeiro",
      description: "Visualize indicadores e cadastre novos dados",
      icon: <BarChart3 className="w-6 h-6" />,
      targetElement: "#sidebar-dashboard",
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            O dashboard combina visualização de indicadores com funcionalidades de cadastro rápido.
          </p>
          <div className="space-y-3">
            <div className="bg-teal-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-teal-900 mb-2">📈 Indicadores em Tempo Real</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded border">
                  <strong className="text-emerald-700">Receitas</strong><br/>
                  <span className="text-emerald-600">Totais mensais</span>
                </div>
                <div className="bg-white p-2 rounded border">
                  <strong className="text-red-700">Custos</strong><br/>
                  <span className="text-red-600">Por categoria</span>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-indigo-900 mb-2">⚡ Cadastros Rápidos</p>
              <ul className="text-xs text-indigo-800 space-y-1">
                <li>• Botões de ação direta nos cards</li>
                <li>• Formulários simplificados</li>
                <li>• Validação automática</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "contracts",
      title: "Contratos",
      description: "Cadastre contratos e acompanhe indicadores",
      icon: <FileText className="w-6 h-6" />,
      targetElement: "#sidebar-contracts",
      position: "right",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Gerencie o cadastro completo de contratos e visualize indicadores de performance.
          </p>
          <div className="space-y-3">
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-amber-900 mb-2">📝 Como Cadastrar</p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Clique em "Novo Contrato"</li>
                <li>• Preencha dados do cliente</li>
                <li>• Defina valores e prazos</li>
                <li>• Configure tipos de receita</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-2">📊 Indicadores Disponíveis</p>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Receita total por contrato</li>
                <li>• Margem de contribuição</li>
                <li>• Status de pagamentos</li>
                <li>• Performance vs orçado</li>
              </ul>
            </div>
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
      id: "data-management",
      title: "Gestão de Dados",
      description: "Como gerenciar informações e cadastros no sistema",
      icon: <Settings className="w-6 h-6" />,
      position: "bottom",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Como administrador, você pode gerenciar todos os dados do sistema de forma segura e eficiente.
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">📊 Cadastros Financeiros</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Registrar novos contratos</li>
                <li>• Adicionar receitas mensais</li>
                <li>• Lançar custos operacionais</li>
                <li>• Configurar orçamentos</li>
              </ul>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">📈 Indicadores de Performance</p>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Margem de lucro por contrato</li>
                <li>• Evolução mensal de receitas</li>
                <li>• Análise de custos variáveis</li>
                <li>• Projeções financeiras</li>
              </ul>
            </div>
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStepData.icon}
              <DialogTitle className="text-lg">{currentStepData.title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-slate-500 hover:text-slate-700 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center gap-3 pt-2">
            {/* Progress Bar */}
            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            {/* Step Counter */}
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {currentStep + 1}/{steps.length}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Step Content */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-700 mb-3">{currentStepData.description}</p>
            <div className="text-sm">
              {currentStepData.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              size="sm"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              Anterior
            </Button>

            <button
              onClick={skipTour}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Pular
            </button>

            <Button
              onClick={nextStep}
              size="sm"
              className="flex items-center gap-1"
            >
              {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;