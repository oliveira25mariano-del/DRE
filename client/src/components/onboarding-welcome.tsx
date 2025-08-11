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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Bem-vindo ao Sistema DRE!</CardTitle>
            <p className="text-slate-600 text-sm">Olá, {userName}! Que tal conhecer o sistema?</p>
          </div>
          <Badge 
            variant={userRole === "edit" ? "default" : "secondary"}
            className="inline-flex"
          >
            {userRole === "edit" ? "🔧 Administrador" : "👁️ Visualização"}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-medium text-sm">Tour Guiado</h3>
            </div>
            
            <div className="space-y-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-medium text-sm">Dicas Práticas</h3>
            </div>
            
            <div className="space-y-1">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-sm">Passo a Passo</h3>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">Você vai aprender:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {userRole === "edit" ? (
                <>
                  <li>• Cadastrar contratos e receitas</li>
                  <li>• Visualizar indicadores financeiros</li>
                  <li>• Usar alertas e acompanhamento</li>
                  <li>• Práticas de entrada de dados</li>
                </>
              ) : (
                <>
                  <li>• Navegar pelos dashboards</li>
                  <li>• Visualizar indicadores</li>
                  <li>• Analisar métricas</li>
                  <li>• Interpretar relatórios</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onStartTour}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-9"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Iniciar Tour
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1 h-9"
              size="sm"
            >
              Pular
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Acesse novamente pelo botão "Tour do Sistema" no menu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWelcome;