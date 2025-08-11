import { useEffect, useState } from "react";

export interface UserProfile {
  name: string;
  role: string;
  photo?: string | null;
  loginTime: string;
}

export function usePermissions() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const updateProfile = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    };

    // Atualizar na inicialização
    updateProfile();

    // Escutar mudanças no perfil
    const handleProfileUpdate = (event: CustomEvent) => {
      setUserProfile(event.detail);
    };

    window.addEventListener('userProfileUpdate', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('userProfileUpdate', handleProfileUpdate as EventListener);
    };
  }, []);

  const canEdit = userProfile?.role === 'edit' || userProfile?.role === 'admin';
  const canView = true; // Todos podem visualizar
  const isVisualizationOnly = userProfile?.role === 'visualization';

  return {
    userProfile,
    canEdit,
    canView,
    isVisualizationOnly,
    userRole: userProfile?.role,
  };
}