import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Layout from "./components/layout";
import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./pages/dashboard";
import Contracts from "./pages/contracts";
import Glosas from "./pages/glosas";
import MOE from "./pages/moe";
import Folha from "./pages/folha";
import Fringe from "./pages/fringe";
import Predictions from "./pages/predictions";
import Integrations from "./pages/integrations";
import ExecutiveDashboardPage from "./pages/executive-dashboard";
import FinancialAnalysisPage from "./pages/financial-analysis";
import Audit from "./pages/audit";
import Alerts from "./pages/alerts";
import Reports from "./pages/reports";
import Billing from "./pages/billing";
import PresentationPage from "./pages/presentation";
import AdminPanel from "./pages/admin";
import IACategorizacao from "./pages/ia-categorizacao";
import NotFound from "./pages/not-found";
import { useAdminShortcut } from "./components/secret-admin-access";

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Ativar atalho secreto do painel administrativo
  useAdminShortcut();

  // Verificar se há dados de perfil salvos (simula login persistente)
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    setIsLoggedIn(!!savedProfile);
  }, []);

  const handleLogin = (userData: { name: string; role: string; photo?: string | null; id: string; email: string }) => {
    // Salvar dados do usuário no localStorage
    const profile = { 
      id: userData.id,
      name: userData.name, 
      role: userData.role, 
      email: userData.email,
      photo: userData.photo || null,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    // Disparar evento imediato
    window.dispatchEvent(new CustomEvent('userProfileUpdate', { 
      detail: profile 
    }));
    
    setIsLoggedIn(true);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    window.dispatchEvent(new CustomEvent('userProfileUpdate', { 
      detail: null 
    }));
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <Login 
        onLogin={handleLogin} 
      />
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/glosas" component={Glosas} />
        <Route path="/moe" component={MOE} />
        <Route path="/folha" component={Folha} />
        <Route path="/fringe" component={Fringe} />
        <Route path="/predictions" component={Predictions} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/executive-dashboard" component={ExecutiveDashboardPage} />
        <Route path="/financial-analysis" component={FinancialAnalysisPage} />
        <Route path="/audit" component={Audit} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/reports" component={Reports} />
        <Route path="/billing" component={Billing} />
        <Route path="/faturamento" component={Billing} />
        <Route path="/presentation" component={PresentationPage} />
        <Route path="/ia-categorizacao" component={IACategorizacao} />
        <Route path="/admin-panel-secreto" component={AdminPanel} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
