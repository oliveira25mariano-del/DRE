import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Layout from "./components/layout";
import Login from "./components/login";
import Dashboard from "./pages/dashboard";
import Contracts from "./pages/contracts";
import Glosas from "./pages/glosas";
import MOE from "./pages/moe";
import Fringe from "./pages/fringe";
import Predictions from "./pages/predictions";
import Audit from "./pages/audit";
import Alerts from "./pages/alerts";
import Reports from "./pages/reports";
import NotFound from "./pages/not-found";

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar se há dados de perfil salvos (simula login persistente)
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    setIsLoggedIn(!!savedProfile);
  }, []);

  const handleLogin = (userData: { name: string; role: string; photo?: string | null }) => {
    // Salvar dados do usuário no localStorage
    const profile = { 
      name: userData.name, 
      role: userData.role, 
      photo: userData.photo || null,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    console.log('Perfil salvo no localStorage:', profile);
    
    // Usar setTimeout para garantir que o header já está montado
    setTimeout(() => {
      // Disparar evento customizado para notificar o header
      window.dispatchEvent(new CustomEvent('userProfileUpdate', { 
        detail: profile 
      }));
      console.log('Evento userProfileUpdate disparado');
    }, 100);
    
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/glosas" component={Glosas} />
        <Route path="/moe" component={MOE} />
        <Route path="/fringe" component={Fringe} />
        <Route path="/predictions" component={Predictions} />
        <Route path="/audit" component={Audit} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/reports" component={Reports} />
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
