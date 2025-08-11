import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Contracts from "@/pages/contracts";
import Glosas from "@/pages/glosas";
import MOE from "@/pages/moe";
import Fringe from "@/pages/fringe";
import Predictions from "@/pages/predictions";
import Audit from "@/pages/audit";
import Alerts from "@/pages/alerts";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
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
