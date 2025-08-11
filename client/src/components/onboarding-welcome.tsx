import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OnboardingWelcomeProps {
  userName: string;
  userRole: string;
  onStartTour: () => void;
  onSkip: () => void;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  userName,
  userRole,
  onStartTour,
  onSkip
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Bem-vindo ao Sistema DRE!</CardTitle>
            <p className="text-slate-600 mt-2">Olá, {userName}! Que tal conhecer o sistema?</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <Badge 
              variant={userRole === "edit" ? "default" : "secondary"}
              className="mb-4"
            >
              {userRole === "edit" ? "🔧 Administrador" : "👁️ Visualização"}
            </Badge>
            <p className="text-sm text-slate-600">
              {userRole === "edit" 
                ? "Você tem acesso completo a todas as funcionalidades administrativas." 
                : "Você pode visualizar relatórios e dashboards do sistema."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium">Tour Guiado</h3>
              <p className="text-xs text-slate-600">
                Conheça cada funcionalidade do sistema
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Dicas Interativas</h3>
              <p className="text-xs text-slate-600">
                Aprenda as melhores práticas de uso
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <ArrowRight className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium">Passo a Passo</h3>
              <p className="text-xs text-slate-600">
                Navegação guiada por todas as áreas
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">O que você vai aprender:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {userRole === "edit" ? (
                <>
                  <li>• Como cadastrar contratos e receitas</li>
                  <li>• Navegação pelos indicadores financeiros</li>
                  <li>• Sistema de alertas e acompanhamento</li>
                  <li>• Melhores práticas de entrada de dados</li>
                </>
              ) : (
                <>
                  <li>• Como navegar pelos dashboards</li>
                  <li>• Visualização de indicadores financeiros</li>
                  <li>• Análise de métricas e performance</li>
                  <li>• Interpretação de gráficos e relatórios</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onStartTour}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Iniciar Tour
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              Pular por agora
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Você pode acessar este tour novamente clicando em "Tour do Sistema" no menu lateral.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWelcome;