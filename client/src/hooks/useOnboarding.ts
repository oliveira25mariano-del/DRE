import { useState, useEffect } from "react";

interface UseOnboardingReturn {
  shouldShowOnboarding: boolean;
  showOnboarding: () => void;
  hideOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboarding = (userId?: string): UseOnboardingReturn => {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    // Verificar se o onboarding já foi completado
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    const userCompletedKey = userId ? `onboarding_${userId}` : 'onboarding_general';
    const userOnboardingCompleted = localStorage.getItem(userCompletedKey);
    
    // Se não foi completado, mostrar onboarding
    if (!onboardingCompleted && !userOnboardingCompleted) {
      // Delay para garantir que a interface está carregada
      setTimeout(() => {
        setShouldShowOnboarding(true);
      }, 1500);
    }
  }, [userId]);

  const showOnboarding = () => {
    setShouldShowOnboarding(true);
  };

  const hideOnboarding = () => {
    setShouldShowOnboarding(false);
    // Marcar como completado para este usuário específico
    if (userId) {
      localStorage.setItem(`onboarding_${userId}`, 'true');
    }
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    if (userId) {
      localStorage.removeItem(`onboarding_${userId}`);
    }
    setShouldShowOnboarding(true);
  };

  return {
    shouldShowOnboarding,
    showOnboarding,
    hideOnboarding,
    resetOnboarding
  };
};