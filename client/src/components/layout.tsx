import Sidebar from "./sidebar";
import Header from "./header";
import { useAdminShortcut } from "./secret-admin-access";
import OnboardingTour from "./onboarding-tour";
import OnboardingWelcome from "./onboarding-welcome";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  // Ativar atalho secreto para painel administrativo
  useAdminShortcut();

  // Estados para o onboarding
  const [userRole, setUserRole] = useState<string>("view_only");
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  
  // Hook do onboarding
  const { shouldShowOnboarding, hideOnboarding, showOnboarding } = useOnboarding(userId);

  // Carregar dados do usuário para o onboarding
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserRole(profile.role);
      setUserId(profile.id);
      setUserName(profile.name);
    }
  }, []);

  // Mostrar welcome se é primeira vez
  useEffect(() => {
    if (shouldShowOnboarding) {
      setShowWelcome(true);
    }
  }, [shouldShowOnboarding]);

  // Escutar mudanças de perfil
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const profile = event.detail;
      if (profile) {
        setUserRole(profile.role);
        setUserId(profile.id);
        setUserName(profile.name);
      }
    };

    window.addEventListener('userProfileUpdate', handleProfileUpdate as EventListener);
    return () => window.removeEventListener('userProfileUpdate', handleProfileUpdate as EventListener);
  }, []);

  const handleStartTour = () => {
    setShowWelcome(false);
    setShowTour(true);
  };

  const handleSkipWelcome = () => {
    setShowWelcome(false);
    hideOnboarding();
  };

  const handleCloseTour = () => {
    setShowTour(false);
    hideOnboarding();
  };

  const handleManualStartOnboarding = () => {
    // Reset onboarding state for manual start
    localStorage.removeItem('onboardingCompleted');
    if (userId) {
      localStorage.removeItem(`onboarding_${userId}`);
    }
    setShowWelcome(true);
  };

  return (
    <div className="flex min-h-screen bg-blue-bg">
      <Sidebar onStartOnboarding={handleManualStartOnboarding} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-blue-light/10 p-6">
          {children}
        </main>
      </div>
      
      {/* Welcome Screen */}
      {showWelcome && (
        <OnboardingWelcome
          userName={userName}
          userRole={userRole}
          onStartTour={handleStartTour}
          onSkip={handleSkipWelcome}
        />
      )}
      
      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showTour}
        onClose={handleCloseTour}
        userRole={userRole}
      />
    </div>
  );
}
