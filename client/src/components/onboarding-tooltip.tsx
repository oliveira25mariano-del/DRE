import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";

interface OnboardingTooltipProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  position: "top" | "bottom" | "left" | "right";
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  targetElement?: string;
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  title,
  description,
  icon,
  position,
  onNext,
  onSkip,
  currentStep,
  totalSteps,
  targetElement
}) => {
  // Calcular posição do tooltip baseado no elemento target
  const getTooltipPosition = () => {
    if (!targetElement) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    
    // Em uma implementação real, você calcularia a posição baseada no elemento DOM
    // Por agora, usaremos posições fixas para demonstração
    const positions = {
      top: { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "10px" },
      bottom: { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "10px" },
      left: { right: "100%", top: "50%", transform: "translateY(-50%)", marginRight: "10px" },
      right: { left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: "10px" }
    };
    
    return positions[position];
  };

  return (
    <div 
      className="absolute z-50"
      style={getTooltipPosition()}
    >
      <Card className="w-80 shadow-lg border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {currentStep + 1} de {totalSteps}
            </span>
            <Button
              size="sm"
              onClick={onNext}
              className="h-8"
            >
              {currentStep === totalSteps - 1 ? "Finalizar" : "Próximo"}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Seta indicativa */}
      <div className={`absolute w-0 h-0 ${
        position === "top" ? "border-l-8 border-r-8 border-b-8 border-transparent border-b-white -bottom-2 left-1/2 transform -translate-x-1/2" :
        position === "bottom" ? "border-l-8 border-r-8 border-t-8 border-transparent border-t-white -top-2 left-1/2 transform -translate-x-1/2" :
        position === "left" ? "border-t-8 border-b-8 border-r-8 border-transparent border-r-white -right-2 top-1/2 transform -translate-y-1/2" :
        "border-t-8 border-b-8 border-l-8 border-transparent border-l-white -left-2 top-1/2 transform -translate-y-1/2"
      }`} />
    </div>
  );
};

export default OnboardingTooltip;